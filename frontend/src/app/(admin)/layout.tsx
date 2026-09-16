import Link from "next/link";
import { LayoutDashboard, FolderOpen, ClipboardCheck, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/materials", label: "Materials", icon: FolderOpen },
  { href: "/admin/review", label: "Content Review", icon: ClipboardCheck },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="border-b border-border bg-muted/30">
        <nav className="mx-auto w-full max-w-6xl px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hidden" aria-label="Admin navigation">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors min-h-[44px]"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-1">
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-16 lg:pb-12 w-full">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}