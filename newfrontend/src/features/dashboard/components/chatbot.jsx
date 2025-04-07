import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    MessageSquare,
    X,
    Send,
    Loader2,
    Bot,
    User,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@clerk/clerk-react";

const INITIAL_MESSAGES = [
    {
        id: 1,
        role: "assistant",
        content:
            "Hello! I'm your medical assistant. How can I help you with your health questions today?",
        timestamp: new Date(),
    },
];

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { getToken } = useAuth();

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setError(null);
        }
    }, [isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        setError(null);

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_CHATBOT_SERVER_URL
                }/search?query=${encodeURIComponent(userMessage.content)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()} `,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        "No relevant information found. Please try rephrasing your question."
                    );
                }
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content: data.answer,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    "Sorry, I'm having trouble connecting to the medical database right now.",
                timestamp: new Date(),
                isError: true,
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                        }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col"
                    >
                        <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
                            <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2 border-2 border-primary-foreground/20">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                    <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                                        <Bot size={16} />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-sm">
                                        Medical Assistant
                                    </h3>
                                    <p className="text-xs text-primary-foreground/80">
                                        {isLoading ? "Thinking..." : "Online"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                                onClick={toggleChat}
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="m-3 py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs ml-2">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex",
                                            message.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                        )}
                                    >
                                        <div className="flex items-end gap-2 max-w-[80%]">
                                            {message.role === "assistant" && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        <Bot size={16} />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}

                                            <div
                                                className={cn(
                                                    "rounded-lg px-3 py-2 text-sm",
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : message.isError
                                                        ? "bg-destructive/10 text-destructive"
                                                        : "bg-muted"
                                                )}
                                            >
                                                <p>{message.content}</p>
                                                <p
                                                    className={cn(
                                                        "text-xs mt-1",
                                                        message.role === "user"
                                                            ? "text-primary-foreground/70"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {formatTime(
                                                        message.timestamp
                                                    )}
                                                </p>
                                            </div>

                                            {message.role === "user" && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                        <User size={16} />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex items-end gap-2 max-w-[80%]">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    <Bot size={16} />
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="rounded-lg px-4 py-3 bg-muted">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-3 border-t">
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ask a medical question..."
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button
                                    size="icon"
                                    className="rounded-full h-9 w-9 flex-shrink-0"
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
            >
                <Button
                    onClick={toggleChat}
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-lg",
                        isOpen
                            ? "bg-destructive hover:bg-destructive/90"
                            : "bg-primary hover:bg-primary/90"
                    )}
                >
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </Button>

                {!isOpen && messages.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {messages.length - 1}
                    </span>
                )}
            </motion.div>
        </div>
    );
};

export default Chatbot;
