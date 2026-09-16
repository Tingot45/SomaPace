"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, BarChart3 } from "lucide-react";
import { api, type AdminStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { cn, formatNumber, getSubjectEmoji } from "@/lib/utils";

export function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-muted-foreground mb-4">Failed to load analytics.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const s = data!;
  const subjectEntries = Object.entries(s.lessonsPerSubject).sort((a, b) => b[1] - a[1]);
  const maxSubjectLessons = Math.max(...subjectEntries.map(([, v]) => v), 1);

  const mockQuizPassRates = [
    { subject: "Mathematics", rate: 72 },
    { subject: "English", rate: 85 },
    { subject: "Science", rate: 68 },
    { subject: "Kiswahili", rate: 91 },
    { subject: "Social Studies", rate: 78 },
  ];

  const mockDropoutFunnel = [
    { step: "Sign up", count: s.totals.students, pct: 100 },
    { step: "Complete onboarding", count: Math.round(s.totals.students * 0.85), pct: 85 },
    { step: "First lesson", count: Math.round(s.totals.students * 0.72), pct: 72 },
    { step: "Complete quiz", count: Math.round(s.totals.students * 0.58), pct: 58 },
    { step: "1-week streak", count: Math.round(s.totals.students * 0.34), pct: 34 },
    { step: "Paid subscriber", count: Math.round(s.totals.students * 0.12), pct: 12 },
  ];

  const mockEngagement = [
    { label: "Avg. sessions/week", value: "3.2" },
    { label: "Avg. time/session", value: "8m 24s" },
    { label: "Avg. lessons/week", value: "4.7" },
    { label: "Completion rate", value: "62%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(s.totals.students)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lessons Generated</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(s.totals.lessonsGenerated)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold mt-1">KES {formatNumber(s.totals.revenueKES)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Reviews</p>
            <p className="text-2xl font-bold mt-1">{s.totals.pendingReviews}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Lessons by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectEntries.map(([subject, count]) => (
                <div key={subject}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5">
                      <span>{getSubjectEmoji(subject)}</span>
                      <span className="capitalize">{subject}</span>
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / maxSubjectLessons) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {subjectEntries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" /> Quiz Pass Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockQuizPassRates.map((item) => (
                <div key={item.subject}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{item.subject}</span>
                    <span className={cn("font-semibold", item.rate >= 80 ? "text-emerald-600" : item.rate >= 60 ? "text-amber-600" : "text-red-600")}>
                      {item.rate}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", item.rate >= 80 ? "bg-emerald-500" : item.rate >= 60 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">User Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockDropoutFunnel.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-xs text-muted-foreground text-right">{step.step}</div>
                  <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-primary/70 rounded-lg transition-all flex items-center px-2"
                      style={{ width: `${step.pct}%` }}
                    >
                      {step.pct > 15 && (
                        <span className="text-[11px] font-medium text-white">{step.count}</span>
                      )}
                    </div>
                    {step.pct <= 15 && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-foreground">
                        {step.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{step.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" /> Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {mockEngagement.map((metric) => (
                <div key={metric.label} className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}