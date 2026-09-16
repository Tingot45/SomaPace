import Link from "next/link";
import {
  GraduationCap,
  Clock,
  MessageSquare,
  Headphones,
  WifiOff,
  Sparkles,
  Star,
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPriceKES } from "@/lib/utils";

const features = [
  {
    icon: Clock,
    title: "Bite-sized Lessons",
    description:
      "Each topic is broken into 10-minute lessons with clear objectives, worked examples and real Kenyan context. No more 2-hour study marathons.",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  {
    icon: MessageSquare,
    title: "Smart Quizzes",
    description:
      "Immediate feedback on every answer with simple explanations. We retell questions until you truly get it — that's how mastery happens.",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    icon: Headphones,
    title: "Listen & Learn",
    description:
      "Every lesson comes with audio. Listen during travel to school, chores, or while your hands are busy. Learning shouldn't wait for a desk.",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  },
  {
    icon: WifiOff,
    title: "Works Offline",
    description:
      "Download lessons on Wi-Fi and keep learning even when the network is gone. Data-saver mode keeps your bundles intact.",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  {
    icon: Zap,
    title: "Adaptive Pacing",
    description:
      "The app learns your strengths and gently guides you to review weak areas. You move at your speed, not the class average's.",
    color: "bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  },
  {
    icon: ShieldCheck,
    title: "Made for Kenya",
    description:
      "Aligned to the Competency-Based Curriculum (CBC) for Grades 4-10, with examples drawn from our local reality.",
    color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400",
  },
];

const testimonials = [
  {
    name: "Grace M., Grade 6 parent",
    location: "Nakuru",
    quote:
      "My daughter used to dread maths homework. Now she asks for 'one more SomaPace lesson before bed.' The 10-minute lessons changed everything for us.",
    avatar: "GM",
    stars: 5,
  },
  {
    name: "Brian O., Grade 8 student",
    location: "Nairobi",
    quote:
      "I failed fractions in class twice. SomaPace explained it slower than the teacher could — with shillings and shopping examples. I finally understand!",
    avatar: "BO",
    stars: 5,
  },
  {
    name: "Mama Anita, Grade 4 parent",
    location: "Kisumu",
    quote:
      "The offline mode is a blessing. My son revises on the matatu ride home without eating my data. KES 700 a year is nothing for this.",
    avatar: "MA",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="container relative max-w-screen-2xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5 px-3 py-1.5 text-xs gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> For Kenyan students, Grades 4-10
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance">
              Learn at your
              <span className="text-primary"> own pace</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Bite-sized lessons, smart quizzes and flashcards built for the Kenyan curriculum.
              Just 10 minutes a day — anywhere, even offline.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/register">
                  Start Learning Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/subjects">Explore Subjects</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No card needed to start · Then <strong className="text-foreground">{formatPriceKES(700)}</strong> for a full year
            </p>
          </div>
        </div>
      </section>

      <Card className="mx-auto max-w-5xl border-0 shadow-card my-4 sm:my-8">
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-8 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">28K+</p>
            <p className="text-xs text-muted-foreground mt-1">students learning</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-secondary">1,200+</p>
            <p className="text-xs text-muted-foreground mt-1">bite-sized lessons</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">7</p>
            <p className="text-xs text-muted-foreground mt-1">grades covered (4-10)</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">77%</p>
            <p className="text-xs text-muted-foreground mt-1">improve in 30 days</p>
          </div>
        </CardContent>
      </Card>

      <section className="py-14 sm:py-20">
        <div className="container max-w-screen-2xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Everything your child needs to succeed</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              We believe every Kenyan student deserves teaching that meets them where they are.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full transition-all hover:shadow-lift hover:border-primary/20">
                  <CardHeader>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-1 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="container max-w-screen-2xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Simple, honest pricing</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              One fair price. Full year. All grades, all subjects, all devices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-muted opacity-80">
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Take SomaPace for a spin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-extrabold">
                  KES 0
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 3 sample lessons</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 1 diagnostic quiz</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 7-day streak challenge</li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary shadow-lift scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Full Year</CardTitle>
                <CardDescription>Everything, unlocked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-4xl font-extrabold text-primary">
                  {formatPriceKES(700)}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> All subjects, Grades 4-10</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 1,200+ lessons, quizzes & flashcards</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Audio lessons & offline mode</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Pay via M-Pesa or card</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Support in English & Kiswahili</li>
                </ul>
                <Button className="w-full h-12" asChild>
                  <Link href="/register">Get Started — KES 700/year</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-muted opacity-80">
              <CardHeader>
                <CardTitle>School Plan</CardTitle>
                <CardDescription>For groups of 20+</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-extrabold">
                  KES 350
                  <span className="text-sm font-normal text-muted-foreground">/year per student</span>
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Admin dashboard for teachers</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Class progress reports</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Upload your own materials</li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="mailto:schools@somapace.co.ke">Talk to Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <Badge variant="success">M-Pesa accepted</Badge>
            <Badge variant="secondary">Cancel anytime</Badge>
            <Badge variant="outline">Family sharing (up to 3 kids)</Badge>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container max-w-screen-2xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Loved by families across Kenya</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-3" aria-label="5 out of 5 stars">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container max-w-screen-2xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-somapace-green-600 to-somapace-green-800 p-8 sm:p-14 text-center shadow-lift">
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" aria-hidden="true" />
            <h2 className="relative text-2xl sm:text-4xl font-bold text-white text-balance">
              Ready to learn at your own pace?
            </h2>
            <p className="relative mt-3 text-white/80 max-w-md mx-auto text-sm sm:text-base">
              Join thousands of Kenyan students studying smarter, not harder. Free to start.
            </p>
            <Button
              size="lg"
              className="relative mt-7 bg-white text-somapace-green-700 hover:bg-white/90 h-12 px-8"
              asChild
            >
              <Link href="/register">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}