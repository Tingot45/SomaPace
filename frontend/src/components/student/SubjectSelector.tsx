"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { api, type Subject } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getSubjectEmoji, getSubjectColor, getGradeLabel } from "@/lib/utils";

interface SubjectSelectorProps {
  grade?: number;
  showProgress?: boolean;
}

export function SubjectSelector({ grade, showProgress = true }: SubjectSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["subjects", grade],
    queryFn: () => api.getSubjects(grade ? { grade } : undefined),
  });

  const subjects = data?.subjects ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {subjects.map((subject) => (
        <Link
          key={subject.id}
          href={`/subjects/${subject.id}/topics`}
          className="group block tap-highlight-none"
        >
          <Card className="h-full transition-all hover:shadow-lift hover:border-primary/30">
            <CardContent className="p-5 flex flex-col items-center text-center h-full">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl text-3xl mb-3 transition-transform group-hover:scale-110",
                getSubjectColor(subject.name)
              )}>
                {subject.emoji || getSubjectEmoji(subject.name)}
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                {subject.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subject.topics} topic{subject.topics !== 1 ? "s" : ""}
              </p>
              {showProgress && subject.progress > 0 && (
                <div className="w-full mt-3">
                  <Progress value={subject.progress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">{subject.progress}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}

      {subjects.length === 0 && (
        <div className="col-span-full flex flex-col items-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No subjects found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {grade ? `No subjects for ${getGradeLabel(grade)} yet` : "Select a grade to view subjects"}
          </p>
        </div>
      )}
    </div>
  );
}