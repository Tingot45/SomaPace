"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight, BookOpen, MessagesSquare, Brain, Edit3, Clock, ArrowRight, Target } from "lucide-react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getDifficultyBadge, formatDuration, getSubjectEmoji } from "@/lib/utils";

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  return (
    <ProtectedRoute>
      <TopicHub topicId={params.topicId} />
    </ProtectedRoute>
  );
}

function TopicHub({ topicId }: { topicId: string }) {
  const [activeTab, setActiveTab] = React.useState("lesson");

  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: () => api.getTopic(topicId),
  });

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ["lesson", topicId],
    queryFn: () => api.getLesson(topicId),
    enabled: activeTab === "lesson",
  });

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ["quiz", topicId],
    queryFn: () => api.getQuiz(topicId),
    enabled: activeTab === "quiz",
  });

  const { data: flashcardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ["flashcards", topicId],
    queryFn: () => api.getFlashcards(topicId),
    enabled: activeTab === "flashcards",
  });

  const { data: practiceData, isLoading: practiceLoading } = useQuery({
    queryKey: ["practice", topicId],
    queryFn: () => api.getPracticeQuestions(topicId),
    enabled: activeTab === "practice",
  });

  const lessons = topic?.lessonCount;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {topicLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
          <Skeleton className="h-3 w-64" />
        </div>
      ) : topic ? (
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/subjects" className="hover:text-foreground hover:underline">Subjects</a>
            <ChevronRight className="h-3.5 w-3.5" />
            <a
              href={`/subjects/${topic.subjectId}/topics`}
              className="hover:text-foreground hover:underline capitalize"
            >
              {topic.subjectId}
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground line-clamp-1">{topic.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
            {getSubjectEmoji(topic.subjectId)} {topic.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{topic.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <Badge className={getDifficultyBadge(topic.difficulty)}>{topic.difficulty}</Badge>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" /> ~{topic.estimatedMinutes} min
            </Badge>
            <Badge variant="secondary">Grade {topic.grade.join(", ")}</Badge>
            {topic.progress?.completed && <Badge variant="success">✓ Completed</Badge>}
          </div>
        </div>
      ) : null}

      <Tabs
        tabs={[
          { id: "lesson", label: "Lesson", icon: <BookOpen className="h-4 w-4" />, badge: lessons },
          { id: "quiz", label: "Quiz", icon: <MessagesSquare className="h-4 w-4" />, badge: topic?.quizCount ?? "" },
          { id: "flashcards", label: "Flashcards", icon: <Brain className="h-4 w-4" />, badge: topic?.flashcardCount ?? "" },
          { id: "practice", label: "Practice", icon: <Edit3 className="h-4 w-4" />, badge: topic?.practiceCount ?? "" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        fullWidth
      />

      <TabPanel tabId="lesson" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Main Lesson
            </CardTitle>
            <CardDescription>Read, listen, or work through it step by step</CardDescription>
          </CardHeader>
          <CardContent>
            {lessonLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : lesson ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {lesson.content.objectives.slice(0, 3).map((obj, i) => (
                    <p key={i} className="text-sm text-foreground/90 flex gap-2">
                      <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {obj}
                    </p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" /> {formatDuration(lesson.content.readingTimeMinutes * 60)} read
                  </Badge>
                  <Badge variant="outline">{lesson.content.sections.length} sections</Badge>
                  {lesson.audioUrl && <Badge variant="outline">🎧 Audio available</Badge>}
                </div>
                <Button asChild className="w-full h-12">
                  <Link href={`/topics/${topicId}/lesson`}>
                    Open Lesson <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Lesson is being prepared. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel tabId="quiz" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-primary" /> Recap Quiz
            </CardTitle>
            <CardDescription>Check what you've learned with immediate feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {quizLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : quiz ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {quiz.questions.length} questions ·{" "}
                  {quiz.passingScore}% to pass
                  {quiz.timeLimitMinutes ? ` · ${quiz.timeLimitMinutes} min timer` : ""}
                </p>
                <div className="space-y-2">
                  {quiz.questions.slice(0, 2).map((q, i) => (
                    <div key={q.id} className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium">{i + 1}. {q.prompt}</p>
                      <div className="mt-1.5 space-y-1">
                        {q.options.map((opt, oi) => (
                          <p key={oi} className={cn("text-xs flex gap-1.5", oi === q.correctIndex ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
                            {String.fromCharCode(65 + oi)}. {opt}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full h-12">
                  <Link href={`/topics/${topicId}/quiz`}>
                    Take the Quiz <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Quiz is being prepared. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel tabId="flashcards" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> Flashcards
            </CardTitle>
            <CardDescription>Space repetition helps you remember longer</CardDescription>
          </CardHeader>
          <CardContent>
            {cardsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : flashcardsData?.flashcards.length ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {flashcardsData.flashcards.slice(0, 3).map((card) => (
                    <div key={card.id} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium">{card.front}</p>
                      <p className="text-xs text-muted-foreground mt-1">→ {card.back}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{flashcardsData.total} cards in deck</p>
                <Button asChild className="w-full h-12">
                  <Link href={`/topics/${topicId}/flashcards`}>
                    Start Review <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Flashcards are being prepared. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel tabId="practice" activeTab={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" /> Practice Questions
            </CardTitle>
            <CardDescription>Answer open questions with hints and model answers</CardDescription>
          </CardHeader>
          <CardContent>
            {practiceLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : practiceData?.questions.length ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {practiceData.questions.slice(0, 2).map((q) => (
                    <div key={q.id} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium">{q.prompt}</p>
                      <Badge className={cn("text-[10px] mt-1.5", getDifficultyBadge(q.difficulty))}>{q.difficulty}</Badge>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full h-12">
                  <Link href={`/topics/${topicId}/lesson`}>
                    Practice in Lesson <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Practice questions are being prepared. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </div>
  );
}