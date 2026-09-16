"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { cn, getGradeLabel } from "@/lib/utils";

const gradeOptions = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 4),
  label: getGradeLabel(i + 4),
}));

export function RegisterForm() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "+254",
    password: "",
    confirmPassword: "",
    grade: "",
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const registerMutation = useMutation({
    mutationFn: () =>
      api.register({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        password: form.password,
        grade: Number(form.grade),
        termsAccepted: form.termsAccepted,
      }),
    onSuccess: (data) => {
      login(data.user, data.token, data.refreshToken);
      router.push("/onboarding");
    },
    onError: (err: Error & { data?: { detail?: string } }) => {
      setErrors({ root: err.data?.detail || err.message || "Registration failed. Please try again." });
    },
  });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.phone.startsWith("+254") || form.phone.length < 12)
      errs.phone = "Please enter a valid +254 phone number";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.grade) errs.grade = "Please select your grade";
    if (!form.termsAccepted) errs.termsAccepted = "Please accept the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) registerMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.root && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium" role="alert">
          {errors.root}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          placeholder="Wanjiku"
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          error={errors.firstName}
          icon={<User className="h-4 w-4" />}
          required
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          placeholder="Kamau"
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          error={errors.lastName}
          required
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Phone Number"
        type="tel"
        placeholder="+254 7XX XXX XXX"
        value={form.phone}
        onChange={(e) => updateField("phone", e.target.value)}
        icon={<Phone className="h-4 w-4" />}
        error={errors.phone}
        required
        autoComplete="tel"
      />

      <SelectField
        label="Your Grade"
        placeholder="Select your grade"
        value={form.grade}
        onValueChange={(v) => updateField("grade", v)}
        options={gradeOptions}
        error={errors.grade}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          icon={<Lock className="h-4 w-4" />}
          error={errors.password}
          required
          autoComplete="new-password"
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

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChange={(e) => updateField("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
      />

      <label
        className={cn(
          "flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors min-h-[44px]",
          errors.termsAccepted ? "border-destructive" : form.termsAccepted ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
        )}
      >
        <div className="pt-0.5">
          <input
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(e) => updateField("termsAccepted", e.target.checked)}
            className="sr-only peer"
          />
          <div className="h-5 w-5 rounded border-2 border-border peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-colors">
            {form.termsAccepted && <Check className="h-3.5 w-3.5 text-white" />}
          </div>
        </div>
        <span className="text-sm text-foreground">
          I agree to SomaPace&apos;s{" "}
          <Link href="#" className="text-primary hover:underline font-medium">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="text-primary hover:underline font-medium">Privacy Policy</Link>
        </span>
      </label>
      {errors.termsAccepted && (
        <p className="text-xs text-destructive font-medium">{errors.termsAccepted}</p>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base"
        loading={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Creating your account..." : "Create Free Account"}
        {!registerMutation.isPending && <ArrowRight className="h-4 w-4" />}
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}