'use client';
import Link from 'next/link';
import { motion, useInView, animate, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
// keep import as-is — useTransform compose used in InteractiveFloatingGrid
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
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [light, setLight] = useState({ x: 50, y: 50 });
  const reducedMotion = useReducedMotion();

  // Motion values let idle + mouse compose without fighting each other.
  const idleY = useMotionValue(0);
  const idleTilt = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Idle floating + slow tilt — ALWAYS runs, even on hover (just slower).
  useEffect(() => {
    if (reducedMotion) return;
    const yCtl = animate(idleY, [-5, 5, -5], { duration: 7, repeat: Infinity, ease: 'easeInOut' });
    const tCtl = animate(idleTilt, [-1.5, 1.5, -1.5], { duration: 9, repeat: Infinity, ease: 'easeInOut' });
    return () => {
      yCtl.stop();
      tCtl.stop();
    };
  }, [idleY, idleTilt, reducedMotion]);

  // Composed transforms (idle + mouse).
  const rotateX = useTransform([idleTilt, mouseY] as never, ([t, my]: number[]) => 6 + t + my);
  const rotateY = useTransform([idleTilt, mouseX] as never, ([t, mx]: number[]) => -6 + t + mx);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set(((e.clientX - cx) / rect.width) * 18);
    mouseY.set(-((e.clientY - cy) / rect.height) * 18);
    setLight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
  const handleMouseLeave = () => {
    setHovering(false);
    animate(mouseX, 0, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    animate(mouseY, 0, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
  };

  // Tiny 4×4 sample puzzle with 4 cages, each in a different cage colour.
  const cells = [
    [3, 8, 4, 5],
    [6, 9, 2, 7],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ];
  const cages: Array<{ id: number; sum: number; cells: Array<[number, number]>; color: string }> = [
    { id: 1, sum: 11, cells: [[0, 0], [0, 1]], color: '#fbbf24' },
    { id: 2, sum: 9, cells: [[0, 2], [0, 3]], color: '#60a5fa' },
    { id: 3, sum: 17, cells: [[1, 0], [1, 1], [1, 2]], color: '#a78bfa' },
    { id: 4, sum: 14, cells: [[2, 2], [2, 3], [1, 3]], color: '#22d3ee' },
  ];
  const map: Record<string, { id: number; sum: number; color: string; isFirst: boolean }> = {};
  cages.forEach((cg) => {
    const sorted = [...cg.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    cg.cells.forEach(([r, c]) => {
      map[`${r},${c}`] = { id: cg.id, sum: cg.sum, color: cg.color, isFirst: r === sorted[0][0] && c === sorted[0][1] };
    });
  });

  if (reducedMotion) {
    return <StaticGrid cells={cells} map={map} />;
  }

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60, rotateX: 26, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1400,
        aspectRatio: '1/1',
        willChange: 'transform',
        y: idleY,
        rotateX,
        rotateY,
      }}
    >
      {/* Layer 1: Ground shadow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          transform: 'translateZ(-60px) scale(1.18)',
          background: 'radial-gradient(ellipse at center 75%, rgba(0,0,0,0.75), transparent 60%)',
          filter: 'blur(32px)',
        }}
      />

      {/* Layer 2: Multi-hue color glow behind the grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: 'translateZ(-22px) scale(1.05)',
          background:
            'radial-gradient(circle at 20% 20%, rgba(167,139,250,0.22), transparent 50%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.16), transparent 50%), radial-gradient(circle at 60% 40%, rgba(251,191,36,0.11), transparent 50%)',
          filter: 'blur(22px)',
        }}
      />

      {/* Layer 3: Glass backplate */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          transform: 'translateZ(-6px)',
          background: 'linear-gradient(145deg, #1a1a2a, #0a0a14)',
          boxShadow: '0 40px 100px -25px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      />

      {/* Layer 4: Main grid */}
      <div
        className="relative grid grid-cols-4 grid-rows-4 gap-[3px] p-4 rounded-2xl overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          width: '100%',
          height: '100%',
        }}
      >
        {cells.flatMap((row, r) =>
          row.map((v, c) => {
            const info = map[`${r},${c}`];
            const filled = v !== 0;
            return (
              <motion.div
                key={`${r}-${c}`}
                initial={{ opacity: 0, translateZ: -24, scale: 0.8 }}
                animate={{ opacity: 1, translateZ: filled ? 8 : 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 + (r * 4 + c) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex items-center justify-center font-mono text-3xl rounded-md"
                style={{
                  transformStyle: 'preserve-3d',
                  background: filled
                    ? 'linear-gradient(180deg, #2a2a3a 0%, #1a1a26 100%)'
                    : info
                      ? `${info.color}14`
                      : 'rgba(255,255,255,0.02)',
                  boxShadow: filled
                    ? `inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.30), 0 4px 12px rgba(0,0,0,0.40)${info ? `, inset 0 0 24px ${info.color}25` : ''}`
                    : info
                      ? `inset 0 0 0 1px ${info.color}26, inset 0 0 16px ${info.color}18`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                  color: '#fafafe',
                  textShadow: filled ? '0 1px 2px rgba(0,0,0,0.6)' : undefined,
                }}
              >
                {info?.isFirst && (
                  <span
                    className="absolute top-1.5 left-2 text-[10px] font-bold"
                    style={{ color: info.color }}
                  >
                    {info.sum}
                  </span>
                )}
                {v !== 0 ? v : ''}
              </motion.div>
            );
          }),
        )}

        {/* Layer 5: Soft directional specular highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 30%, transparent 60%, rgba(255,255,255,0.04) 100%)',
          }}
        />

        {/* Layer 6: Cursor-tracked light — always faintly visible, brighter on hover */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle 280px at ${light.x}% ${light.y}%, rgba(167,139,250,0.22), transparent 60%)`,
            mixBlendMode: 'screen',
            opacity: hovering ? 1 : 0.35,
            transition: 'opacity 600ms ease',
          }}
        />

        {/* Drifting particles */}
        <ParticleLayer />
      </div>
    </motion.div>
  );
}

function ParticleLayer() {
  const colors = ['#a78bfa', '#22d3ee', '#fbbf24'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: 7 }).map((_, i) => {
        const startX = (i * 73) % 100;
        const startY = (i * 41) % 100;
        const endX = ((i + 3) * 53) % 100;
        const endY = ((i + 2) * 37) % 100;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: colors[i % 3],
              opacity: 0.35,
              left: `${startX}%`,
              top: `${startY}%`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              left: [`${startX}%`, `${endX}%`],
              top: [`${startY}%`, `${endY}%`],
              opacity: [0.15, 0.5, 0.15],
            }}
            transition={{
              duration: 8 + (i * 1.3) % 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

function StaticGrid({ cells, map }: {
  cells: number[][];
  map: Record<string, { id: number; sum: number; color: string; isFirst: boolean }>;
}) {
  return (
    <div className="relative aspect-square">
      <div
        className="relative grid grid-cols-4 grid-rows-4 gap-[3px] p-4 rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        {cells.flatMap((row, r) =>
          row.map((v, c) => {
            const info = map[`${r},${c}`];
            return (
              <div
                key={`${r}-${c}`}
                className="relative flex items-center justify-center font-mono text-3xl rounded-md"
                style={{
                  background: v !== 0 ? 'linear-gradient(180deg, #2a2a3a, #1a1a26)' : info ? `${info.color}14` : 'transparent',
                  color: '#fafafe',
                }}
              >
                {info?.isFirst && (
                  <span className="absolute top-1.5 left-2 text-[10px] font-bold" style={{ color: info.color }}>
                    {info.sum}
                  </span>
                )}
                {v !== 0 ? v : ''}
              </div>
            );
          }),
        )}
      </div>
    </div>
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
