"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Zap, TrendingUp, Clock, BookOpen, ArrowRight, Flame, Trophy, Star } from "lucide-react";
import { api, type DashboardData } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { cn, getSubjectEmoji, getGradeLabel, formatNumber, getTimeAgo } from "@/lib/utils";

export function Dashboard() {
  const user = useStore((s) => s.user);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboard,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground mb-4">Failed to load your dashboard.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const d = data!;
  const xpForNextLevel = (d.user.level + 1) * 500;
  const xpProgress = Math.min(100, (d.user.xp / xpForNextLevel) * 100);
  const greeting = getGreeting();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {greeting}, {user?.firstName ?? "Learner"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Grade {getGradeLabel(d.user.grade)} · {d.user.streak > 0 ? `${d.user.streak}-day streak 🔥` : "Let's start a streak today!"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full -translate-y-6 translate-x-6" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Streak</span>
            </div>
            <p className="text-3xl font-bold">{d.user.streak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">days in a row</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-6 translate-x-6" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total XP</span>
            </div>
            <p className="text-3xl font-bold">{formatNumber(d.user.xp)}</p>
            <div className="mt-1.5">
              <Progress value={xpProgress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Level {d.user.level} · {xpProgress.toFixed(0)}% to next</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-somapace-blue/10 rounded-full -translate-y-6 translate-x-6" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-somapace-blue/10">
                <TrendingUp className="h-4 w-4 text-somapace-blue" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Level</span>
            </div>
            <p className="text-3xl font-bold">{d.user.level}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep going, you're doing great!
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full -translate-y-6 translate-x-6" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Badges</span>
            </div>
            <p className="text-3xl font-bold">{d.badges.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {d.badges.length > 0 ? "earned so far" : "start earning badges"}
            </p>
          </CardContent>
        </Card>
      </div>

      {d.recommendation && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-medium mb-1">TODAY&apos;S 10-MINUTE LESSON</p>
                <h3 className="font-semibold text-lg text-foreground">{d.recommendation.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {d.recommendation.subject} · ~{d.recommendation.minutes} min
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href={`/topics/${d.recommendation.topicId}/lesson`}>
                    Start Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {d.continueLearning && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/topics/${d.continueLearning.id}/lesson`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors tap-highlight-none"
            >
              <div>
                <p className="font-medium text-foreground">{d.continueLearning.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getSubjectEmoji(d.continueLearning.subjectId)} {d.continueLearning.subjectId} · {d.continueLearning.estimatedMinutes} min
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{d.continueLearning.progress?.percent ?? 0}%</p>
                  <Progress value={d.continueLearning.progress?.percent ?? 0} className="h-1.5 w-16 mt-1" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {d.weeklyMinutes.map((min, i) => {
                const maxVal = Math.max(...d.weeklyMinutes, 1);
                const height = (min / maxVal) * 100;
                const dayLabel = ["S", "M", "T", "W", "T", "F", "S"];
                const dayIdx = (new Date().getDay() - 6 + i + 7) % 7;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all min-h-[2px]",
                          min > 0 ? "bg-primary" : "bg-muted"
                        )}
                        style={{ height: `${Math.max(height, min > 0 ? 8 : 2)}%` }}
                        title={`${min} minutes`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{dayLabel[dayIdx]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              {d.weeklyMinutes.reduce((a, b) => a + b, 0)} minutes this week
            </p>
          </CardContent>
        </Card>

        {d.badges.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" /> Badges Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {d.badges.slice(0, 6).map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center">
                    <span className="text-2xl">{badge.emoji}</span>
                    <p className="text-xs font-medium mt-1 truncate w-full">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {getTimeAgo(new Date(badge.earnedAt))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {d.weakTopics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Topics to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {d.weakTopics.slice(0, 3).map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}/lesson`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors tap-highlight-none"
                >
                  <div>
                    <p className="font-medium text-sm">{topic.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{topic.subjectId}</p>
                  </div>
                  <Badge variant={topic.difficulty === "hard" ? "destructive" : "warning"} className="text-[10px]">
                    {topic.difficulty}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {d.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {d.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.subject && `${activity.subject} · `}{getTimeAgo(new Date(activity.at))}
                    </p>
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}