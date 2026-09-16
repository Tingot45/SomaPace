"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Trash2, RefreshCw, FileText } from "lucide-react";
import { api, type Material } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { cn, formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  processed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const gradeOptions = [
  { value: "", label: "All Grades" },
  ...Array.from({ length: 7 }, (_, i) => ({ value: String(i + 4), label: `Grade ${i + 4}` })),
];

const subjectOptions = [
  { value: "", label: "All Subjects" },
  { value: "mathematics", label: "Mathematics" },
  { value: "english", label: "English" },
  { value: "kiswahili", label: "Kiswahili" },
  { value: "science", label: "Science" },
  { value: "social_studies", label: "Social Studies" },
  { value: "ict", label: "ICT" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "processed", label: "Processed" },
  { value: "failed", label: "Failed" },
];

export function MaterialList() {
  const queryClient = useQueryClient();
  const [gradeFilter, setGradeFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["materials", gradeFilter, subjectFilter, statusFilter, page],
    queryFn: () =>
      api.getMaterials({
        grade: gradeFilter ? Number(gradeFilter) : undefined,
        subject: subjectFilter || undefined,
        status: statusFilter || undefined,
        page,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toastSuccess("Material deleted successfully");
    },
    onError: () => toastError("Failed to delete material"),
  });

  const reprocessMutation = useMutation({
    mutationFn: (id: string) => api.reprocessMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toastSuccess("Reprocessing started");
    },
    onError: () => toastError("Failed to start reprocessing"),
  });

  const materials = data?.materials ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <SelectField label="Grade" value={gradeFilter} onValueChange={setGradeFilter} options={gradeOptions} className="w-[140px]" />
        <SelectField label="Subject" value={subjectFilter} onValueChange={setSubjectFilter} options={subjectOptions} className="w-[160px]" />
        <SelectField label="Status" value={statusFilter} onValueChange={setStatusFilter} options={statusOptions} className="w-[140px]" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Materials ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No materials found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px_120px_60px] gap-3 text-xs font-medium text-muted-foreground px-3">
                <span>Filename</span><span>Grade</span><span>Subject</span><span>Status</span><span>Date</span><span></span>
              </div>
              {materials.map((m) => (
                <div key={m.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_100px_120px_60px] gap-2 sm:gap-3 items-center rounded-lg border border-border p-3 hover:bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{m.filename}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Grade {m.grade}</span>
                  <span className="text-xs text-muted-foreground capitalize">{m.subject}</span>
                  <Badge className={cn("text-[10px] w-fit", STATUS_STYLES[m.status])}>{m.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => reprocessMutation.mutate(m.id)} className="min-h-[44px]">
                        <RefreshCw className="h-4 w-4 mr-2" /> Reprocess
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMutation.mutate(m.id)} className="text-destructive min-h-[44px]">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}