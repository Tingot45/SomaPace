"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Trophy, RotateCcw, CheckCircle, XCircle, Target } from "lucide-react";
import { api, type Quiz, type QuizQuestion } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration } from "@/lib/utils";
import { toastSuccess, toastError } from "@/components/ui/toast";

interface QuizPlayerProps {
  topicId: string;
}

export function QuizPlayer({ topicId }: QuizPlayerProps) {
  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ["quiz", topicId],
    queryFn: () => api.getQuiz(topicId),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Target className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="font-medium">Failed to load quiz</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return <QuizEngine quiz={quiz} />;
}

function QuizEngine({ quiz }: { quiz: Quiz }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [results, setResults] = React.useState<{
    score: number;
    passed: boolean;
    xpEarned: number;
    explanations: { questionIndex: number; correct: boolean; explanation: string }[];
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = React.useState(
    quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : undefined
  );
  const submitMutation = useMutation({
    mutationFn: () => api.submitQuizResult(quiz.id, answers),
    onSuccess: (data) => {
      setResults(data);
      setSubmitted(true);
    },
    onError: () => toastError("Failed to submit quiz"),
  });

  React.useEffect(() => {
    if (submitted || timeRemaining === undefined) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === undefined || prev <= 0) {
          clearInterval(interval);
          if (!submitted) handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeRemaining]);

  const q = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  if (submitted && results) {
    const correctCount = results.explanations.filter((e) => e.correct).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-8 text-center">
            <div className={cn(
              "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full",
              results.passed ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"
            )}>
              {results.passed ? (
                <Trophy className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Target className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {results.passed ? "Well Done! 🎉" : "Keep Trying! 💪"}
            </h2>
            <p className="text-muted-foreground mt-2">
              You scored {correctCount}/{total} ({results.score}%)
            </p>
            <p className="text-lg font-bold text-primary mt-1">+{results.xpEarned} XP</p>

            <div className="flex gap-3 justify-center mt-6">
              <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentIndex(0); setResults(null); }}>
                <RotateCcw className="h-4 w-4 mr-1" /> Retry Quiz
              </Button>
              {!results.passed && (
                <Button onClick={() => { setSubmitted(false); setResults(null); setCurrentIndex(0); }}>
                  Review Answers
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {results.explanations.map((exp, i) => (
          <Card key={i} className={cn(exp.correct ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800")}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                {exp.correct ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{quiz.questions[exp.questionIndex].prompt}</p>
                  <p className={cn("text-sm mt-1", exp.correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
                    {exp.correct ? "Correct!" : `Your answer: ${quiz.questions[exp.questionIndex].options[answers[exp.questionIndex]]}`}
                  </p>
                  {!exp.correct && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Correct: {quiz.questions[exp.questionIndex].options[quiz.questions[exp.questionIndex].correctIndex]}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{exp.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{quiz.title}</h2>
        {timeRemaining !== undefined && (
          <Badge variant={timeRemaining < 60 ? "destructive" : "secondary"} className="text-sm font-mono">
            <Clock className="h-3.5 w-3.5 mr-1" /> {formatDuration(timeRemaining)}
          </Badge>
        )}
      </div>

      <Progress value={progress} className="h-2.5" />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {currentIndex + 1} of {total}</span>
        <span>{answeredCount}/{total} answered</span>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <p className="text-base sm:text-lg font-semibold text-foreground mb-5">{q.prompt}</p>
          <RadioGroup
            value={answers[currentIndex] !== undefined ? String(answers[currentIndex]) : ""}
            onValueChange={(v) => setAnswers((prev) => ({ ...prev, [currentIndex]: Number(v) }))}
            className="space-y-3"
          >
            {q.options.map((opt, i) => (
              <RadioOption key={i} value={String(i)} label={opt} />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="flex gap-1.5 justify-center">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                i === currentIndex ? "bg-primary scale-125" : answers[i] !== undefined ? "bg-primary/40" : "bg-muted"
              )}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>
        {currentIndex < total - 1 ? (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitMutation.isPending}
            disabled={answeredCount < total}
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}