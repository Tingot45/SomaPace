"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Edit3, Loader2 } from "lucide-react";
import { api, type ContentReview, type LessonSection } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { cn, formatDate, getSubjectEmoji } from "@/lib/utils";

export function ContentReview() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState<ContentReview | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [showRejectForm, setShowRejectForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["pending-reviews"],
    queryFn: () => api.getPendingReviews(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      setSelected(null);
      toastSuccess("Lesson approved!", "It's now live for students.");
    },
    onError: () => toastError("Failed to approve lesson"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.rejectLesson(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      setSelected(null);
      setShowRejectForm(false);
      setRejectReason("");
      toastSuccess("Lesson rejected", "The material will be reprocessed.");
    },
    onError: () => toastError("Failed to reject lesson"),
  });

  const reviews = data?.reviews ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-12rem)]">
        <SkeletonCard className="h-full" />
        <SkeletonCard className="h-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-12rem)]">
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Review Queue</span>
            <Badge variant="secondary">{reviews.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1.5">
              {reviews.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelected(r); setEditMode(false); setShowRejectForm(false); }}
                  className={cn(
                    "w-full text-left rounded-lg p-3 text-sm transition-colors min-h-[48px]",
                    selected?.id === r.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  )}
                >
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getSubjectEmoji(r.subject)} Grade {r.grade} · {formatDate(r.createdAt)}
                  </p>
                </button>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  All caught up!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        {selected ? (
          <>
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{selected.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {getSubjectEmoji(selected.subject)} {selected.subject} · Grade {selected.grade}
                  {selected.sourceMaterialName && ` · Source: ${selected.sourceMaterialName}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditMode(!editMode)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  {selected.lessonContent.objectives.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">Learning Objectives</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selected.lessonContent.objectives.map((obj, i) => (
                          <li key={i} className="text-foreground">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.lessonContent.sections.map((section, i) => (
                    <ReviewSection key={i} section={section} editMode={editMode} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t border-border p-4 space-y-3">
              {showRejectForm && (
                <Input
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
              <div className="flex gap-2">
                {!showRejectForm ? (
                  <Button variant="outline" onClick={() => setShowRejectForm(true)} className="text-destructive hover:text-destructive">
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate({ id: selected.id, reason: rejectReason })}
                      disabled={!rejectReason.trim() || rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                      Confirm Reject
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowRejectForm(false); setRejectReason(""); }}>
                      Cancel
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => approveMutation.mutate(selected.id)}
                  disabled={approveMutation.isPending}
                  className="ml-auto bg-emerald-600 hover:bg-emerald-700"
                >
                  {approveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Select a lesson to review</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReviewSection({ section, editMode }: { section: LessonSection; editMode: boolean }) {
  const iconMap: Record<string, string> = {
    hook: "💡",
    objective: "🎯",
    explanation: "📖",
    worked_example: "✍️",
    kenyan_application: "🇰🇪",
    diagram: "📊",
    misconception: "⚠️",
    summary: "✅",
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
        <span>{iconMap[section.type] ?? "📄"}</span>
        {section.title}
      </h3>
      {typeof section.content === "string" && (
        <p className={cn("text-sm text-foreground/80", editMode && "border border-dashed border-primary/40 rounded p-2")}>
          {section.content}
        </p>
      )}
      {Array.isArray(section.content) && (
        <div className="space-y-1.5">
          {section.content.map((para, i) => (
            <p key={i} className="text-sm text-foreground/80">{para}</p>
          ))}
        </div>
      )}
      {section.items && (
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 mt-2">
          {section.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
      {section.subsections && (
        <div className="space-y-3 mt-3">
          {section.subsections.map((sub, i) => (
            <div key={i}>
              <p className="font-medium text-sm">{sub.heading}</p>
              <p className="text-sm text-foreground/80 mt-0.5">{sub.body}</p>
            </div>
          ))}
        </div>
      )}
      {section.mermaid && (
        <pre className="mt-2 rounded bg-muted p-3 text-xs font-mono overflow-x-auto">{section.mermaid}</pre>
      )}
    </div>
  );
}