// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import RuleSheet from '@/components/RuleSheet';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const chatId = sessionStorage.getItem('chatId');
    if (chatId) {
      fetch('/api/delete-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      }).finally(() => {
        sessionStorage.removeItem('chatId');
        sessionStorage.removeItem('chatHistory');
      });
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-12 px-4">
      <RuleSheet />
      <h1 className="mt-8 text-5xl font-extrabold text-center">Ghost-n-Seek</h1>
      <p className="mt-4 text-lg text-center max-w-2xl">
        Connect anonymously for a 3-minute spooky chat, then unlock your custom clue card to find them again. No personal info needed—just pure ghostly fun!
      </p>
      <Link href="/chat" className="mt-10">
        <button className="px-8 py-3 bg-indigo-600 rounded-full text-lg font-medium hover:bg-indigo-700 transition">
          Start Chat
        </button>
      </Link>
    </main>
  );
}
