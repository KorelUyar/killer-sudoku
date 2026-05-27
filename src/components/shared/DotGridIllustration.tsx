'use client';
import { motion, useReducedMotion } from 'framer-motion';

// CSS-only 3×3 animated dot grid used in empty-state graphics.
export function DotGridIllustration({ size = 96 }: { size?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-50">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-full"
            style={{ backgroundColor: '#a78bfa' }}
            animate={reducedMotion ? { opacity: 0.4 } : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 2.4, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
