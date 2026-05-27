'use client';
// 3D-shaded thumbnail used in puzzle cards & daily hero.
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { cageColor } from '@/lib/utils';
import type { Cage } from '@/lib/types';

interface Props {
  cages: Cage[];
  /** 81-cell flat grid; non-zero = pre-filled (rendered as a raised tile). */
  grid?: number[][];
  size?: number;
  interactive?: boolean;
  rotation?: { x: number; y: number };
}

export function MiniGridPreview({ cages, grid, size = 120, interactive = false, rotation }: Props) {
  const reducedMotion = useReducedMotion();
  const cellToCage = useMemo(() => {
    const m: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
    cages.forEach((cg) => cg.cells.forEach(([r, c]) => (m[r][c] = cg.id)));
    return m;
  }, [cages]);

  const baseRotation = rotation ?? { x: 8, y: -8 };
  const animate = reducedMotion
    ? { rotateX: 0, rotateY: 0 }
    : { rotateX: baseRotation.x, rotateY: baseRotation.y };
  const hover = reducedMotion ? undefined : { rotateX: baseRotation.x * 0.5, rotateY: baseRotation.y * 0.5, scale: 1.04 };

  return (
    <motion.div
      animate={animate}
      whileHover={interactive ? hover : undefined}
      transition={{ type: 'spring', stiffness: 100, damping: 16 }}
      style={{
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
        perspective: 600,
      }}
      className="relative"
    >
      <div
        className="grid grid-cols-9 gap-px rounded relative"
        style={{
          width: size,
          height: size,
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: 1,
          transformStyle: 'preserve-3d',
        }}
        aria-hidden
      >
        {Array.from({ length: 81 }).map((_, idx) => {
          const r = Math.floor(idx / 9);
          const c = idx % 9;
          const cageId = cellToCage[r][c];
          const color = cageId >= 0 ? cageColor(cageId) : '#1a1a26';
          const filled = grid ? (grid[r]?.[c] ?? 0) !== 0 : false;
          return (
            <div
              key={idx}
              style={{
                background: filled
                  ? `linear-gradient(180deg, ${color}3a 0%, ${color}1a 100%)`
                  : `${color}26`,
                boxShadow: filled
                  ? `inset 0 0 0 1px ${color}50, inset 0 1px 0 rgba(255,255,255,0.10)`
                  : `inset 0 0 0 1px ${color}1a`,
                transform: filled ? 'translateZ(2px)' : 'translateZ(0)',
              }}
            />
          );
        })}
        {/* Top specular highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent 50%)',
          }}
        />
      </div>
    </motion.div>
  );
}
