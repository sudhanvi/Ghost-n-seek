// src/app/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { auth, signIn, onAuthStateChanged, FirebaseUser } from '@/lib/firebase';
import ChatRoom from '@/components/ChatRoom';

export default function ChatPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // ensure anonymous login
    signIn().catch(console.error);
    // watch auth state
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  if (!user) {
    return <p className="text-center mt-20 text-white">Loading…</p>;
  }
  return <ChatRoom currentUser={{ uid: user.uid }} />;
}
