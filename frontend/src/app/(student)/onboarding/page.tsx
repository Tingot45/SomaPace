"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OnboardingFlow } from "@/components/student/OnboardingFlow";

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingFlow />
    </ProtectedRoute>
  );
}