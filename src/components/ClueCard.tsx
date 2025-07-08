// src/components/ClueCard.tsx
'use client';
import { useRef, useEffect } from 'react';

interface ClueCardProps {
  messages: string[]; // last few messages
}

export default function ClueCard({ messages }: ClueCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = 600;
    const h = 400;
    canvas.width = w;
    canvas.height = h;

    // background
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    // ghost watermark
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#FFF';
    ctx.font = '200px serif';
    ctx.fillText('👻', w/2 - 100, h/2 + 70);
    ctx.globalAlpha = 1;

    // messages
    ctx.fillStyle = '#FFF';
    ctx.font = '18px monospace';
    const snippet = messages.join('  •  ');
    wrapText(ctx, snippet, 20, 60, w - 40, 24);

    // timestamp
    ctx.font = '16px monospace';
    ctx.fillText(new Date().toLocaleString(), 20, h - 20);

  }, [messages]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  return (
    <div className="flex flex-col items-center my-8">
      <canvas ref={canvasRef} className="border border-white/30 rounded" />
      <a
        download="clue-card.png"
        href={canvasRef.current?.toDataURL()}
        className="mt-4 px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
      >
        Download Clue Card
      </a>
    </div>
  );
}
