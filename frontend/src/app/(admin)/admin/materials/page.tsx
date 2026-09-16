"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { MaterialUploader } from "@/components/admin/MaterialUploader";
import { MaterialList } from "@/components/admin/MaterialList";

export default function AdminMaterialsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload curriculum materials — we&apos;ll turn them into structured lessons.
          </p>
        </div>
        <MaterialUploader />
        <MaterialList />
      </div>
    </RoleGuard>
  );
}