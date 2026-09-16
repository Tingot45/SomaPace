"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TopicList } from "@/components/student/TopicList";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectTopicsPage({ params }: { params: { subjectId: string } }) {
  const { subjectId } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => api.getSubjects().then((res) => res.subjects.find((s) => s.id === subjectId)),
  });

  return (
    <ProtectedRoute>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/subjects" className="hover:text-foreground transition-colors flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> Subjects
          </a>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium capitalize">{data?.name ?? subjectId}</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {data?.emoji ? `${data.emoji} ` : ""}{data?.name ?? subjectId}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {data?.gradeRange
                ? `Aligned to the CBC curriculum for ${data.gradeRange[0]}–${data.gradeRange[1]}. `
                : ""}
              Pick a topic and let&apos;s make progress — one 10-minute lesson at a time.
            </p>
          </div>
        )}

        <TopicList subjectId={subjectId} subjectName={data?.name} />
      </div>
    </ProtectedRoute>
  );
}