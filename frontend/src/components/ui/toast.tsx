"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

let toastId = 0;
const toastsState: ToastItem[] = [];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

function useToasts(): [ToastItem[], (id: string) => void] {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  const dismiss = React.useCallback((id: string) => {
    const idx = toastsState.findIndex((t) => t.id === id);
    if (idx !== -1) toastsState.splice(idx, 1);
    notifyListeners();
  }, []);

  return [toastsState, dismiss];
}

export function toast(props: Omit<ToastItem, "id">): string {
  const id = `toast-${++toastId}`;
  const item: ToastItem = { id, variant: "default", duration: 4500, ...props };
  toastsState.push(item);
  notifyListeners();
  if (item.duration && item.duration > 0) {
    setTimeout(() => {
      const idx = toastsState.findIndex((t) => t.id === id);
      if (idx !== -1) {
        toastsState.splice(idx, 1);
        notifyListeners();
      }
    }, item.duration);
  }
  return id;
}

function toastSuccess(title: string, description?: string) {
  return toast({ title, description, variant: "success" });
}

function toastError(title: string, description?: string) {
  return toast({ title, description, variant: "destructive", duration: 6000 });
}

function toastWarning(title: string, description?: string) {
  return toast({ title, description, variant: "warning", duration: 5000 });
}

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-background p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-border",
        success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/80",
        destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/80",
        warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/80",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
  destructive: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />,
  warning: <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
};

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onDismiss?: () => void;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant, title, description, onDismiss, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {variantIcons[variant ?? "default"]}
      <div className="flex-1 min-w-0">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
        {children}
      </div>
      {onDismiss && (
        <ToastClose onClick={onDismiss} />
      )}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-snug", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastSuccess,
  toastError,
  toastWarning,
  useToasts,
};