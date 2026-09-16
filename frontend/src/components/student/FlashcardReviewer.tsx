"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RotateCcw, Check, Brain, Sparkles } from "lucide-react";
import { api, type Flashcard } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getDifficultyBadge } from "@/lib/utils";
import { toastSuccess } from "@/components/ui/toast";

interface FlashcardReviewerProps {
  topicId: string;
}

export function FlashcardReviewer({ topicId }: FlashcardReviewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [reviewed, setReviewed] = React.useState<Record<number, "known" | "learning">>({});
  const [completed, setCompleted] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["flashcards", topicId],
    queryFn: () => api.getFlashcards(topicId),
  });

  const updateMutation = useMutation({
    mutationFn: (card: Flashcard & { rating: number }) =>
      api.updateFlashcard({
        reviewRating: card.rating,
        easeFactor: card.ease ?? 2.5,
        intervalDays: card.intervalDays ?? 1,
        dueForReview: card.rating < 3,
      }),
  });

  const cards = data?.flashcards ?? [];
  const currentCard = cards[currentIndex];
  const total = cards.length;
  const knownCount = Object.values(reviewed).filter((v) => v === "known").length;

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !cards.length) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Brain className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="font-medium">{error ? "Failed to load flashcards" : "No flashcards available yet"}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error ? "Please try again" : "We're working on creating flashcards for this topic!"}
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Deck Complete! 🎉</h2>
            <p className="text-muted-foreground mt-2">
              You reviewed {total} cards. {knownCount} known, {total - knownCount} to revisit.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => { setCurrentIndex(0); setIsFlipped(false); setReviewed({}); setCompleted(false); }}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Review Again
              </Button>
              <Button onClick={() => window.location.reload()}>Done</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleReview = (rating: "known" | "learning") => {
    setReviewed((prev) => ({ ...prev, [currentIndex]: rating }));
    const ratingNum = rating === "known" ? 5 : 2;
    updateMutation.mutate({ ...currentCard, rating: ratingNum });

    if (currentIndex < total - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      }, 200);
    } else {
      setTimeout(() => setCompleted(true), 300);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Flashcards</h2>
        <Badge variant="secondary">{currentIndex + 1} / {total}</Badge>
      </div>

      <Progress value={((currentIndex + 1) / total) * 100} className="h-2" />

      <div className="flex justify-center" style={{ perspective: "1200px" }}>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className={cn(
            "w-full h-64 sm:h-72 rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-card transition-transform duration-500 cursor-pointer text-center flex flex-col items-center justify-center tap-highlight-none",
            isFlipped && "[transform:rotateY(180deg)]"
          )}
          style={{ transformStyle: "preserve-3d" }}
          aria-label={isFlipped ? "Tap to see the question" : "Tap to reveal the answer"}
        >
          <div style={{ backfaceVisibility: "hidden" }} className="flex flex-col items-center justify-center w-full">
            {currentCard.hint && !isFlipped && (
              <p className="text-xs text-muted-foreground mb-4">💡 Hint: {currentCard.hint}</p>
            )}
            <p className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {isFlipped ? "Think you know this one?" : "Tap to reveal the answer"}
            </p>
          </div>
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="flex flex-col items-center justify-center w-full absolute inset-0 rounded-2xl bg-primary/5 p-6 sm:p-8"
          >
            <p className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {currentCard.back}
            </p>
          </div>
        </button>
      </div>

      {currentCard.intervalDays !== undefined && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Current interval: {currentCard.intervalDays} day{currentCard.intervalDays !== 1 ? "s" : ""}
            {currentCard.ease && ` · Ease: ${currentCard.ease.toFixed(1)}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleReview("learning")}
          className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Still Learning
        </Button>
        <Button
          size="lg"
          onClick={() => handleReview("known")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Check className="h-4 w-4 mr-2" /> Know It
        </Button>
      </div>

      <div className="flex gap-1.5 justify-center">
        {cards.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              i === currentIndex ? "bg-primary scale-125" : reviewed[i] ? (reviewed[i] === "known" ? "bg-emerald-500" : "bg-amber-500") : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}