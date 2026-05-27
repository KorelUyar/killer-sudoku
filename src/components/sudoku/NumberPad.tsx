'use client';
import { motion } from 'framer-motion';
import { Eraser, PencilLine } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/components/shared/SoundProvider';

export function NumberPad() {
  const placeNumber = useGameStore((s) => s.placeNumber);
  const erase = useGameStore((s) => s.erase);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const notesMode = useGameStore((s) => s.notesMode);
  const { play } = useSound();

  return (
    <div className="card flex flex-col gap-3">
      <div className="grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              placeNumber(n);
              play('place');
            }}
            className="aspect-square rounded-lg bg-white/[0.06] hover:bg-accent-violet/30 transition-colors font-mono text-xl text-white font-semibold border border-white/10"
          >
            {n}
          </motion.button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => toggleNotesMode()}
          className={`btn-ghost ${notesMode ? '!border-accent-violet !text-accent-glow' : ''}`}
          aria-pressed={notesMode}
        >
          <PencilLine className="h-4 w-4" />
          Notes {notesMode ? 'on' : 'off'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            erase();
            play('erase');
          }}
          className="btn-ghost"
        >
          <Eraser className="h-4 w-4" />
          Erase
        </motion.button>
      </div>
    </div>
  );
}
