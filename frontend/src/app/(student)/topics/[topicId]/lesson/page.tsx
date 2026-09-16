"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LessonPlayer } from "@/components/student/LessonPlayer";

export default function LessonPage({ params }: { params: { topicId: string } }) {
  return (
    <ProtectedRoute>
      <LessonPlayer topicId={params.topicId} />
    </ProtectedRoute>
  );
}