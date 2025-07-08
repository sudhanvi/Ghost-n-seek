// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import GhostBackground from '@/components/ui/ghost-background';
import PayPalProvider from '@/components/PaypalProvider'; // your existing provider

export const metadata = {
  title: 'Ghost-n-Seek',
  description: 'Anonymous 3-minute spooky chats & clue cards',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <body className="overflow-hidden relative">
        {/* 1) The “spooky-bg” div lives here behind everything */}
        <GhostBackground />

        {/* 2) Your app content goes on top (give it a higher stacking context) */}
        <div className="relative z-10">
          <PayPalProvider>
            {children}
          </PayPalProvider>
        </div>
      </body>
    </html>
  );
}
