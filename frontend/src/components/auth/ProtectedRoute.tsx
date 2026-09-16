"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token } = useStore();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated || !token) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setChecking(false);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, router, pathname]);

  if (checking) {
    return (
      fallback || (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}