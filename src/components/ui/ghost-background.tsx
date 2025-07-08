// src/components/ui/ghost-background.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Ghost as GhostIcon } from 'lucide-react';

interface GhostData {
  top: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
}

export default function GhostBackground() {
  const [ghosts, setGhosts] = useState<GhostData[]>([]);

  useEffect(() => {
    // Generate once, client-side only
    const data: GhostData[] = Array.from({ length: 6 }).map(() => ({
      top: `${10 + Math.random() * 70}%`,
      left: `${10 + Math.random() * 70}%`,
      animationDuration: `${4 + Math.random() * 4}s`,
      animationDelay: `${Math.random() * 2}s`,
    }));
    setGhosts(data);
  }, []);

  // Don’t render on the server (ghosts.length===0) to avoid mismatch
  if (ghosts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ghosts.map((g, i) => (
        <GhostIcon
          key={i}
          size={48}
          strokeWidth={1.5}
          className="absolute text-white/20 animate-ghost"
          style={{
            top: g.top,
            left: g.left,
            animationDuration: g.animationDuration,
            animationDelay: g.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
