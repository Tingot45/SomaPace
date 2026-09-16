"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, FileText, DollarSign, Clock, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import { api, type AdminStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { cn, formatNumber, formatPriceKES, getTimeAgo } from "@/lib/utils";

export function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive/40 mb-3" />
        <p className="font-medium">Failed to load admin stats</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const s = data!;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={formatNumber(s.totals.users)} sub={`${formatNumber(s.totals.students)} students`} color="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Materials" value={formatNumber(s.totals.materials)} sub="uploaded" color="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Lessons" value={formatNumber(s.totals.lessonsGenerated)} sub="generated" color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenue" value={formatPriceKES(s.totals.revenueKES)} sub="total" color="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Reviews"
          value={String(s.totals.pendingReviews)}
          sub="lessons"
          color={s.totals.pendingReviews > 0 ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"}
        />
        <Link href="/admin/review" className="block tap-highlight-none">
          <Card className="h-full hover:shadow-lift hover:border-primary/30 transition-all">
            <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[100px]">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Review Queue</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lessons by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(s.lessonsPerSubject).map(([subject, count]) => {
                const maxVal = Math.max(...Object.values(s.lessonsPerSubject));
                const pct = (count / maxVal) * 100;
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{subject}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(s.lessonsPerSubject).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Sign-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-32">
              {s.weeklySignups.map((count, i) => {
                const maxVal = Math.max(...s.weeklySignups, 1);
                const pct = (count / maxVal) * 100;
                const days = ["S", "M", "T", "W", "T", "F", "S"];
                const dayIdx = (new Date().getDay() - 6 + i + 7) % 7;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {count > 0 ? count : ""}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={cn("w-full rounded-t-md", count > 0 ? "bg-somapace-blue" : "bg-muted")}
                        style={{ height: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{days[dayIdx]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {s.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.recentActivity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 h-2 w-2 rounded-full shrink-0",
                    a.type.includes("upload") ? "bg-purple-500" : a.type.includes("review") ? "bg-emerald-500" : "bg-primary"
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{getTimeAgo(new Date(a.at))}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}