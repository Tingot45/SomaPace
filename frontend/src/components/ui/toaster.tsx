"use client";

import { ToastProvider, ToastViewport, Toast, useToasts } from "./toast";

export function Toaster() {
  const [toasts, dismiss] = useToasts();

  return (
    <ToastProvider swipeDirection="right" duration={4500}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id);
          }}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}