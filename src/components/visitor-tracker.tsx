
"use client";

import { useVisitorTracker } from '@/hooks/use-visitor-tracker';

export function VisitorTracker({ children }: { children: React.ReactNode }) {
  useVisitorTracker();
  return <>{children}</>;
}
