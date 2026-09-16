"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SelectField } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { cn, formatNumber } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
];

const EXT_MAP: Record<string, string> = {
  pdf: "PDF",
  doc: "Word",
  docx: "Word",
  ppt: "PowerPoint",
  pptx: "PowerPoint",
  txt: "Text",
  jpg: "JPEG",
  jpeg: "JPEG",
  png: "PNG",
};

const gradeOptions = Array.from({ length: 7 }, (_, i) => ({ value: String(i + 4), label: `Grade ${i + 4}` }));
const subjectOptions = [
  { value: "mathematics", label: "Mathematics" },
  { value: "english", label: "English" },
  { value: "kiswahili", label: "Kiswahili" },
  { value: "science", label: "Science" },
  { value: "social_studies", label: "Social Studies" },
  { value: "creative_arts", label: "Creative Arts" },
  { value: "ict", label: "ICT" },
  { value: "home_science", label: "Home Science" },
];

interface QueuedFile {
  id: string;
  file: File;
  grade: string;
  subject: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function MaterialUploader() {
  const queryClient = useQueryClient();
  const [queue, setQueue] = React.useState<QueuedFile[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [globalGrade, setGlobalGrade] = React.useState("7");
  const [globalSubject, setGlobalSubject] = React.useState("mathematics");

  const uploadMutation = useMutation({
    mutationFn: async (item: QueuedFile) => {
      setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" as const } : q)));
      const res = await api.uploadMaterial(
        item.file,
        { grade: Number(item.grade), subject: item.subject },
        (pct) => {
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, progress: pct } : q)));
        }
      );
      return res;
    },
    onSuccess: (_res, item) => {
      setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done" as const, progress: 100 } : q)));
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toastSuccess("Material uploaded!", `${item.file.name} is being processed.`);
    },
    onError: (err: Error, item) => {
      setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "error" as const, error: err.message } : q)));
      toastError("Upload failed", err.message);
    },
  });

  const addFiles = (files: FileList | File[]) => {
    const newItems: QueuedFile[] = Array.from(files)
      .filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
          toastError("Unsupported file", `${f.name} is not a supported file type.`);
          return false;
        }
        if (f.size > 50 * 1024 * 1024) {
          toastError("File too large", `${f.name} exceeds the 50MB limit.`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        grade: globalGrade,
        subject: globalSubject,
        progress: 0,
        status: "pending" as const,
      }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const startUploads = () => {
    const pending = queue.filter((q) => q.status === "pending");
    pending.forEach((item) => uploadMutation.mutate(item));
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectField label="Grade" value={globalGrade} onValueChange={setGlobalGrade} options={gradeOptions} />
        <SelectField label="Subject" value={globalSubject} onValueChange={setGlobalSubject} options={subjectOptions} />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors cursor-pointer",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        )}
        onClick={() => document.getElementById("file-upload-input")?.click()}
        role="button"
        tabIndex={0}
        aria-label="Click or drag files to upload"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("file-upload-input")?.click(); }}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
          className="sr-only"
        />
        <Upload className={cn("h-10 w-10 mb-3 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
        <p className="font-semibold text-foreground">
          {dragging ? "Drop files here" : "Click to upload or drag & drop"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, Word, PowerPoint, TXT, JPG, PNG — max 50MB each
        </p>
      </div>

      {queue.length > 0 && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upload Queue ({queue.length})</CardTitle>
            <Button
              size="sm"
              onClick={startUploads}
              disabled={queue.every((q) => q.status !== "pending")}
            >
              Upload All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queue.map((item) => {
                const ext = item.file.name.split(".").pop()?.toLowerCase() ?? "";
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                      <File className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] px-1">{(EXT_MAP[ext] ?? ext).toUpperCase()}</Badge>
                        <span>Grade {item.grade}</span>
                        <span>{item.subject}</span>
                        <span>{formatNumber(item.file.size)} bytes</span>
                      </div>
                      {item.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={item.progress} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.progress}%</p>
                        </div>
                      )}
                      {item.error && <p className="text-xs text-destructive mt-1">{item.error}</p>}
                    </div>
                    <div className="shrink-0">
                      {item.status === "done" && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                      {item.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                      {item.status === "uploading" && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                      {item.status === "pending" && (
                        <button onClick={() => removeFromQueue(item.id)} className="p-1 hover:bg-muted rounded" aria-label="Remove">
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}