"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "theme";
const THEME_EVENT = "theme-change";

type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setMounted(true);
    setTheme(readInitialTheme());

    const handleThemeEvent = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      if (next === "light" || next === "dark") setTheme(next);
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        document.documentElement.classList.toggle("dark", e.newValue === "dark");
        setTheme(e.newValue);
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeEvent);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isDark = theme === "dark";

  const handleToggle = () => {
    const next: Theme = isDark ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn("inline-flex h-6 w-12 items-center rounded-full border border-border bg-muted/60 p-0.5", className)}
      />
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center justify-between rounded-full border border-border bg-background/80 p-0.5 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span
        className={cn(
          "flex h-[18px] w-5 items-center justify-center rounded-full transition-colors z-10",
          !isDark ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
        )}
      >
        <Sun className="h-3 w-3" />
      </span>
      <span
        className={cn(
          "flex h-[18px] w-5 items-center justify-center rounded-full transition-colors z-10",
          isDark ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
        )}
      >
        <Moon className="h-3 w-3" />
      </span>
    </button>
  );
}
