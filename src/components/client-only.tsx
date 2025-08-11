
"use client";

import { useHasMounted } from "@/hooks/use-has-mounted";
import type { ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return fallback;
  }

  return <>{children}</>;
}
