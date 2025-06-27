
"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageSquare, Send, X } from 'lucide-react';
import { useLiveChat } from '@/hooks/use-live-chat';

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  // For simplicity, we'll use a single conversation ID for the demo
  const { messages, sendMessage } = useLiveChat('conversation-1');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector<HTMLDivElement>('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage, 'customer');
    setNewMessage("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}>
        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary-foreground/50">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="Chat agent" data-ai-hint="support agent face" />
                        <AvatarFallback>A</AvatarFallback>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-primary" />
                    </Avatar>
                    <div>
                        <p className="font-bold">Support Agent</p>
                        <p className="text-xs opacity-90">Typically replies instantly</p>
                    </div>
                </div>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {messages.map((msg, index) => (
                           <div key={index} className={cn("flex items-end gap-2", msg.sender === 'agent' ? "justify-start" : "justify-end")}>
                                {msg.sender === 'agent' && <Avatar className="h-6 w-6"><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="agent face" /><AvatarFallback>A</AvatarFallback></Avatar>}
                                <div className={cn("max-w-[80%] rounded-xl p-3 text-sm", msg.sender === 'agent' ? "bg-secondary rounded-bl-none" : "bg-primary text-primary-foreground rounded-br-none")}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
                 <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                    <Input 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4"/>
                    </Button>
                </form>
            </CardFooter>
        </Card>
      </div>

      <div className={cn(
          "absolute bottom-0 right-0 transition-all duration-300 ease-in-out",
          isOpen ? "opacity-0 -translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"
        )}>
          <Button 
            className="rounded-full w-16 h-16 shadow-lg"
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
          >
            <MessageSquare className="h-8 w-8" />
          </Button>
      </div>
    </div>
  );
}
