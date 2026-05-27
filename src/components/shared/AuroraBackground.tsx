'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AuroraBackground() {
  // Avoid SSR/CSR mismatch from framer-motion's initial-prop hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden />;
  }
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-1/2 left-1/4 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)' }}
        animate={{ x: [0, 60, -40, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/3 -right-1/4 h-[800px] w-[800px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.28), transparent 70%)' }}
        animate={{ x: [0, -80, 40, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' /><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
