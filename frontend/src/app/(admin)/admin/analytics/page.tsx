"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Analytics } from "@/components/admin/Analytics";

export default function AdminAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Analytics />
    </RoleGuard>
  );
}