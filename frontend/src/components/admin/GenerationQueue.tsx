"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Clock, CheckCircle, AlertCircle, Play, Loader } from "lucide-react";
import { api, type GenerationJob } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { cn, getTimeAgo, getSubjectEmoji } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  queued: {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    label: "Queued",
  },
  processing: {
    icon: <Loader className="h-4 w-4 animate-spin" />,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    label: "Processing",
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    label: "Completed",
  },
  failed: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    label: "Failed",
  },
};

export function GenerationQueue() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["generation-queue"],
    queryFn: api.getGenerationQueue,
    refetchInterval: 5000,
  });

  const triggerMutation = useMutation({
    mutationFn: (job: GenerationJob) =>
      api.triggerGeneration({ materialId: job.materialId, grade: job.grade, subject: job.subject }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generation-queue"] });
      toastSuccess("Generation started");
    },
    onError: () => toastError("Failed to start generation"),
  });

  const jobs = data?.jobs ?? [];
  const activeJobs = jobs.filter((j) => j.status === "processing");
  const queuedJobs = jobs.filter((j) => j.status === "queued");
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");

  const totalActive = activeJobs.length + queuedJobs.length;
  const avgEstimate = activeJobs.reduce((sum, j) => sum + (j.estimatedTimeSec ?? 120), 0) / Math.max(activeJobs.length, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Generation Queue</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Active" value={totalActive} icon={<Loader className="h-4 w-4 text-blue-500" />} />
        <MiniStat label="Completed" value={completedJobs.length} icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} />
        <MiniStat label="Failed" value={failedJobs.length} icon={<AlertCircle className="h-4 w-4 text-red-500" />} />
        <MiniStat label="Est. Time" value={`${Math.round(avgEstimate)}s`} icon={<Clock className="h-4 w-4 text-amber-500" />} />
      </div>

      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium">Queue is empty</p>
              <p className="text-xs mt-1">Upload materials to start generating lessons</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...activeJobs, ...queuedJobs, ...failedJobs, ...completedJobs].map((job) => {
                const cfg = STATUS_CONFIG[job.status];
                return (
                  <div key={job.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/30">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cfg.color)}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{job.materialName}</p>
                      <p className="text-xs text-muted-foreground">
                        {getSubjectEmoji(job.subject)} {job.subject} · Grade {job.grade}
                        {job.estimatedTimeSec && job.status === "processing" && ` · ETA: ${job.estimatedTimeSec}s`}
                      </p>
                      {job.status === "processing" && (
                        <Progress value={50} className="h-1 mt-1.5" />
                      )}
                    </div>
                    <Badge className={cn("text-[10px]", cfg.color)}>{cfg.label}</Badge>
                    {job.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerMutation.mutate(job)}
                        disabled={triggerMutation.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" /> Retry
                      </Button>
                    )}
                    {job.completedAt && (
                      <span className="text-[10px] text-muted-foreground hidden sm:block">{getTimeAgo(new Date(job.completedAt))}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}