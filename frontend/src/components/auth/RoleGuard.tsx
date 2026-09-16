"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || !user) return null;

  if (!authorized) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            You don&apos;t have permission to access this page. Please contact an admin if you believe this is a mistake.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}