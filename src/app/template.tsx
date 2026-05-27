'use client';
import { motion, useReducedMotion } from 'framer-motion';

// `template.tsx` remounts on every route change, so the entry animation
// re-runs without us needing AnimatePresence here.
export default function Template({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
