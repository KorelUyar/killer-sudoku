'use client';
import { useMemo } from 'react';
import { Eraser, PencilLine } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/components/shared/SoundProvider';
import { cn } from '@/lib/utils';

export function NumberPad() {
  const placeNumber = useGameStore((s) => s.placeNumber);
  const erase = useGameStore((s) => s.erase);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const notesMode = useGameStore((s) => s.notesMode);
  const grid = useGameStore((s) => s.grid);
  const selected = useGameStore((s) => s.selected);
  const status = useGameStore((s) => s.status);
  const { play } = useSound();

  const selectedValue = selected ? grid[selected[0]][selected[1]] : 0;
  const disabled = status !== 'playing';

  // Count how many copies of each digit are missing from the grid (max 9).
  const remaining = useMemo(() => {
    const counts: Record<number, number> = { 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9 };
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = grid[r][c];
        if (v >= 1 && v <= 9) counts[v] = Math.max(0, counts[v] - 1);
      }
    }
    return counts;
  }, [grid]);

  return (
    <div className="panel p-4 flex flex-col gap-3">
      <div className="grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const isExhausted = remaining[n] === 0;
          const isActive = selectedValue === n && !isExhausted;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled || isExhausted}
              onClick={() => {
                placeNumber(n);
                play('place');
              }}
              aria-label={`Place ${n}, ${remaining[n]} remaining`}
              className={cn(
                'numpad-btn aspect-square text-xl tabular-nums',
                isActive && 'active',
                isExhausted && 'exhausted',
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={toggleNotesMode}
          className={cn('btn-ghost', notesMode && '!border-[color:var(--iris)] !text-[color:var(--iris)]')}
          aria-pressed={notesMode}
        >
          <PencilLine className="h-4 w-4" />
          Notes {notesMode ? 'on' : 'off'}
        </button>
        <button
          onClick={() => {
            erase();
            play('erase');
          }}
          className="btn-ghost"
        >
          <Eraser className="h-4 w-4" />
          Erase
        </button>
      </div>
    </div>
  );
}
