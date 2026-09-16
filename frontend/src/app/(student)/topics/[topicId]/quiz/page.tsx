"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { QuizPlayer } from "@/components/student/QuizPlayer";

export default function QuizPage({ params }: { params: { topicId: string } }) {
  return (
    <ProtectedRoute>
      <QuizPlayer topicId={params.topicId} />
    </ProtectedRoute>
  );
}