"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/subjects", label: "Learn", icon: BookOpen },
  { href: "/subjects", label: "Practice", icon: Zap },
  { href: "/dashboard", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link
              key={`${tab.href}-${tab.label}`}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors tap-highlight-none min-w-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition-colors", isActive && "text-primary")}
                aria-hidden="true"
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}