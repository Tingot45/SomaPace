from __future__ import annotations

import base64
import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

SANDBOX_URL = "https://sandbox.safaricom.co.ke"
PRODUCTION_URL = "https://api.safaricom.co.ke"


def _base_url() -> str:
    return PRODUCTION_URL if settings.MPESA_ENV == "production" else SANDBOX_URL


async def get_access_token() -> str:
    """Obtain OAuth access token from Safaricom Daraja API."""
    url = f"{_base_url()}/oauth/v1/generate"
    creds = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
    encoded = base64.b64encode(creds.encode()).decode()
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, headers={"Authorization": f"Basic {encoded}"})
        resp.raise_for_status()
        data = resp.json()
    return data["access_token"]


def _generate_password() -> str:
    """Generate the base64-encoded Daraja password from shortcode + passkey + timestamp."""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    data_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    encoded = base64.b64encode(data_str.encode()).decode()
    return encoded


async def initiate_stk_push(
    phone_number: str,
    amount: float,
    account_ref: str,
) -> dict[str, Any]:
    """Initiate M-Pesa STK push to the customer's phone.

    Returns the full response dict including CheckoutRequestID.
    """
    token = await get_access_token()
    url = f"{_base_url()}/mpesa/stkpush/v1/processrequest"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    password = _generate_password()

    normalized_phone = phone_number.lstrip("+").lstrip("0")
    if not normalized_phone.startswith("254"):
        normalized_phone = "254" + normalized_phone

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(round(amount)),
        "PartyA": normalized_phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": normalized_phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_ref[:12],
        "TransactionDesc": f"SomaPace Payment - {account_ref}",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def check_transaction_status(checkout_request_id: str) -> dict[str, Any]:
    """Query the status of an STK push transaction."""
    token = await get_access_token()
    url = f"{_base_url()}/mpesa/transactionstatus/v1/query"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    password = _generate_password()

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
        return resp.json()


def parse_mpesa_callback(callback_data: dict[str, Any]) -> dict[str, Any]:
    """Parse and validate M-Pesa callback data.

    Extracts the key fields from the nested callback structure.
    """
    body = callback_data.get("Body", callback_data)
    stk_callback = body.get("stkCallback", body)

    result_code = stk_callback.get("ResultCode")
    result_desc = stk_callback.get("ResultDesc", "")

    callback_metadata = stk_callback.get("CallbackMetadata", {})
    metadata_items = callback_metadata.get("Item", [])

    parsed: dict[str, Any] = {
        "ResultCode": result_code,
        "ResultDesc": result_desc,
    }

    for item in metadata_items:
        name = item.get("Name", "")
        value = item.get("Value")
        if name == "MpesaReceiptNumber":
            parsed["MpesaReceiptNumber"] = value
        elif name == "TransactionDate":
            parsed["TransactionDate"] = value
        elif name == "PhoneNumber":
            parsed["PhoneNumber"] = value
        elif name == "Amount":
            parsed["Amount"] = value
        elif name == "CheckoutRequestID":
            parsed["CheckoutRequestID"] = value
        elif name == "MerchantRequestID":
            parsed["MerchantRequestID"] = value

    return parsed
