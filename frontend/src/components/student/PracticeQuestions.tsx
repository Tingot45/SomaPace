"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Eye, EyeOff, ChevronRight, Target } from "lucide-react";
import { api, type PracticeQuestion } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getDifficultyBadge } from "@/lib/utils";

interface PracticeQuestionsProps {
  topicId: string;
}

export function PracticeQuestions({ topicId }: PracticeQuestionsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [showHint, setShowHint] = React.useState(false);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [completed, setCompleted] = React.useState<number[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["practice", topicId],
    queryFn: () => api.getPracticeQuestions(topicId),
  });

  const questions = data?.questions ?? [];
  const q = questions[currentIndex];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Target className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="font-medium">{error ? "Failed to load practice questions" : "No practice questions yet"}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error ? "Please try again" : "We're creating practice questions for this topic!"}
        </p>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    setSubmitted(true);
    if (!completed.includes(currentIndex)) setCompleted((prev) => [...prev, currentIndex]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setShowHint(false);
      setShowAnswer(false);
      setSubmitted(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Practice</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completed.length}/{questions.length}
          </Badge>
          <Badge className={getDifficultyBadge(q.difficulty)}>
            {q.difficulty}
          </Badge>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hidden">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); setUserAnswer(""); setShowHint(false); setShowAnswer(false); setSubmitted(false); }}
            className={cn(
              "h-8 w-8 rounded-full text-xs font-medium shrink-0 transition-colors",
              i === currentIndex ? "bg-primary text-primary-foreground" : completed.includes(i) ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-5">
          <p className="text-base sm:text-lg font-semibold text-foreground">{q.prompt}</p>

          <Input
            placeholder={q.type === "calculation" ? "Enter your answer" : "Type your answer..."}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showAnswer}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userAnswer.trim() && !showAnswer) handleSubmitAnswer();
            }}
          />

          <div className="flex flex-wrap gap-2">
            {!showAnswer && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="h-4 w-4 mr-1" /> {showHint ? "Hide Hint" : "Show Hint"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowAnswer(true); if (!completed.includes(currentIndex)) setCompleted((prev) => [...prev, currentIndex]); }}
                >
                  <Eye className="h-4 w-4 mr-1" /> Reveal Answer
                </Button>
              </>
            )}
            {showAnswer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswer(false)}
              >
                <EyeOff className="h-4 w-4 mr-1" /> Hide Answer
              </Button>
            )}
          </div>

          {showHint && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 text-sm text-amber-800 dark:text-amber-300">
              💡 <strong>Hint:</strong> {q.hint}
            </div>
          )}

          {showAnswer && (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Model Answer</p>
                <p className="text-emerald-900 dark:text-emerald-200">{q.modelAnswer}</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1">Explanation</p>
                <p className="text-sm text-slate-700 dark:text-slate-400">{q.explanation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setUserAnswer(""); setShowHint(false); setShowAnswer(false); setSubmitted(false); }}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentIndex >= questions.length - 1}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}