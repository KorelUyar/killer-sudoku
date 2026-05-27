'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function AnimatedSection({
  children,
  delay = 0,
  className,
  as = 'section',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'section' | 'div';
}) {
  const reducedMotion = useReducedMotion();
  const Tag = as === 'section' ? motion.section : motion.div;
  if (reducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <Tag
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
