"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Zap, Shield, ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { api, type Subject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectField } from "@/components/ui/select";
import { cn, getSubjectEmoji, getSubjectColor } from "@/lib/utils";

const gradeOptions = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 4),
  label: `Grade ${i + 4}`,
}));

export function Sidebar() {
  const pathname = usePathname();
  const { user, sidebarOpen, setSidebarOpen } = useStore();
  const [selectedGrade, setSelectedGrade] = React.useState(String(user?.grade ?? 7));

  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ["subjects", selectedGrade],
    queryFn: () => api.getSubjects({ grade: Number(selectedGrade) }),
  });

  const subjects = subjectsData?.subjects ?? [];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-72 border-r border-border bg-background transition-transform duration-200 lg:sticky lg:translate-x-0 lg:z-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Browse</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pb-3">
            <SelectField
              label="Grade"
              value={selectedGrade}
              onValueChange={setSelectedGrade}
              options={gradeOptions}
            />
          </div>

          <Separator />

          <ScrollArea className="flex-1 px-3 py-3">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <nav className="space-y-0.5" aria-label="Subjects">
                {subjects.map((subject) => {
                  const emoji = subject.emoji || getSubjectEmoji(subject.name);
                  const isActive = pathname.includes(`/subjects/${subject.id}`);
                  return (
                    <Link
                      key={subject.id}
                      href={`/subjects/${subject.id}/topics`}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg p-3 transition-colors min-h-[56px] tap-highlight-none",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-base", getSubjectColor(subject.name))}>
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{subject.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {subject.topics} topic{subject.topics !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {subject.progress > 0 && (
                        <div className="w-16">
                          <Progress
                            value={subject.progress}
                            className="h-1.5"
                            indicatorClassName={subject.progress >= 80 ? "bg-emerald-500" : subject.progress >= 40 ? "bg-amber-500" : ""}
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
                {subjects.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                    <BookOpen className="h-10 w-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No subjects yet</p>
                    <p className="text-xs mt-1">Select a different grade</p>
                  </div>
                )}
              </nav>
            )}
          </ScrollArea>

          <Separator />

          <div className="p-4">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 text-sm font-medium min-h-[48px] tap-highlight-none transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4" /> Admin Panel
              </Link>
            )}

            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Today&apos;s Streak</span>
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-lg font-bold">{user?.streak ?? 0} days</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {(user?.xp ?? 0).toLocaleString()} XP earned
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}