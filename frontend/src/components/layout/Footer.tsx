import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div className="kenyan-flag-stripe" aria-hidden="true" />
      <div className="container max-w-screen-2xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Soma<span className="text-primary">Pace</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Smart, self-paced learning for Kenyan students. Master every topic at your own pace with bite-sized lessons and quizzes.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Platform</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/subjects" className="hover:text-foreground transition-colors">Browse Subjects</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Resources</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/subjects" className="hover:text-foreground transition-colors">Grades 4-10</Link></li>
              <li><Link href="/subjects" className="hover:text-foreground transition-colors">Kiswahili Support</Link></li>
              <li><Link href="/subjects" className="hover:text-foreground transition-colors">Offline Mode</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Support</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="mailto:support@somapace.co.ke" className="hover:text-foreground transition-colors">Email Us</Link></li>
              <li><Link href="https://wa.me/254700000000" className="hover:text-foreground transition-colors">WhatsApp</Link></li>
              <li><span className="text-xs">+254 700 000 000</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} SomaPace. Built with{" "}
            <Heart className="inline h-3 w-3 text-red-500 fill-current" aria-label="love" />{" "}
            for Kenyan students.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <span className="text-border">·</span>
            <span>KES 700/year</span>
          </div>
        </div>
      </div>
    </footer>
  );
}