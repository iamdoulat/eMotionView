
"use client";

import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  sender: 'customer' | 'agent';
  text: string;
  timestamp: number;
}

const getChatHistory = (conversationId: string): ChatMessage[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const historyJson = localStorage.getItem(`live-chat-${conversationId}`);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to parse chat history", error);
        return [];
    }
};

const saveChatHistory = (conversationId: string, history: ChatMessage[]) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(`live-chat-${conversationId}`, JSON.stringify(history));
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Failed to save chat history", error);
    }
};

export function useLiveChat(conversationId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const onStorageChange = useCallback(() => {
        setMessages(getChatHistory(conversationId));
    }, [conversationId]);
    
    useEffect(() => {
        const initialMessages = getChatHistory(conversationId);
        // Add initial message if history is empty
        if (initialMessages.length === 0) {
            const welcomeMessage: ChatMessage = { sender: 'agent', text: "Hi there! How can I help you today?", timestamp: Date.now() };
            initialMessages.push(welcomeMessage);
            saveChatHistory(conversationId, initialMessages);
        }
        setMessages(initialMessages);
        setIsInitialized(true);
        
        window.addEventListener('storage', onStorageChange);
        return () => {
            window.removeEventListener('storage', onStorageChange);
        };
    }, [conversationId, onStorageChange]);

    const sendMessage = (text: string, sender: 'customer' | 'agent') => {
        if (!text.trim()) return;

        const newMessage: ChatMessage = {
            sender,
            text,
            timestamp: Date.now()
        };
        const updatedHistory = [...getChatHistory(conversationId), newMessage];
        setMessages(updatedHistory);
        saveChatHistory(conversationId, updatedHistory);
    };

    return {
        messages,
        sendMessage,
        isInitialized
    };
}
