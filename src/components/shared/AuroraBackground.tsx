'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Subtle ambient lighting. Single accent tone, very low opacity — never
// dominates the screen.
export function AuroraBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden />;
  }
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-1/3 left-1/4 h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.10), transparent 70%)' }}
        animate={{ x: [0, 50, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/3 -right-1/4 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.07), transparent 70%)' }}
        animate={{ x: [0, -60, 30, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' /><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
