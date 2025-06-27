
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveChatWidget() {
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
      {/* Message Bubble */}
      <div 
        className={cn(
            "relative bg-background p-4 rounded-xl rounded-br-sm shadow-lg border transition-all duration-300 origin-bottom-right",
            isBubbleVisible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <p className="text-sm">Sir, how can I help?</p>
        
        {/* Close button on bubble */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -top-3 -left-1 h-6 w-6 rounded-full bg-secondary text-muted-foreground hover:bg-muted"
          onClick={() => setIsBubbleVisible(false)}
          aria-label="Minimize chat bubble"
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Triangle pointing to avatar */}
        <div className="absolute bottom-0 right-[-8px] w-4 h-4 overflow-hidden">
           <div className="w-4 h-4 bg-background border-r border-b transform rotate-45 origin-top-left" />
        </div>
      </div>

      {/* Avatar */}
      <button 
        onClick={() => setIsBubbleVisible(prev => !prev)} 
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        aria-label="Toggle chat bubble"
      >
         <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Chat agent" data-ai-hint="support agent face" />
            <AvatarFallback>A</AvatarFallback>
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
        </Avatar>
      </button>
    </div>
  );
}
