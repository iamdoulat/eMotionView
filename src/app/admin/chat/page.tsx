
"use client";

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Search, Send } from "lucide-react";
import { useLiveChat } from '@/hooks/use-live-chat';

const conversations = [
  { id: 'conversation-1', name: "John Doe", lastMessage: "Yes, I need help with my order...", avatar: "https://placehold.co/40x40.png", active: true, unread: 2 },
  { id: 'conversation-2', name: "Jane Smith", lastMessage: "Thank you so much! That fixed it.", avatar: "https://placehold.co/40x40.png", active: false, unread: 0 },
  { id: 'conversation-3', name: "Alice Johnson", lastMessage: "Do you have this in blue?", avatar: "https://placehold.co/40x40.png", active: false, unread: 0 },
  { id: 'conversation-4', name: "Bob Brown", lastMessage: "My package hasn't arrived yet.", avatar: "https://placehold.co/40x40.png", active: false, unread: 1 },
];

export default function ChatPage() {
    const [activeConversationId, setActiveConversationId] = useState('conversation-1');
    const { messages, sendMessage } = useLiveChat(activeConversationId);
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector<HTMLDivElement>('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(newMessage, 'agent');
        setNewMessage("");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
            {/* Chat List */}
            <Card className="lg:col-span-1 flex flex-col">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-xl">Conversations</CardTitle>
                     <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-8" />
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {conversations.map((conv) => (
                            <div 
                                key={conv.id} 
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer", 
                                    conv.id === activeConversationId ? "bg-secondary" : "hover:bg-secondary/50"
                                )}
                                onClick={() => setActiveConversationId(conv.id)}
                            >
                                <Avatar>
                                    <AvatarImage src={conv.avatar} alt={conv.name} data-ai-hint="person face" />
                                    <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{conv.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unread > 0 && (
                                    <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {conv.unread}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Panel */}
            <Card className="lg:col-span-3 flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
                    <Avatar>
                        <AvatarImage src={activeConversation?.avatar} alt={activeConversation?.name} data-ai-hint="person face" />
                        <AvatarFallback>{activeConversation?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{activeConversation?.name}</CardTitle>
                        <p className="text-sm text-green-500">Online</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                        <div className="p-6 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-end gap-2", msg.sender === 'agent' ? "justify-start" : "justify-end")}>
                                    {msg.sender === 'agent' && <Avatar className="h-8 w-8"><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="agent face" /><AvatarFallback>A</AvatarFallback></Avatar>}
                                    <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3 text-sm", msg.sender === 'agent' ? "bg-secondary rounded-bl-none" : "bg-primary text-primary-foreground rounded-br-none")}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.sender === 'customer' && <Avatar className="h-8 w-8"><AvatarImage src={activeConversation?.avatar} alt={activeConversation?.name} data-ai-hint="person face" /><AvatarFallback>{activeConversation?.name?.charAt(0)}</AvatarFallback></Avatar>}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <div className="p-4 border-t">
                     <form onSubmit={handleSendMessage} className="relative">
                        <Textarea 
                            placeholder="Type your message..." 
                            className="pr-20" 
                            rows={1}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <Button type="submit" className="absolute right-2 bottom-1 h-10 w-16" disabled={!newMessage.trim()}>
                            Send <Send className="ml-2 h-4 w-4"/>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
