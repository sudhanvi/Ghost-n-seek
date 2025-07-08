// src/app/clue-card/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClueCardPreview, { Clue } from '@/components/ClueCardPreview';
import { generateCluesFromChat } from '@/ai/flows/generate-clues-from-chat';
import { generateClueCardImage } from '@/ai/flows/generate-clue-card-image';

export default function ClueCardPage() {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const [clues, setClues] = useState<Clue[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);
  const [createdAt, setCreatedAt] = useState<Date>();
  const [colorPreference] = useState<'purple' | 'indigo'>('purple');

  // load clues once
  useEffect(() => {
    (async () => {
      const raw = sessionStorage.getItem('chatHistory') || '[]';
      const chatHistory: { sender: 'me' | 'them'; text: string }[] = JSON.parse(raw);
      const { suggestions } = await generateCluesFromChat({
        chatHistory,
        targetSender: 'them',
      });
      setClues((suggestions || []).map((s) => ({ text: s.clue })));
      setCreatedAt(new Date());
    })();
  }, []);

  const handleShare = async () => {
    setIsInteractive(false);
    // 1) call your flow
    const result = await generateClueCardImage({
      clues: clues.map((c) => c.text),
      colorPreference,
    });
    // 2) normalize to string
    const url: string =
      typeof result === 'string'
        ? result
        : // if it's an object, pull out the property
          (result as { imageUrl: string }).imageUrl;
    // 3) pass only the string
    setImageUrl(url);
  };

  const handleClose = async () => {
    /* ...your delete-chat + router.push('/') logic... */
  };

  // if there's nothing to show, bail
  if (!clues.length && !imageUrl) {
    handleClose();
    return null;
  }

  return (
    <div className="py-12 px-4 flex flex-col items-center space-y-6">
      <ClueCardPreview
        ref={previewRef}
        clues={clues}
        colorPreference={colorPreference}
        onRemoveClue={(i) => setClues((cs) => cs.filter((_, idx) => idx !== i))}
        onShare={handleShare}
        imageUrl={imageUrl}
        isInteractive={isInteractive}
        createdAt={createdAt}
      />
      {imageUrl && (
        <button
          className="mt-4 px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          onClick={handleClose}
        >
          Back to Home
        </button>
      )}
    </div>
  );
}
