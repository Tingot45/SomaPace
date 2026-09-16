import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-16 w-16 text-primary/40" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl dark:bg-amber-900/40">
          🤔
        </div>
      </div>

      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground text-balance">
        This page seems to have wandered off
      </h1>
      <p className="mt-4 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
        We couldn&apos;t find what you were looking for. Don&apos;t worry — let&apos;s get you back
        to learning at your own pace!
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Button size="lg" asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}