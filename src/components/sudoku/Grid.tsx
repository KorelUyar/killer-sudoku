'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Cage } from '@/lib/types';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/components/shared/SoundProvider';
import { cageColor } from '@/lib/utils';

interface Props {
  cages: Cage[];
  interactive?: boolean;
}

interface CageInfo {
  cageId: number;
  sum: number;
  color: string;
  isFirst: boolean;
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean };
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

  // Pre-compute per-cell cage info + dashed edges.
  const cageMap: CageInfo[][] = useMemo(() => {
    const cellToCageId: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
    cages.forEach((cg, idx) => cg.cells.forEach(([r, c]) => (cellToCageId[r][c] = idx)));

    const m: CageInfo[][] = Array.from({ length: 9 }, () => Array(9).fill(null as unknown as CageInfo));
    for (const cage of cages) {
      const sorted = [...cage.cells].sort(([a, b], [c, d]) => a - c || b - d);
      const [fr, fc] = sorted[0];
      const color = cageColor(cage.id);
      for (const [r, c] of cage.cells) {
        const id = cellToCageId[r][c];
        const top = r === 0 || cellToCageId[r - 1][c] !== id;
        const bottom = r === 8 || cellToCageId[r + 1][c] !== id;
        const left = c === 0 || cellToCageId[r][c - 1] !== id;
        const right = c === 8 || cellToCageId[r][c + 1] !== id;
        m[r][c] = {
          cageId: cage.id,
          sum: cage.sum,
          color,
          isFirst: r === fr && c === fc,
          edges: { top, bottom, left, right },
        };
      }
    }
    return m;
  }, [cages]);

  const selR = selected?.[0];
  const selC = selected?.[1];
  const selectedValue = selR != null && selC != null ? grid[selR][selC] : 0;

  // Detect a cage that *just* became fully filled with the correct sum and no duplicates.
  // We track a one-shot animation per cage id; only fires on the transition empty→satisfied.
  const satisfiedCageIds = useMemo(() => {
    const result = new Set<number>();
    for (const cage of cages) {
      let sum = 0;
      let full = true;
      const seen = new Set<number>();
      for (const [r, c] of cage.cells) {
        const v = grid[r][c];
        if (!v) { full = false; break; }
        if (seen.has(v)) { full = false; break; }
        seen.add(v);
        sum += v;
      }
      if (full && sum === cage.sum) result.add(cage.id);
    }
    return result;
  }, [grid, cages]);

  const prevSatisfiedRef = useRef<Set<number>>(new Set());
  const [animatingCages, setAnimatingCages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newly = new Set<number>();
    for (const id of satisfiedCageIds) if (!prevSatisfiedRef.current.has(id)) newly.add(id);
    if (newly.size > 0) {
      setAnimatingCages(newly);
      play('complete');
      const t = window.setTimeout(() => setAnimatingCages(new Set()), 950);
      prevSatisfiedRef.current = new Set(satisfiedCageIds);
      return () => window.clearTimeout(t);
    }
    prevSatisfiedRef.current = new Set(satisfiedCageIds);
  }, [satisfiedCageIds, play]);

  useEffect(() => {
    if (!interactive || status === 'gave_up' || status === 'won') return;
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      const [r, c] = selected;
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        // Givens are immutable — placeNumber already guards but skip the sound too.
        if (givens[r][c]) return;
        placeNumber(Number(e.key));
        play('place');
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        if (givens[r][c]) return;
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
  }, [selected, interactive, status, placeNumber, erase, selectCell, play, givens]);

  return (
    <div className="sudoku-grid" role="grid" aria-label="Killer Sudoku grid">
      {grid.map((row, r) =>
        row.map((value, c) => {
          const info = cageMap[r][c];
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
          const isGiven = givens[r][c];
          const noteSet = notes[r][c];
          const boxRight = (c + 1) % 3 === 0 && c !== 8;
          const boxBottom = (r + 1) % 3 === 0 && r !== 8;
          const cageAnimating = info ? animatingCages.has(info.cageId) : false;
          const cageDone = info ? satisfiedCageIds.has(info.cageId) : false;

          const classes = [
            'sudoku-cell',
            boxRight ? 'box-divider-right' : '',
            boxBottom ? 'box-divider-bottom' : '',
            isGiven ? 'given locked' : 'user-entered',
            isRevealed ? 'solution-revealed' : '',
            isSel ? 'selected' : '',
            isPeer ? 'peer' : '',
            isSame ? 'same-number' : '',
            isConflict ? 'conflict' : '',
            isJustPlaced ? 'just-placed' : '',
            isHint ? 'hint-cell' : '',
            cageAnimating ? 'cage-satisfied' : '',
          ]
            .filter(Boolean)
            .join(' ');

          // Subtle 6% cage-color background; layered ON TOP of the elevated cell bg.
          const tint = info?.color;
          const cellBg = tint
            ? `linear-gradient(${tint}10, ${tint}10), var(--elevated)`
            : undefined;

          return (
            <div
              key={`${r}-${c}`}
              className={classes}
              data-row={r + 1}
              data-col={c + 1}
              onClick={() => interactive && status !== 'gave_up' && selectCell(r, c)}
              role="gridcell"
              aria-selected={isSel}
              aria-label={`Row ${r + 1}, column ${c + 1}${value ? `, value ${value}` : ''}${isGiven ? ', given' : ''}`}
              style={cellBg ? { background: cellBg } : undefined}
            >
              {/* Dashed cage outline — only on the edges where the cage ends */}
              {info?.edges.top && (
                <span className="cage-edge top" style={{ borderColor: info.color, opacity: 0.7 }} />
              )}
              {info?.edges.bottom && (
                <span className="cage-edge bottom" style={{ borderColor: info.color, opacity: 0.7 }} />
              )}
              {info?.edges.left && (
                <span className="cage-edge left" style={{ borderColor: info.color, opacity: 0.7 }} />
              )}
              {info?.edges.right && (
                <span className="cage-edge right" style={{ borderColor: info.color, opacity: 0.7 }} />
              )}

              {info?.isFirst && (
                <span
                  className={`cage-sum ${cageDone ? 'satisfied' : ''}`}
                  style={{ color: info.color }}
                >
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
