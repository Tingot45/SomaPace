"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useStore } from "@/lib/store";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false },
      },
    });
  }
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false },
      },
    });
  }
  return browserQueryClient;
}

function ThemeSyncer() {
  const { resolvedTheme } = useTheme();
  const setDarkMode = useStore((s) => s.setDarkMode);
  React.useEffect(() => {
    setDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme, setDarkMode]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(getQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ThemeSyncer />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}