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
  const selected = useGameStore((s) => s.selected);
  const conflicts = useGameStore((s) => s.conflicts);
  const lastPlaced = useGameStore((s) => s.lastPlaced);
  const hintCell = useGameStore((s) => s.hintCell);
  const selectCell = useGameStore((s) => s.selectCell);
  const placeNumber = useGameStore((s) => s.placeNumber);
  const erase = useGameStore((s) => s.erase);

  const { play } = useSound();

  const cellToCage = useMemo(() => {
    const m: Array<Array<{ cageId: number; sum: number; isFirst: boolean }>> = Array.from(
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

  const cageBorders = useMemo(() => {
    const map: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
    cages.forEach((cg) => cg.cells.forEach(([r, c]) => (map[r][c] = cg.id)));
    const borders: Array<{ r: number; c: number; t: boolean; b: boolean; l: boolean; rt: boolean }> = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const id = map[r][c];
        borders.push({
          r,
          c,
          t: r === 0 || map[r - 1][c] !== id,
          b: r === 8 || map[r + 1][c] !== id,
          l: c === 0 || map[r][c - 1] !== id,
          rt: c === 8 || map[r][c + 1] !== id,
        });
      }
    }
    return borders;
  }, [cages]);

  const selR = selected?.[0];
  const selC = selected?.[1];
  const selectedValue = selR != null && selC != null ? grid[selR][selC] : 0;

  useEffect(() => {
    if (!interactive) return;
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
  }, [selected, interactive, placeNumber, erase, selectCell, play]);

  return (
    <div className="sudoku-grid" role="grid" aria-label="Killer Sudoku grid">
      {grid.map((row, r) =>
        row.map((value, c) => {
          const cageInfo = cellToCage[r][c];
          const isSel = selR === r && selC === c;
          const isPeer =
            !isSel && (selR === r || selC === c || (selR != null && Math.floor(selR / 3) === Math.floor(r / 3) && selC != null && Math.floor(selC / 3) === Math.floor(c / 3)));
          const isSame = !isSel && value !== 0 && selectedValue !== 0 && value === selectedValue;
          const isConflict = conflicts.has(`${r},${c}`);
          const isJustPlaced = lastPlaced && lastPlaced[0] === r && lastPlaced[1] === c;
          const isHint = hintCell && hintCell[0] === r && hintCell[1] === c;
          const b = cageBorders[r * 9 + c];
          const noteSet = notes[r][c];

          const classes = [
            'sudoku-cell',
            givens[r][c] ? 'given' : '',
            isSel ? 'selected' : '',
            isPeer ? 'peer' : '',
            isSame ? 'same-number' : '',
            isConflict ? 'conflict' : '',
            isJustPlaced ? 'just-placed' : '',
            isHint ? 'hint-cell' : '',
            (c + 1) % 3 === 0 && c !== 8 ? 'border-r-thick' : '',
            (r + 1) % 3 === 0 && r !== 8 ? 'border-b-thick' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={`${r}-${c}`}
              className={classes}
              onClick={() => interactive && selectCell(r, c)}
              role="gridcell"
              aria-selected={isSel}
              aria-label={`Row ${r + 1}, column ${c + 1}${value ? `, value ${value}` : ''}`}
              style={{
                background: !isSel && !isPeer && !isSame && !isConflict ? `color-mix(in oklab, ${cageColor(cageInfo?.cageId ?? 0)} 8%, transparent)` : undefined,
                outline: b.t || b.b || b.l || b.rt ? undefined : undefined,
                boxShadow: [
                  b.t ? 'inset 0 1px 0 0 rgba(255,255,255,0.45), inset 0 2px 0 0 transparent' : '',
                  b.b ? 'inset 0 -1px 0 0 rgba(255,255,255,0.45)' : '',
                  b.l ? 'inset 1px 0 0 0 rgba(255,255,255,0.45)' : '',
                  b.rt ? 'inset -1px 0 0 0 rgba(255,255,255,0.45)' : '',
                ]
                  .filter(Boolean)
                  .join(', ') || undefined,
              }}
            >
              {cageInfo?.isFirst && (
                <span
                  className="cage-sum"
                  style={{ color: `color-mix(in oklab, ${cageColor(cageInfo.cageId)} 80%, white 20%)` }}
                >
                  {cageInfo.sum}
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
