"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FlashcardReviewer } from "@/components/student/FlashcardReviewer";

export default function FlashcardsPage({ params }: { params: { topicId: string } }) {
  return (
    <ProtectedRoute>
      <FlashcardReviewer topicId={params.topicId} />
    </ProtectedRoute>
  );
}