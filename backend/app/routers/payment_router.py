from __future__ import annotations

import uuid as _uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import Payment, PaymentMethod, PaymentStatus, Subscription, User
from app.schemas import (
    MpesaCallbackPayload,
    PaymentInitRequest,
    PaymentStatusResponse,
    SubscriptionResponse,
)
from app.services.mpesa_service import (
    check_transaction_status,
    initiate_stk_push,
    parse_mpesa_callback,
)

router = APIRouter(prefix="/api/payments", tags=["payments"])

SUBSCRIPTION_DAYS = 365


def _get_subscription_end() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=SUBSCRIPTION_DAYS)


async def _get_or_create_payment(
    user: User,
    amount: Decimal,
    db: AsyncSession,
    transaction_id: str,
) -> Payment:
    result = await db.execute(
        select(Payment)
        .where(Payment.transaction_id == transaction_id)
        .order_by(Payment.created_at.desc())
        .limit(1)
    )
    if payment := result.scalar_one_or_none():
        return payment
    payment = Payment(
        user_id=user.id,
        amount_kes=amount,
        payment_method=PaymentMethod.mpesa,
        status=PaymentStatus.processing,
        transaction_id=transaction_id,
        valid_until=_get_subscription_end(),
    )
    db.add(payment)
    await db.flush()
    return payment


@router.post("/init", response_model=PaymentStatusResponse, status_code=201)
async def init_payment(
    body: PaymentInitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaymentStatusResponse:
    account_ref = f"SOMA{current_user.id.hex[:8].upper()}"
    base_amount = float(body.amount_kes)

    try:
        response = await initiate_stk_push(body.phone_number, base_amount, account_ref)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to initiate STK push: {exc}") from exc

    checkout_id = response.get("CheckoutRequestID", "")
    payment = await _get_or_create_payment(current_user, body.amount_kes, db, checkout_id)
    await db.refresh(payment)
    return PaymentStatusResponse.model_validate(payment)


@router.post("/callback")
async def mpesa_callback(
    payload: MpesaCallbackPayload,
    db: AsyncSession = Depends(get_db),
) -> dict:
    parsed = parse_mpesa_callback(payload.model_dump())
    checkout_id: str = parsed.get("CheckoutRequestID", "")
    if not checkout_id:
        raise HTTPException(status_code=400, detail="Missing CheckoutRequestID")

    result_code = parsed.get("ResultCode")
    result_desc = parsed.get("ResultDesc", "")

    result = await db.execute(select(Payment).where(Payment.transaction_id == checkout_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    if result_code == 0:
        payment.status = PaymentStatus.completed
        payment.mpesa_receipt = str(parsed.get("MpesaReceiptNumber", ""))
        payment.completed_at = datetime.now(timezone.utc)

        subscription = Subscription(
            user_id=payment.user_id,
            payment_id=payment.id,
            plan="annual",
            start_date=datetime.now(timezone.utc),
            end_date=_get_subscription_end(),
            is_active=True,
        )
        db.add(subscription)
    else:
        payment.status = PaymentStatus.failed

    await db.flush()
    return {"ResultCode": 0, "ResultDesc": "Success"}


@router.get("/query/{transaction_id}", response_model=PaymentStatusResponse)
async def query_payment(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaymentStatusResponse:
    if not settings.MPESA_PASSKEY:
        raise HTTPException(status_code=503, detail="M-Pesa not configured")
    status_data = await check_transaction_status(transaction_id)

    result = await db.execute(select(Payment).where(Payment.transaction_id == transaction_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    result_code = int(status_data.get("ResultCode", 1032))
    if result_code == 0 and payment.status != PaymentStatus.completed:
        payment.status = PaymentStatus.completed
        payment.mpesa_receipt = str(status_data.get("MpesaReceiptNumber", ""))
        payment.completed_at = datetime.now(timezone.utc)
        subscription = Subscription(
            user_id=payment.user_id,
            payment_id=payment.id,
            plan="annual",
            start_date=datetime.now(timezone.utc),
            end_date=_get_subscription_end(),
            is_active=True,
        )
        db.add(subscription)
        await db.flush()
    elif result_code not in (0, 1032, 1037, 1039) and payment.status == PaymentStatus.processing:
        payment.status = PaymentStatus.failed
        await db.flush()

    await db.refresh(payment)
    return PaymentStatusResponse.model_validate(payment)


@router.get("/subscription", response_model=SubscriptionResponse | None)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SubscriptionResponse | None:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == current_user.id)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    sub = result.scalar_one_or_none()
    if sub is None:
        return None
    if sub.is_active and sub.end_date < now:
        sub.is_active = False
        await db.flush()
    return SubscriptionResponse.model_validate(sub) if sub else None