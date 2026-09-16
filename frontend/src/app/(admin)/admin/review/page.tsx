"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { ContentReview } from "@/components/admin/ContentReview";

export default function AdminReviewPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review AI-generated lessons against their source material before publishing.
          </p>
        </div>
        <ContentReview />
      </div>
    </RoleGuard>
  );
}