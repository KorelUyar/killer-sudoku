'use client';
import Link from 'next/link';
import { motion, useInView, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Calendar,
  Pencil,
  Trophy,
  Sparkles,
  CheckCircle2,
  Github,
} from 'lucide-react';
import { GITHUB_URL } from '@/lib/constants';

export function GuestLanding({ puzzleCount, userCount }: { puzzleCount: number; userCount: number }) {
  return (
    <div className="relative">
      <Hero />
      <Features />
      <HowItWorks />
      <StatsStrip puzzleCount={puzzleCount} userCount={userCount} />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 min-h-[88vh] flex items-center">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center w-full">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-sm text-white/75 mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-glow" />
            Skills Battle 2026 — built for thinkers
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-[-0.03em]"
          >
            Master the art of <span className="text-gradient">Killer Sudoku</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-white/70 mt-6 max-w-xl text-lg"
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
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55"
          >
            {['No ads', 'No tracking', 'Free forever'].map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400/80" />
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
              className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white/85 transition-colors"
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
          <FloatingGrid />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingGrid() {
  // A 4×4 mini-puzzle preview rendered with a subtle 3D tilt + floating animation.
  const cells = [
    [3, 8, 4, 5],
    [6, 9, 2, 7],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ];
  const cages: Array<{ id: number; sum: number; cells: Array<[number, number]>; tint: string }> = [
    { id: 1, sum: 11, cells: [[0, 0], [0, 1]], tint: 'rgba(124,58,237,0.32)' },
    { id: 2, sum: 9, cells: [[0, 2], [0, 3]], tint: 'rgba(167,139,250,0.28)' },
    { id: 3, sum: 17, cells: [[1, 0], [1, 1], [1, 2]], tint: 'rgba(6,182,212,0.28)' },
    { id: 4, sum: 14, cells: [[2, 2], [2, 3], [1, 3]], tint: 'rgba(244,114,182,0.22)' },
  ];
  const map: Record<string, { id: number; sum: number; tint: string; isFirst: boolean }> = {};
  cages.forEach((cg) => {
    const sorted = [...cg.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    cg.cells.forEach(([r, c]) => {
      map[`${r},${c}`] = { id: cg.id, sum: cg.sum, tint: cg.tint, isFirst: r === sorted[0][0] && c === sorted[0][1] };
    });
  });
  return (
    <motion.div
      animate={{ rotateX: [10, 12, 10], rotateY: [-12, -10, -12], y: [0, -8, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      className="relative grid grid-cols-4 grid-rows-4 gap-1 p-4 glass-strong rounded-3xl shadow-glow"
      style={{ transformStyle: 'preserve-3d', aspectRatio: '1/1' }}
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
              className="relative rounded-lg flex items-center justify-center font-mono text-2xl text-white/95"
              style={{
                background: info?.tint ?? 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {info?.isFirst && (
                <span className="absolute top-1 left-1.5 text-[10px] font-semibold text-white/85">
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
    <section className="mx-auto max-w-7xl px-4 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] mb-3"
      >
        Built for the long game.
      </motion.h2>
      <p className="text-white/65 mb-12 max-w-2xl">
        Three first-class workflows. Same elegant grid.
      </p>
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
              className="card group hover:-translate-y-1 transition-transform"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl shadow-glow"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.25))' }}>
                <Icon className="h-5 w-5 text-accent-glow" />
              </div>
              <h3 className="text-xl font-semibold mt-4 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-white/65 mt-2 leading-relaxed">{f.body}</p>
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
    <section className="mx-auto max-w-7xl px-4 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] mb-3"
      >
        How it works.
      </motion.h2>
      <p className="text-white/65 mb-12 max-w-2xl">
        Three steps. No tutorials. No paywalls.
      </p>
      <ol className="grid md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="card flex flex-col gap-3"
          >
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-full font-mono text-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              {s.n}
            </div>
            <h3 className="text-xl font-semibold tracking-[-0.01em]">{s.title}</h3>
            <p className="text-white/65 leading-relaxed">{s.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (n) => Math.round(n).toString() + suffix);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.4, ease: 'easeOut' });
    return () => controls.stop();
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

function StatsStrip({ puzzleCount, userCount }: { puzzleCount: number; userCount: number }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="card grid sm:grid-cols-3 gap-6 text-center">
        {[
          { value: puzzleCount, suffix: '', label: 'Puzzles to solve' },
          { value: 3, suffix: '', label: 'Difficulty levels' },
          { value: userCount, suffix: '', label: 'Sudoku solvers' },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-5xl font-semibold tracking-[-0.04em] text-gradient font-mono">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-sm text-white/60">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-semibold tracking-[-0.025em]"
      >
        Ready to play?
      </motion.h2>
      <p className="text-white/65 mt-4">Free forever. No credit card. No ads. Just sudoku.</p>
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

function Footer() {
  // Note: the global app footer (with the GitHub link) is rendered from
  // src/components/shared/Footer.tsx in the root layout. This in-page footer
  // is kept blank to avoid duplicating it on the guest landing.
  return null;
}
