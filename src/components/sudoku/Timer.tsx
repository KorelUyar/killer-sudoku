'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { formatTime } from '@/lib/utils';

export function Timer() {
  const displaySeconds = useGameStore((s) => s.displaySeconds);
  const tick = useGameStore((s) => s.tick);
  const status = useGameStore((s) => s.status);
  const flash = useGameStore((s) => s.hintPenaltyFlash);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tick, status]);

  return (
    <div className="relative flex items-center gap-2 text-white/85">
      <Clock className="h-4 w-4 text-accent-glow" />
      <span className="font-mono text-lg tabular-nums">{formatTime(displaySeconds)}</span>
      <AnimatePresence>
        {flash > 0 && (
          <motion.span
            key={flash}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -32 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute right-0 -top-1 text-xs font-mono font-semibold text-rose-300 pointer-events-none"
          >
            +60s
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
