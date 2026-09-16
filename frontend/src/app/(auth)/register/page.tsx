"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  React.useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <Link href="/" className="flex items-center gap-2.5 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">
          Soma<span className="text-primary">Pace</span>
        </span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your free account</CardTitle>
          <CardDescription>Start learning at your own pace in under 2 minutes</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <RegisterForm />
        </div>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground max-w-xs text-center">
        Free account includes 3 sample lessons. Full year access is just KES 700.
      </p>
    </div>
  );
}