// src/components/RuleSheet.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Ghost as GhostIcon } from 'lucide-react';

export default function RuleSheet() {
  const rules = [
    'No personal details (real names, numbers, etc.)',
    '3-minute chat timer',
    'Then generate your clue card!',
    'Have fun & stay spooky 👻',
  ];

  return (
    <Card className="max-w-md mx-auto my-8 bg-white/5 backdrop-blur-sm">
      <CardContent>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <GhostIcon
            size={32}
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            className="animate-ghost"
          />
          How to Play
        </h2>
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="mt-4 space-y-2 list-disc list-inside text-lg"
        >
          {rules.map((r) => (
            <motion.li key={r} whileHover={{ scale: 1.03 }}>
              {r}
            </motion.li>
          ))}
        </motion.ul>
      </CardContent>
    </Card>
  );
}
