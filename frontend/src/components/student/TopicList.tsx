"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Timer, MessageSquare, Brain, ChevronRight } from "lucide-react";
import { api, type Topic } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { cn, getDifficultyBadge, getSubjectEmoji } from "@/lib/utils";

interface TopicListProps {
  subjectId: string;
  subjectName?: string;
}

export function TopicList({ subjectId, subjectName }: TopicListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["topics", subjectId],
    queryFn: () => api.getTopics(subjectId),
  });

  const topics = data?.topics ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-muted-foreground mb-4">Failed to load topics.</p>
        <button onClick={() => window.location.reload()} className="text-primary text-sm font-medium hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">
          {subjectName || subjectId} Topics
        </h2>
        <Badge variant="secondary">{topics.length}</Badge>
      </div>

      {topics.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">No topics available yet</p>
            <p className="text-sm text-muted-foreground mt-1">We're adding content — check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const percent = topic.progress?.percent ?? 0;
  return (
    <Link href={`/topics/${topic.id}`} className="block tap-highlight-none">
      <Card className="h-full transition-all hover:shadow-lift hover:border-primary/30 group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <Badge className={cn("text-[10px] font-semibold", getDifficultyBadge(topic.difficulty))}>
              {topic.difficulty}
            </Badge>
            {topic.progress?.completed && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                ✓ Completed
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {topic.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {topic.description}
          </p>

          <div className="mt-3">
            <Progress value={percent} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1">{percent}% complete</p>
          </div>

          <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {topic.lessonCount} lesson{topic.lessonCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {topic.quizCount} quiz{topic.quizCount !== 1 ? "zes" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3" /> {topic.flashcardCount}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Timer className="h-3 w-3" /> {topic.estimatedMinutes}m
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}