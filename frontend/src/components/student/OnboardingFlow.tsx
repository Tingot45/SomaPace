"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ChevronRight, ChevronLeft, BookOpen, Sparkles, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioOption } from "@/components/ui/radio-group";
import { cn, getGradeLabel } from "@/lib/utils";

const STEPS = ["grade", "subjects", "diagnostic", "results"] as const;
const GRADES = [4, 5, 6, 7, 8, 9, 10];

const SUBJECT_LIST = [
  { id: "mathematics", label: "Mathematics", emoji: "🔢", color: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800" },
  { id: "english", label: "English", emoji: "📖", color: "bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800" },
  { id: "kiswahili", label: "Kiswahili", emoji: "🗣️", color: "bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800" },
  { id: "science", label: "Science", emoji: "🔬", color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800" },
  { id: "social_studies", label: "Social Studies", emoji: "🌍", color: "bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800" },
  { id: "creative_arts", label: "Creative Arts", emoji: "🎨", color: "bg-pink-50 border-pink-200 dark:bg-pink-950/50 dark:border-pink-800" },
  { id: "ict", label: "ICT", emoji: "💻", color: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-800" },
  { id: "home_science", label: "Home Science", emoji: "👩‍🍳", color: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800" },
];

const DIAGNOSTIC_QUESTIONS = [
  { q: "What is 12 × 15?", options: ["180", "165", "210", "175"], answer: 0, explanation: "12 × 15 = 180. Break it down: 12 × 10 = 120, plus 12 × 5 = 60, gives 180." },
  { q: "Which planet is closest to the Sun?", options: ["Mars", "Venus", "Mercury", "Earth"], answer: 2, explanation: "Mercury is the closest planet to the Sun in our solar system." },
  { q: "What is the past tense of 'run'?", options: ["Ran", "Runned", "Running", "Runs"], answer: 0, explanation: "'Ran' is the past tense of 'run'. It is an irregular verb." },
  { q: "Nairobi is the capital of which country?", options: ["Uganda", "Tanzania", "Kenya", "Ethiopia"], answer: 2, explanation: "Nairobi is the capital and largest city of Kenya." },
  { q: "What does 'Ubuntu' mean?", options: ["Happiness", "I am because we are", "Strong together", "Peace"], answer: 1, explanation: "Ubuntu means 'I am because we are' — it's about shared humanity and community." },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { user, setUser, login } = useStore();
  const [step, setStep] = React.useState(0);
  const [grade, setGrade] = React.useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    if (user) {
      setUser({ ...user, onboardingComplete: true, grade: Number(grade), subjects: selectedSubjects });
    }
    setSubmitting(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome to SomaPace!</h1>
            <span className="text-sm text-muted-foreground font-medium">Step {step + 1} of {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {currentStep === "grade" && (
          <div key="grade" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    What grade are you in?
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">We&apos;ll tailor everything to your level.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GRADES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(String(g))}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 text-center transition-all min-h-[80px] tap-highlight-none",
                          grade === String(g)
                            ? "border-primary bg-primary/5 shadow-lift"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <span className={cn("text-3xl font-bold transition-colors", grade === String(g) ? "text-primary" : "text-foreground")}>
                          {g}
                        </span>
                        <span className="text-xs text-muted-foreground">{getGradeLabel(g)}</span>
                        {grade === String(g) && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-6 h-12"
                    disabled={!grade}
                    onClick={() => setStep(1)}
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "subjects" && (
            <div key="subjects" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    Pick your subjects
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Choose at least 2 subjects you&apos;d like to study.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {SUBJECT_LIST.map((subject) => {
                      const selected = selectedSubjects.includes(subject.id);
                      return (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubject(subject.id)}
                          className={cn(
                            "relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all min-h-[64px] tap-highlight-none",
                            selected
                              ? "border-primary bg-primary/5 shadow-lift"
                              : subject.color
                          )}
                        >
                          <span className="text-2xl">{subject.emoji}</span>
                          <span className="text-sm font-medium text-foreground">{subject.label}</span>
                          {selected && (
                            <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      className="flex-1 h-12"
                      disabled={selectedSubjects.length < 2}
                      onClick={() => setStep(2)}
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "diagnostic" && (
            <div key="diagnostic" className="animate-fade-in">
              <DiagnosticQuiz
                questions={DIAGNOSTIC_QUESTIONS}
                answers={answers}
                setAnswer={(qIdx, aIdx) => setAnswers((prev) => ({ ...prev, [qIdx]: aIdx }))}
                onComplete={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            </div>
          )}

          {currentStep === "results" && (
            <div key="results" className="animate-fade-in">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">You&apos;re All Set!</CardTitle>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We&apos;ve mapped out {getGradeLabel(Number(grade))} content for {selectedSubjects.length} subjects.
                    Let&apos;s start learning at your own pace!
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <p className="text-lg font-bold">{getGradeLabel(Number(grade))}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Subjects</p>
                      <p className="text-lg font-bold">{selectedSubjects.length} chosen</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-sm text-primary font-medium">
                    💡 Start with just 10 minutes a day — that&apos;s all it takes!
                  </div>
                  <Button
                    className="w-full h-12 text-base"
                    onClick={handleComplete}
                    loading={submitting}
                  >
                    {submitting ? "Setting up your learning path..." : "Start Learning"}
                    {!submitting && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  );
}

interface DiagnosticQuizProps {
  questions: typeof DIAGNOSTIC_QUESTIONS;
  answers: Record<number, number>;
  setAnswer: (qIdx: number, aIdx: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

function DiagnosticQuiz({ questions, answers, setAnswer, onComplete, onBack }: DiagnosticQuizProps) {
  const [currentQ, setCurrentQ] = React.useState(0);
  const q = questions[currentQ];
  const isAnswered = answers[currentQ] !== undefined;
  const isCorrect = answers[currentQ] === q.answer;
  const allDone = Object.keys(answers).length === questions.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            Question {currentQ + 1} of {questions.length}
          </Badge>
          {answers[currentQ] !== undefined && (
            <Badge variant={isCorrect ? "success" : "destructive"}>
              {isCorrect ? "Correct!" : "Not quite"}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{q.q}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={answers[currentQ] !== undefined ? String(answers[currentQ]) : ""}
          onValueChange={(v) => setAnswer(currentQ, Number(v))}
          className="space-y-2"
        >
          {q.options.map((opt, i) => (
            <RadioOption
              key={i}
              value={String(i)}
              label={opt}
              disabled={isAnswered}
              showCheck={false}
            />
          ))}
        </RadioGroup>

        {isAnswered && (
          <div className={cn(
            "rounded-lg p-3 text-sm",
            isCorrect ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
          )}>
            {q.explanation}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {currentQ > 0 && (
            <Button variant="outline" onClick={() => setCurrentQ(currentQ - 1)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {currentQ < questions.length - 1 && isAnswered ? (
            <Button onClick={() => setCurrentQ(currentQ + 1)} className="flex-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : allDone ? (
            <Button onClick={onComplete} className="flex-1">
              See Results <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex gap-1.5 justify-center pt-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === currentQ ? "bg-primary" : answers[i] !== undefined ? "bg-primary/40" : "bg-muted"
              )}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}