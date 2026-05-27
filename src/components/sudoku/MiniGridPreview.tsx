// Tiny non-interactive grid thumbnail used in puzzle cards.
import { cageColor } from '@/lib/utils';
import type { Cage } from '@/lib/types';

interface Props {
  cages: Cage[];
  size?: number;
}

export function MiniGridPreview({ cages, size = 120 }: Props) {
  const cellToCage: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  cages.forEach((cg) => cg.cells.forEach(([r, c]) => (cellToCage[r][c] = cg.id)));

  return (
    <div
      className="grid grid-cols-9 gap-px rounded"
      style={{
        width: size,
        height: size,
        backgroundColor: 'rgba(255,255,255,0.10)',
        padding: 1,
      }}
      aria-hidden
    >
      {Array.from({ length: 81 }).map((_, idx) => {
        const r = Math.floor(idx / 9);
        const c = idx % 9;
        const cageId = cellToCage[r][c];
        const color = cageId >= 0 ? cageColor(cageId) : '#13131a';
        return (
          <div
            key={idx}
            style={{
              backgroundColor: `${color}30`,
            }}
          />
        );
      })}
    </div>
  );
}
