"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  fullWidth?: boolean;
  orientation?: "horizontal" | "vertical";
}

function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  fullWidth = false,
  orientation = "horizontal",
}: TabsProps) {
  const [internalActive, setInternalActive] = React.useState(tabs[0]?.id ?? "");
  const current = activeTab ?? internalActive;
  const tablistRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleChange = React.useCallback(
    (id: string) => {
      setInternalActive(id);
      onTabChange?.(id);
    },
    [onTabChange]
  );

  React.useEffect(() => {
    const el = tablistRef.current;
    if (!el) return;
    const focusable = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([data-disabled])'));
    const handler = (e: KeyboardEvent) => {
      const idx = focusable.findIndex((f) => f === document.activeElement);
      if (idx === -1) return;
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (idx + 1) % focusable.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (idx - 1 + focusable.length) % focusable.length;
      }
      if (next >= 0) {
        e.preventDefault();
        focusable[next].focus();
        handleChange(focusable[next].dataset.tabId!);
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [handleChange]);

  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
        <div
          ref={tablistRef}
          role="tablist"
          aria-orientation="vertical"
          className="flex flex-row sm:flex-col gap-1 sm:min-w-[200px]"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              role="tab"
              aria-selected={current === tab.id}
              aria-controls={`panel-${tab.id}`}
              data-tab-id={tab.id}
              data-disabled={tab.disabled || undefined}
              tabIndex={current === tab.id ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleChange(tab.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium transition-all min-h-[44px] min-w-[44px] tap-highlight-none whitespace-nowrap",
                current === tab.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.icon}
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={tablistRef}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "inline-flex items-center rounded-lg bg-muted p-1 gap-0.5",
          fullWidth && "w-full"
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            role="tab"
            aria-selected={current === tab.id}
            aria-controls={`panel-${tab.id}`}
            data-tab-id={tab.id}
            data-disabled={tab.disabled || undefined}
            tabIndex={current === tab.id ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleChange(tab.id)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all min-h-[40px] whitespace-nowrap tap-highlight-none",
              fullWidth && "flex-1",
              current === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              tab.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  current === tab.id ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TabPanelProps {
  tabId: string;
  activeTab?: string;
  children: React.ReactNode;
  className?: string;
}

function TabPanel({ tabId, activeTab, children, className }: TabPanelProps) {
  if (activeTab !== tabId) return null;
  return (
    <div role="tabpanel" id={`panel-${tabId}`} tabIndex={0} className={cn("mt-4 outline-none", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabPanel };