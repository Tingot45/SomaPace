"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GenerationQueue } from "@/components/admin/GenerationQueue";

export default function AdminHomePage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-8">
        <AdminDashboard />
        <GenerationQueue />
      </div>
    </RoleGuard>
  );
}