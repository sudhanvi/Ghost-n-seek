// src/components/ChatRoom.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { db, serverTimestamp, Timestamp } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import RuleSheet from './RuleSheet';
import PaymentButton from './PaymentButton';

interface Message {
  id: string;
  uid: string;
  text: string;
  createdAt: Timestamp;
}

export default function ChatRoom({ currentUser }: { currentUser: { uid: string } }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1) Pair & store chatId
  useEffect(() => {
    fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: currentUser.uid }),
    })
      .then((res) => res.json())
      .then((d: { chatId: string | null }) => {
        if (d.chatId) {
          setChatId(d.chatId);
          sessionStorage.setItem('chatId', d.chatId);
        }
      })
      .catch(console.error);

    // also listen for any chat you’re in
    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      snap.docs.forEach((docSnap) => {
        const id = docSnap.id;
        if (id !== chatId) {
          setChatId(id);
          sessionStorage.setItem('chatId', id);
        }
      });
    });
    return () => unsub();
  }, [currentUser.uid]);

  // 2) Subscribe to messages and record history
  useEffect(() => {
    if (!chatId) return;
    const msgsQ = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(msgsQ, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setMessages(all);
      // scroll
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
      // record in sessionStorage
      const history = JSON.parse(sessionStorage.getItem('chatHistory') || '[]');
      const newEntries = all
        .slice(history.length)
        .map((m) => ({
          sender: m.uid === currentUser.uid ? 'me' : 'them',
          text: m.text,
        }));
      if (newEntries.length) {
        sessionStorage.setItem(
          'chatHistory',
          JSON.stringify([...history, ...newEntries])
        );
      }
    });
    return () => unsub();
  }, [chatId]);

  // 3) Timer countdown
  useEffect(() => {
    if (!chatId) return;
    if (timeLeft <= 0) {
      router.push('/clue-card');
      return;
    }
    const iv = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(iv);
  }, [chatId, timeLeft, router]);

  const sendMessage = async () => {
    if (!chatId || !input.trim()) return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      uid: currentUser.uid,
      text: input.trim(),
      createdAt: serverTimestamp(),
    });
    setInput('');
  };

  const handleEndChat = () => {
    router.push('/clue-card');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 pt-6 pb-8 relative z-10">
      {/* End Chat Button */}
      <div className="flex justify-end">
        <button
          onClick={handleEndChat}
          className="text-sm text-yellow-300 hover:text-yellow-500"
        >
          End Chat
        </button>
      </div>

      {/* Rules */}
      <div className="flex justify-center">
        <RuleSheet />
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="chat-container bg-white/10 backdrop-blur-sm rounded-lg mx-auto w-full max-w-lg flex-1 overflow-y-auto"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`inline-block px-4 py-2 my-1 rounded-lg ${
              m.uid === currentUser.uid ? 'self-end bg-indigo-600' : 'self-start bg-gray-700'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Timer + Input */}
      <div className="flex items-center justify-between mt-4 w-full max-w-lg mx-auto">
        <div className="timer">{`${Math.floor(timeLeft / 60)}:${String(
          timeLeft % 60
        ).padStart(2, '0')}`}</div>
        {timeLeft > 0 ? (
          <>
            <input
              className="flex-1 rounded px-3 py-2 bg-white/20 text-white outline-none mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message…"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Send
            </button>
          </>
        ) : (
          <PaymentButton amount="30.00" currency="INR" />
        )}
      </div>
    </div>
  );
}
