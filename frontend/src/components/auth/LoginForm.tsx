"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [phone, setPhone] = React.useState("+254");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [fieldError, setFieldError] = React.useState("");

  const loginMutation = useMutation({
    mutationFn: () => api.login(phone, password),
    onSuccess: (data) => {
      login(data.user, data.token, data.refreshToken);
      if (!data.user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err: Error & { status?: number }) => {
      if (err.status === 401) {
        setFieldError("Invalid phone number or password. Please try again.");
      } else {
        setFieldError(err.message || "Something went wrong. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    if (!phone || phone.length < 12) {
      setFieldError("Please enter a valid Kenyan phone number (+254...)");
      return;
    }
    if (!password || password.length < 6) {
      setFieldError("Password must be at least 6 characters.");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {fieldError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium" role="alert">
          {fieldError}
        </div>
      )}

      <Input
        label="Phone Number"
        type="tel"
        placeholder="+254 7XX XXX XXX"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setFieldError("");
        }}
        icon={<Phone className="h-4 w-4" />}
        error={fieldError && !phone.startsWith("+254") ? "Phone must start with +254" : undefined}
        required
        autoComplete="tel"
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldError("");
          }}
          icon={<Lock className="h-4 w-4" />}
          required
          autoComplete="current-password"
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground p-1 rounded"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base"
        loading={loginMutation.isPending}
      >
        {loginMutation.isPending ? "Signing in..." : "Sign In"}
        {!loginMutation.isPending && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
          Create one free
        </Link>
      </p>
    </form>
  );
}