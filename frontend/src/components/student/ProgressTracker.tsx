"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame, Trophy } from "lucide-react";
import { api, type DashboardData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getWeeklyDays, getDayName, formatNumber } from "@/lib/utils";

export function ProgressTracker() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboard,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const weeklyDays = getWeeklyDays();
  const maxMinutes = Math.max(...data.weeklyMinutes, 1);
  const xpForNextLevel = (data.user.level + 1) * 500;
  const xpProgress = Math.min(100, (data.user.xp / xpForNextLevel) * 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-40">
            {data.weeklyMinutes.map((min, i) => {
              const pct = (min / maxMinutes) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {min > 0 ? `${min}m` : ""}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all",
                        min > 0 ? "bg-primary" : "bg-muted"
                      )}
                      style={{ height: `${Math.max(pct, min > 0 ? 10 : 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {getDayName(weeklyDays[i], true)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total this week</span>
            <span className="font-semibold text-foreground">{data.weeklyMinutes.reduce((a, b) => a + b, 0)} minutes</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <div className="relative">
                  <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeDasharray={`${xpProgress} ${100 - xpProgress}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">{data.user.level}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{data.user.level}</p>
              </div>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatNumber(data.user.xp)} / {formatNumber(xpForNextLevel)} XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <Flame className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{data.user.streak}</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weeklyDays.map((day, i) => {
                const active = data.user.streak > 0 && i >= 6 - data.user.streak;
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-5 w-full rounded-sm transition-colors",
                      active ? "bg-primary" : "bg-muted"
                    )}
                    title={day}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {data.user.streak > 0 ? `${data.user.streak}-day streak` : "Start today!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.badges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {data.badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center text-center">
                  <span className="text-3xl">{badge.emoji}</span>
                  <p className="text-[11px] font-medium mt-1">{badge.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}