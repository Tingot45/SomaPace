"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubjectSelector } from "@/components/student/SubjectSelector";

export default function SubjectsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Choose a Subject</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Pick a subject and let&apos;s dive into bite-sized learning together.
          </p>
        </div>
        <SubjectSelector />
      </div>
    </ProtectedRoute>
  );
}