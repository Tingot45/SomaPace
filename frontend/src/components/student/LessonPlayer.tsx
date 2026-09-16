"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, ChevronRight, BookOpen, Clock, Headphones, VolumeX,
  CheckCircle2, AlertTriangle, Lightbulb, Target, Loader2, RotateCcw,
} from "lucide-react";
import { api, type Lesson, type LessonSection, type RecapQuizItem } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { cn, formatDuration, getSubjectEmoji } from "@/lib/utils";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { AudioPlayer } from "./AudioPlayer";

interface LessonPlayerProps {
  topicId: string;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  hook: <Lightbulb className="h-4 w-4" />,
  objective: <Target className="h-4 w-4" />,
  explanation: <BookOpen className="h-4 w-4" />,
  worked_example: <ChevronRight className="h-4 w-4" />,
  kenyan_application: <span className="text-sm">🇰🇪</span>,
  diagram: <span className="text-sm">📊</span>,
  misconception: <AlertTriangle className="h-4 w-4" />,
  summary: <CheckCircle2 className="h-4 w-4" />,
};

const SECTION_NAMES: Record<string, string> = {
  hook: "Let's Start",
  objective: "What We'll Learn",
  explanation: "Explanation",
  worked_example: "Worked Example",
  kenyan_application: "Kenyan Context",
  diagram: "Diagram",
  misconception: "Watch Out!",
  summary: "Summary",
};

export function LessonPlayer({ topicId }: LessonPlayerProps) {
  const queryClient = useQueryClient();
  const { user } = useStore();
  const [activeSection, setActiveSection] = React.useState(0);
  const [showAudio, setShowAudio] = React.useState(false);
  const [startTime] = React.useState(Date.now());
  const [recapAnswers, setRecapAnswers] = React.useState<Record<number, number>>({});
  const [recapSubmitted, setRecapSubmitted] = React.useState(false);

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ["lesson", topicId],
    queryFn: () => api.getLesson(topicId),
  });

  const progressMutation = useMutation({
    mutationFn: () =>
      api.submitProgress(lesson!.id, {
        percent: 100,
        completed: true,
        timeSpentSec: Math.round((Date.now() - startTime) / 1000),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["lesson", topicId] });
      toastSuccess("Lesson completed! 🎉", `+${res.xpEarned} XP earned`);
    },
    onError: () => toastError("Failed to mark lesson as complete"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-3 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${85 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="font-medium">Failed to load lesson</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const content = lesson.content;
  const sections = content.sections;
  const currentSection = sections[activeSection];
  const isCompleted = lesson.progress?.completed;
  const readingSeconds = content.readingTimeMinutes * 60;

  const recapScore = recapSubmitted
    ? content.recapQuiz.reduce((s, q, i) => s + (recapAnswers[i] === q.answer ? 1 : 0), 0)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href={`/topics/${topicId}`} className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to topic
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{content.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>{getSubjectEmoji(content.subject)} {content.subject}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatDuration(readingSeconds)}
            </span>
            <span>Grade {content.grade.join(", ")}</span>
          </div>
        </div>
        {lesson.audioUrl && (
          <Button
            variant={showAudio ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAudio(!showAudio)}
            className="shrink-0"
          >
            {showAudio ? <VolumeX className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
            {showAudio ? "Hide Audio" : "Listen"}
          </Button>
        )}
      </div>

      {showAudio && lesson.audioUrl && (
        <AudioPlayer src={lesson.audioUrl} title={content.title} />
      )}

      <Progress value={((activeSection + 1) / sections.length) * 100} className="h-2" />

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hidden pb-2">
        {sections.map((section, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] shrink-0 tap-highlight-none",
              i === activeSection
                ? "bg-primary text-primary-foreground"
                : i < activeSection
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {SECTION_ICONS[section.type]}
            <span className="hidden sm:inline">{SECTION_NAMES[section.type]}</span>
            {i === activeSection && <span className="sr-only">(current)</span>}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            {SECTION_ICONS[currentSection.type]}
            <h2 className="text-lg font-bold text-foreground">{currentSection.title}</h2>
          </div>

          <SectionContent section={currentSection} />

          {activeSection === sections.length - 1 && content.keyTerms && content.keyTerms.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-3">Key Terms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {content.keyTerms.map((term, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-semibold text-foreground">{term.term}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{term.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {content.recapQuiz && content.recapQuiz.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Quick Recap Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.recapQuiz.map((rq, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-sm font-medium">
                  {qi + 1}. {rq.question}
                </p>
                <RadioGroup
                  value={recapAnswers[qi] !== undefined ? String(recapAnswers[qi]) : ""}
                  onValueChange={(v) => setRecapAnswers((prev) => ({ ...prev, [qi]: Number(v) }))}
                  className="space-y-1.5"
                >
                  {rq.options.map((opt, oi) => (
                    <RadioOption
                      key={oi}
                      value={String(oi)}
                      label={opt}
                      disabled={recapSubmitted}
                      showCheck={false}
                      className={cn(
                        recapSubmitted && oi === rq.answer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                        recapSubmitted && recapAnswers[qi] === oi && oi !== rq.answer && "border-destructive bg-destructive/5"
                      )}
                    />
                  ))}
                </RadioGroup>
                {recapSubmitted && (
                  <p className={cn("text-xs p-2 rounded-md", recapAnswers[qi] === rq.answer ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40")}>
                    {rq.explanation}
                  </p>
                )}
              </div>
            ))}

            {!recapSubmitted ? (
              <Button
                onClick={() => setRecapSubmitted(true)}
                disabled={Object.keys(recapAnswers).length < content.recapQuiz.length}
                className="w-full"
              >
                Check Answers
              </Button>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-lg font-bold">
                  {recapScore}/{content.recapQuiz.length} correct
                </p>
                <p className="text-sm text-muted-foreground">
                  {recapScore === content.recapQuiz.length
                    ? "Perfect score! You're amazing! 🎉"
                    : recapScore >= content.recapQuiz.length * 0.5
                    ? "Good effort! Keep going!"
                    : "Let's review the lesson once more."}
                </p>
                <Button variant="outline" onClick={() => { setRecapSubmitted(false); setRecapAnswers({}); }}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
          disabled={activeSection === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>

        {activeSection < sections.length - 1 ? (
          <Button onClick={() => setActiveSection(activeSection + 1)}>
            Next Section <ChevronRight className="h-4 w-4" />
          </Button>
        ) : !isCompleted ? (
          <Button
            onClick={() => progressMutation.mutate()}
            loading={progressMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark Complete
          </Button>
        ) : (
          <Badge variant="success" className="text-sm py-2 px-4">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
          </Badge>
        )}
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: LessonSection }) {
  if (section.type === "diagram" && section.mermaid) {
    return (
      <div className="mermaid-chart">
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground">
          <span>📊</span> Diagram
        </div>
        <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
          {section.mermaid}
        </pre>
      </div>
    );
  }

  return (
    <div className="lesson-content">
      {typeof section.content === "string" && section.content && (
        <div dangerouslySetInnerHTML={{ __html: formatLessonText(section.content) }} />
      )}

      {Array.isArray(section.content) && (
        <div className="space-y-2">
          {section.content.map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: formatLessonText(para) }} />
          ))}
        </div>
      )}

      {section.items && section.items.length > 0 && (
        <ul className="mt-3">
          {section.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatLessonText(item) }} />
          ))}
        </ul>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-4 space-y-4">
          {section.subsections.map((sub, i) => (
            <div key={i}>
              <h3>{sub.heading}</h3>
              <p dangerouslySetInnerHTML={{ __html: formatLessonText(sub.body) }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatLessonText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
}