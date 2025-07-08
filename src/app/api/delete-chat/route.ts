// src/app/api/delete-chat/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();
    if (!chatId) throw new Error('No chatId provided');

    // Delete all messages
    const msgs = await getDocs(collection(db, 'chats', chatId, 'messages'));
    await Promise.all(msgs.docs.map(m => deleteDoc(doc(db, 'chats', chatId, 'messages', m.id))));

    // Delete the chat itself
    await deleteDoc(doc(db, 'chats', chatId));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[delete-chat]', e);
    return NextResponse.json({ success: false });
  }
}
