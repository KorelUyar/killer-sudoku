'use client';
import Link from 'next/link';
import { motion, useInView, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Pencil,
  Trophy,
  CheckCircle2,
  Github,
} from 'lucide-react';
import { GITHUB_URL } from '@/lib/constants';
import { LogoMark } from '@/components/shared/Logo';

export function GuestLanding({ puzzleCount, userCount }: { puzzleCount: number; userCount: number }) {
  return (
    <div className="relative pt-16">
      <Hero />
      <Features />
      <HowItWorks />
      <StatsStrip puzzleCount={puzzleCount} userCount={userCount} />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-6 min-h-[80vh] flex items-center">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center w-full">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-6"
            style={{ color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <LogoMark size={10} />
            Skills Battle 2026
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-[-0.03em]"
            style={{ color: '#f4f4f5' }}
          >
            Master the art of Killer Sudoku.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg"
            style={{ color: '#a1a1aa' }}
          >
            Where math meets logic. Solve daily puzzles, design your own with the visual cage
            editor, and compete on a global leaderboard.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/auth/register" className="btn-primary text-base">
              Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/play" className="btn-ghost text-base">
              Explore puzzles
            </Link>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
            style={{ color: '#a1a1aa' }}
          >
            {['No ads', 'No tracking', 'Free forever'].map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" style={{ color: '#10b981' }} />
                {s}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-5"
          >
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: '#52525b' }}
            >
              <Github className="h-4 w-4" />
              View source on GitHub →
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-[460px]"
          style={{ perspective: 1400 }}
        >
          <InteractiveFloatingGrid />
        </motion.div>
      </div>
    </section>
  );
}

function InteractiveFloatingGrid() {
  // A 4×4 mini-puzzle preview that tilts toward the cursor.
  const ref = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 8, y: -10 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((e.clientX - centerX) / rect.width) * 20;
    const rotateX = -((e.clientY - centerY) / rect.height) * 20;
    setRotation({ x: rotateX, y: rotateY });
  };
  const handleMouseLeave = () => {
    setHovering(false);
    setRotation({ x: 8, y: -10 });
  };

  const cells = [
    [3, 8, 4, 5],
    [6, 9, 2, 7],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ];
  const cages: Array<{ id: number; sum: number; cells: Array<[number, number]>; color: string }> = [
    { id: 1, sum: 11, cells: [[0, 0], [0, 1]], color: 'rgba(252, 211, 77, 0.16)' },     // amber
    { id: 2, sum: 9, cells: [[0, 2], [0, 3]], color: 'rgba(147, 197, 253, 0.16)' },     // sky
    { id: 3, sum: 17, cells: [[1, 0], [1, 1], [1, 2]], color: 'rgba(167, 139, 250, 0.16)' }, // lavender
    { id: 4, sum: 14, cells: [[2, 2], [2, 3], [1, 3]], color: 'rgba(249, 168, 212, 0.16)' }, // pink
  ];
  const map: Record<string, { id: number; sum: number; color: string; isFirst: boolean }> = {};
  cages.forEach((cg) => {
    const sorted = [...cg.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    cg.cells.forEach(([r, c]) => {
      map[`${r},${c}`] = { id: cg.id, sum: cg.sum, color: cg.color, isFirst: r === sorted[0][0] && c === sorted[0][1] };
    });
  });

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotation.x, rotateY: rotation.y, y: hovering ? 0 : [0, -6, 0] }}
      transition={
        hovering
          ? { type: 'spring', stiffness: 100, damping: 15 }
          : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
      }
      className="relative grid grid-cols-4 grid-rows-4 p-3 rounded-2xl"
      style={{
        transformStyle: 'preserve-3d',
        aspectRatio: '1/1',
        backgroundColor: '#1a1a1f',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {cells.flatMap((row, r) =>
        row.map((v, c) => {
          const info = map[`${r},${c}`];
          return (
            <motion.div
              key={`${r}-${c}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + (r * 4 + c) * 0.025 }}
              className="relative flex items-center justify-center font-mono text-2xl"
              style={{
                background: info?.color ?? 'transparent',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#f4f4f5',
              }}
            >
              {info?.isFirst && (
                <span className="absolute top-1 left-1.5 text-[10px] font-semibold" style={{ color: '#a1a1aa' }}>
                  {info.sum}
                </span>
              )}
              {v !== 0 ? v : ''}
            </motion.div>
          );
        }),
      )}
    </motion.div>
  );
}

function Features() {
  const features = [
    {
      icon: Calendar,
      title: 'Daily Challenges',
      body: "A new puzzle every day, the same for everyone. Race the clock — and the world's leaderboard.",
    },
    {
      icon: Pencil,
      title: 'Build Your Own',
      body: 'Design puzzles with the visual cage editor. Our solver guarantees a unique solution before publishing.',
    },
    {
      icon: Trophy,
      title: 'Climb the Leaderboard',
      body: 'Every solve counts. Filter by difficulty, beat your best time, and earn your place at the top.',
    },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="caption mb-3"
      >
        What you get
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] mb-3"
        style={{ color: '#f4f4f5' }}
      >
        Built for the long game.
      </motion.h2>
      <p className="max-w-2xl mb-12" style={{ color: '#a1a1aa' }}>Three first-class workflows. Same elegant grid.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="panel p-6 group hover:-translate-y-1 transition-transform"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#a78bfa15' }}>
                <Icon className="h-5 w-5" style={{ color: '#a78bfa' }} />
              </div>
              <h3 className="text-xl font-semibold mt-4 tracking-[-0.01em]" style={{ color: '#f4f4f5' }}>{f.title}</h3>
              <p className="mt-2 leading-relaxed" style={{ color: '#a1a1aa' }}>{f.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, title: 'Pick a puzzle', body: 'Choose Easy, Medium or Hard — or take on today’s daily challenge.' },
    { n: 2, title: 'Solve the cages', body: 'Fill in 1–9 so every row, column, 3×3 box and cage adds up correctly.' },
    { n: 3, title: 'Beat your time', body: 'Faster solves and fewer hints earn a better score on the leaderboard.' },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <p className="caption mb-3">How it works</p>
      <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] mb-12" style={{ color: '#f4f4f5' }}>
        Three steps. No tutorials.
      </h2>
      <ol className="grid md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="panel p-6 flex flex-col gap-3"
          >
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-lg font-semibold"
              style={{ backgroundColor: '#a78bfa', color: '#0a0a0b' }}
            >
              {s.n}
            </div>
            <h3 className="text-xl font-semibold tracking-[-0.01em]" style={{ color: '#f4f4f5' }}>{s.title}</h3>
            <p className="leading-relaxed" style={{ color: '#a1a1aa' }}>{s.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (n) => Math.round(n).toString());
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.4, ease: 'easeOut' });
    return () => controls.stop();
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

function StatsStrip({ puzzleCount, userCount }: { puzzleCount: number; userCount: number }) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="grid sm:grid-cols-3 gap-12 text-center">
        {[
          { value: puzzleCount, label: 'Puzzles to solve' },
          { value: 3, label: 'Difficulty levels' },
          { value: userCount, label: 'Sudoku solvers' },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-5xl font-semibold tracking-[-0.04em] font-mono tabular-nums" style={{ color: '#f4f4f5' }}>
              <Counter to={s.value} />
            </div>
            <div className="caption mt-3">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em]" style={{ color: '#f4f4f5' }}>
        Ready to play?
      </h2>
      <p className="mt-4" style={{ color: '#a1a1aa' }}>Free forever. No credit card. No ads. Just sudoku.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/auth/register" className="btn-primary text-base">
          Start solving now <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/rules" className="btn-ghost text-base">
          Read the rules
        </Link>
      </div>
    </section>
  );
}
