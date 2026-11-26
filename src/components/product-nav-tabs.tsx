"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

const DEFAULT_TABS: TabItem[] = [
  { id: "specification", label: "Specification" },
  { id: "description", label: "Description" },
  { id: "questions", label: "Questions" },
  { id: "video", label: "Video" },
  { id: "reviews", label: "Reviews" },
];

interface ProductNavTabsProps {
  tabs?: TabItem[];
}

export function ProductNavTabs({ tabs = DEFAULT_TABS }: ProductNavTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("specification");

  useEffect(() => {
    // Sync with URL hash if present
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (tabs.some((t) => t.id === hash)) {
        setActiveTab(hash);
      }
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find intersecting elements
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) {
        // Pick the element closest to the top of the viewport
        visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        setActiveTab(visible[0].target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0, 0.2, 0.5, 0.8],
    });

    tabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tabs]);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      // Smooth scroll with offset for sticky header + tabs navbar
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="sticky top-16 md:top-20 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border transition-colors">
      <nav
        aria-label="Product Sections"
        className="container mx-auto flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-3 no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => handleTabClick(e, tab.id)}
              className={cn(
                "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm transition-all duration-200 shrink-0 select-none cursor-pointer",
                isActive
                  ? "bg-blue-600 text-white border-2 border-blue-600 font-semibold shadow-sm hover:bg-blue-700 hover:border-blue-700 dark:bg-blue-600 dark:border-blue-500"
                  : "bg-background text-foreground/80 border border-border hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/70 dark:border-border dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 font-medium"
              )}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
