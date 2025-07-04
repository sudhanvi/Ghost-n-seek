"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Timer, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, FormEvent } from "react";

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
};

const initialMessages: Message[] = [
  { id: 1, sender: "them", text: "Hey..." },
];

const responses = [
  "Interesting... tell me more.",
  "Haha, really?",
  "I've always wanted to try that.",
  "What's your favorite movie?",
  "If you could travel anywhere, where would you go?",
  "I feel the same way.",
  "That's a unique perspective."
];

export default function ChatPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "chatting" | "ended">(
    "connecting"
  );
  const [timeLeft, setTimeLeft] = useState(180);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("chatting");
      setMessages(initialMessages);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "chatting" && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0) {
      setStatus("ended");
    }
  }, [status, timeLeft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (status === "chatting" && messages.length > 0 && messages[messages.length - 1].sender === 'me') {
      const timeout = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: "them",
            text: responses[Math.floor(Math.random() * responses.length)],
          },
        ]);
      }, 1500 + Math.random() * 1000);
      return () => clearTimeout(timeout);
    }
  }, [messages, status]);


  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        { id: Date.now(), sender: "me", text: inputValue.trim() },
      ]);
      setInputValue("");
    }
  };

  const handleEndChat = () => {
    setStatus("ended");
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (status === "connecting") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <div className="animate-pulse">
          <div className="rounded-full bg-primary/10 p-4">
            <div className="rounded-full bg-primary/20 p-3">
              <svg className="h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 1 0-8c-2 0-4 1.33-6 4Z"/><path d="M18 11.5a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/><path d="M6 11.5a4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 1 0 9Z"/></svg>
            </div>
          </div>
        </div>
        <h2 className="font-headline text-2xl font-semibold text-primary">Connecting you with a stranger...</h2>
        <p className="text-foreground/70">Get ready for a mysterious conversation.</p>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <h2 className="font-headline text-3xl font-bold text-primary">Chat Over</h2>
        <p className="max-w-md text-foreground/80">The connection has been severed. Did you feel a spark? Create a clue card to see if you can find them out in the wild.</p>
        <Button asChild size="lg" className="font-bold bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-full shadow-lg">
          <Link href="/clue-card">Create Your Clue Card</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${timeLeft <= 60 ? 'bg-destructive/20 text-destructive animate-pulse' : 'bg-muted'}`}>
            <Timer className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          {timeLeft <= 120 && timeLeft > 60 && <span className="text-sm font-medium text-amber-600">2 minutes left!</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={handleEndChat}>
          <X className="h-5 w-5" />
          <span className="sr-only">End Chat</span>
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 md:max-w-md lg:max-w-lg animate-in fade-in-20 slide-in-from-bottom-4 duration-500 ${
                  message.sender === "me"
                    ? "rounded-br-none bg-primary text-primary-foreground"
                    : "rounded-bl-none bg-muted"
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t bg-background/80 p-3 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Say something mysterious..."
            autoComplete="off"
            className="flex-1"
          />
          <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 rounded-full flex-shrink-0">
            <Send className="h-5 w-5" />
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </footer>
    </div>
  );
}
