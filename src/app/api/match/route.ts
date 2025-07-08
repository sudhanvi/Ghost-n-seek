// src/app/api/match/route.ts
import { NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminDb = (() => {
  // If there’s already an initialized app, use it; otherwise, init one.
  const apps = getApps();
  const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

  const app = apps.length
    ? apps[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });
  return getFirestore(app);
})();

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    // 1️⃣ push into waiting_users
    const waitingRef = adminDb.collection('waiting_users');
    await waitingRef.add({ uid, timestamp: Timestamp.now() });

    // 2️⃣ grab two oldest
    const snap = await waitingRef
      .orderBy('timestamp', 'asc')
      .limit(2)
      .get();

    if (snap.size === 2) {
      const [a, b] = snap.docs;
      const chatId = `${a.id}_${b.id}`;

      // cleanup queue
      await waitingRef.doc(a.id).delete();
      await waitingRef.doc(b.id).delete();

      // create chat
      await adminDb.collection('chats').doc(chatId).set({
        users: [a.data().uid, b.data().uid],
        createdAt: Timestamp.now(),
      });

      return NextResponse.json({ chatId });
    }

    return NextResponse.json({ chatId: null });
  } catch (e) {
    console.error('[match] error', e);
    return NextResponse.json({ chatId: null });
  }
}
