
"use client";

import { useEffect } from 'react';
import { trackDailyVisitor } from '@/lib/actions/analytics';

const VISITOR_KEY = 'last_visit_date';

export function useVisitorTracker() {
  useEffect(() => {
    const track = async () => {
      if (typeof window !== 'undefined') {
        const today = new Date().toISOString().split('T')[0];
        const lastVisit = localStorage.getItem(VISITOR_KEY);

        if (lastVisit !== today) {
          // This is a new daily visit
          const result = await trackDailyVisitor();
          if (result.success) {
            localStorage.setItem(VISITOR_KEY, today);
          }
        }
      }
    };

    track();
  }, []);
}
