'use client';
import { useEffect, useMemo } from 'react';
import type { Cage } from '@/lib/types';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/components/shared/SoundProvider';
import { cageColor } from '@/lib/utils';

interface Props {
  cages: Cage[];
  interactive?: boolean;
}

export function SudokuGrid({ cages, interactive = true }: Props) {
  const grid = useGameStore((s) => s.grid);
  const notes = useGameStore((s) => s.notes);
  const givens = useGameStore((s) => s.givens);
  const revealed = useGameStore((s) => s.revealed);
  const selected = useGameStore((s) => s.selected);
  const conflicts = useGameStore((s) => s.conflicts);
  const lastPlaced = useGameStore((s) => s.lastPlaced);
  const hintCell = useGameStore((s) => s.hintCell);
  const status = useGameStore((s) => s.status);
  const selectCell = useGameStore((s) => s.selectCell);
  const placeNumber = useGameStore((s) => s.placeNumber);
  const erase = useGameStore((s) => s.erase);

  const { play } = useSound();

  const cellInfo = useMemo(() => {
    const m: Array<Array<{ cageId: number; sum: number; isFirst: boolean } | null>> = Array.from(
      { length: 9 },
      () => Array(9).fill(null),
    );
    for (const cage of cages) {
      const sorted = [...cage.cells].sort(([a, b], [c, d]) => a - c || b - d);
      const [fr, fc] = sorted[0];
      for (const [r, c] of cage.cells) {
        m[r][c] = { cageId: cage.id, sum: cage.sum, isFirst: r === fr && c === fc };
      }
    }
    return m;
  }, [cages]);

  const selR = selected?.[0];
  const selC = selected?.[1];
  const selectedValue = selR != null && selC != null ? grid[selR][selC] : 0;

  useEffect(() => {
    if (!interactive || status === 'gave_up' || status === 'won') return;
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      const [r, c] = selected;
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        placeNumber(Number(e.key));
        play('place');
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        erase();
        play('erase');
      } else if (e.key === 'ArrowUp' && r > 0) {
        e.preventDefault();
        selectCell(r - 1, c);
      } else if (e.key === 'ArrowDown' && r < 8) {
        e.preventDefault();
        selectCell(r + 1, c);
      } else if (e.key === 'ArrowLeft' && c > 0) {
        e.preventDefault();
        selectCell(r, c - 1);
      } else if (e.key === 'ArrowRight' && c < 8) {
        e.preventDefault();
        selectCell(r, c + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, interactive, status, placeNumber, erase, selectCell, play]);

  return (
    <div className="sudoku-grid" role="grid" aria-label="Killer Sudoku grid">
      {grid.map((row, r) =>
        row.map((value, c) => {
          const info = cellInfo[r][c];
          const isSel = selR === r && selC === c;
          const isPeer =
            !isSel &&
            (selR === r ||
              selC === c ||
              (selR != null && Math.floor(selR / 3) === Math.floor(r / 3) && selC != null && Math.floor(selC / 3) === Math.floor(c / 3)));
          const isSame = !isSel && value !== 0 && selectedValue !== 0 && value === selectedValue;
          const isConflict = conflicts.has(`${r},${c}`);
          const isJustPlaced = lastPlaced && lastPlaced[0] === r && lastPlaced[1] === c;
          const isHint = hintCell && hintCell[0] === r && hintCell[1] === c;
          const isRevealed = revealed[r]?.[c] ?? false;
          const noteSet = notes[r][c];
          const boxRight = (c + 1) % 3 === 0 && c !== 8;
          const boxBottom = (r + 1) % 3 === 0 && r !== 8;
          const boxCls = boxRight && boxBottom ? 'box-rb' : boxRight ? 'box-r' : boxBottom ? 'box-b' : '';

          const classes = [
            'sudoku-cell',
            boxCls,
            givens[r][c] ? 'given' : 'user-entered',
            isRevealed ? 'solution-revealed' : '',
            isSel ? 'selected' : '',
            isPeer ? 'peer' : '',
            isSame ? 'same-number' : '',
            isConflict ? 'conflict' : '',
            isJustPlaced ? 'just-placed' : '',
            isHint ? 'hint-cell' : '',
          ]
            .filter(Boolean)
            .join(' ');

          // Cage tint as 8% opacity background
          const tintBg = info ? `color-mix(in oklab, ${cageColor(info.cageId)} 10%, transparent)` : undefined;

          return (
            <div
              key={`${r}-${c}`}
              className={classes}
              onClick={() => interactive && status !== 'gave_up' && selectCell(r, c)}
              role="gridcell"
              aria-selected={isSel}
              aria-label={`Row ${r + 1}, column ${c + 1}${value ? `, value ${value}` : ''}`}
              style={{
                // Layer tint on top of base elevated bg via outline-less inset shadow.
                background: tintBg
                  ? `linear-gradient(${tintBg}, ${tintBg}), #131316`
                  : undefined,
              }}
            >
              {info?.isFirst && (
                <span className="cage-sum" style={{ color: cageColor(info.cageId) }}>
                  {info.sum}
                </span>
              )}
              {value !== 0 ? (
                value
              ) : noteSet.size > 0 ? (
                <div className="notes-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <span key={n}>{noteSet.has(n) ? n : ''}</span>
                  ))}
                </div>
              ) : (
                ''
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
