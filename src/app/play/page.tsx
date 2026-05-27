'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, Filter, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { Cage } from '@/lib/types';
import { MiniGridPreview } from '@/components/sudoku/MiniGridPreview';
import { AnimatedSection } from '@/components/shared/AnimatedSection';

interface PuzzleListItem {
  id: number;
  difficulty: number;
  creator: string;
  createdAt: string;
  grid: number[][];
  cages: Cage[];
  solvedCount: number;
  averageRating: number | null;
  ratingCount: number;
}

interface DailyResponse {
  date: string;
  puzzleId: number;
  difficulty: number;
  creator: string;
  grid: number[][];
  cages: Cage[];
}

const DIFF_LABEL = ['', 'Easy', 'Medium', 'Hard'];
const DIFF_ACCENT: Record<number, string> = {
  1: '#86efac',
  2: '#fcd34d',
  3: '#fb7185',
};
const DIFF_BADGE: Record<number, string> = {
  1: 'text-[#86efac] bg-[#86efac]/10 border-[#86efac]/30',
  2: 'text-[#fcd34d] bg-[#fcd34d]/10 border-[#fcd34d]/30',
  3: 'text-[#fb7185] bg-[#fb7185]/10 border-[#fb7185]/30',
};

function DifficultyBadge({ level, withGlow = false }: { level: number; withGlow?: boolean }) {
  const color = DIFF_ACCENT[level];
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] rounded border font-semibold ${DIFF_BADGE[level]}`}
      style={withGlow ? { boxShadow: `0 0 12px -2px ${color}40` } : undefined}
    >
      {DIFF_LABEL[level]}
    </span>
  );
}

function PuzzleCard({ p, currentUsername }: { p: PuzzleListItem; currentUsername?: string }) {
  const accent = DIFF_ACCENT[p.difficulty];
  const isMine = currentUsername && p.creator === currentUsername;
  const cages = p.cages.map((c) => ({ ...c, cells: c.cells as Array<[number, number]> }));
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-xl"
      style={{ ['--card-accent' as never]: `${accent}30` }}
    >
      {/* Ambient glow on hover */}
      <div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}18, transparent 70%)` }}
      />

      <Link
        href={`/play/${p.id}`}
        className="relative block panel p-5 card-hover"
      >
        <div className="flex items-center justify-between">
          <DifficultyBadge level={p.difficulty} withGlow />
          <span className="text-xs font-mono" style={{ color: '#65657a' }}>#{p.id}</span>
        </div>

        <div className="mt-5 mb-4 flex justify-center">
          <MiniGridPreview cages={cages} grid={p.grid} size={144} interactive />
        </div>

        <h3 className="text-lg font-semibold tracking-tight" style={{ color: '#fafafe' }}>
          Puzzle #{p.id}
        </h3>
        <p className="text-sm mt-1" style={{ color: '#a8a8b8' }}>
          by {p.creator}
          {isMine && (
            <span className="ml-2 text-[10px] uppercase tracking-wider" style={{ color: '#22d3ee' }}>You</span>
          )}
        </p>

        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: '#65657a' }}>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {p.solvedCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" style={{ color: p.averageRating ? '#fbbf24' : '#65657a' }} fill={p.averageRating ? '#fbbf24' : 'transparent'} />
            {p.averageRating !== null ? `${p.averageRating.toFixed(1)} (${p.ratingCount})` : 'unrated'}
          </span>
        </div>

        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="h-4 w-4" style={{ color: '#a8a8b8' }} />
        </div>
      </Link>
    </motion.div>
  );
}

function DailyHeroCard({ daily }: { daily: DailyResponse }) {
  const cages = daily.cages.map((c) => ({ ...c, cells: c.cells as Array<[number, number]> }));
  return (
    <Link
      href="/daily"
      className="group relative block overflow-hidden rounded-2xl panel p-8 card-hover"
      style={{
        ['--card-accent' as never]: 'rgba(251, 191, 36, 0.32)',
        background: 'linear-gradient(135deg, rgba(251,191,36,0.045), transparent 60%), var(--card)',
      }}
    >
      {/* Amber ambient glow */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.18), transparent 60%)',
          filter: 'blur(45px)',
        }}
      />
      <div className="relative grid md:grid-cols-[180px_1fr] gap-8 items-center">
        <div className="flex justify-center md:justify-start">
          <MiniGridPreview cages={cages} grid={daily.grid} size={180} interactive rotation={{ x: 14, y: -14 }} />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono font-semibold" style={{ color: '#fbbf24' }}>
            <Calendar className="w-3.5 h-3.5" />
            Daily challenge · {daily.date}
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mt-3 tracking-[-0.02em]" style={{ color: '#fafafe' }}>
            Today&apos;s puzzle, the same for everyone.
          </h2>
          <p className="mt-2" style={{ color: '#a8a8b8' }}>
            {DIFF_LABEL[daily.difficulty]} · by {daily.creator}
          </p>
          <span className="btn-primary text-sm mt-6 inline-flex group-hover:translate-x-0.5 transition-transform">
            Play today <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PlayListPage() {
  const [filter, setFilter] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ puzzles: PuzzleListItem[] }>({
    queryKey: ['puzzles', filter],
    queryFn: async () => {
      const url = filter ? `/api/puzzles?difficulty=${filter}` : '/api/puzzles';
      const r = await fetch(url);
      if (!r.ok) throw new Error('Failed to load puzzles');
      return r.json();
    },
  });
  const me = useQuery<{ user: { username: string } | null }>({
    queryKey: ['me'],
    queryFn: async () => (await fetch('/api/auth/me')).json(),
  });
  const daily = useQuery<DailyResponse>({
    queryKey: ['daily'],
    queryFn: async () => (await fetch('/api/daily')).json(),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-24">
      <p className="caption">Library</p>
      <h1 className="text-5xl font-semibold tracking-[-0.025em] mt-2" style={{ color: '#fafafe' }}>Puzzles</h1>
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <p style={{ color: '#a8a8b8' }}>Pick one. The clock starts when you do.</p>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: '#a8a8b8' }} />
          {([null, 1, 2, 3] as const).map((d) => (
            <button
              key={String(d)}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filter === d
                  ? 'bg-white/[0.06] border-white/25 text-[#fafafe]'
                  : 'border-white/[0.10] text-[#a8a8b8] hover:text-[#fafafe] hover:border-white/20'
              }`}
            >
              {d === null ? 'All' : DIFF_LABEL[d]}
            </button>
          ))}
        </div>
      </div>

      {daily.data?.puzzleId && (
        <AnimatedSection className="mt-12">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-lg font-medium" style={{ color: '#fafafe' }}>Today&apos;s Challenge</h2>
            <span className="caption" style={{ color: '#fbbf24' }}>Daily</span>
          </div>
          <DailyHeroCard daily={daily.data} />
        </AnimatedSection>
      )}

      <AnimatedSection className="mt-16" delay={0.1}>
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-lg font-medium" style={{ color: '#fafafe' }}>Browse</h2>
          <span className="text-sm" style={{ color: '#65657a' }}>
            {data ? `${data.puzzles.length} puzzles` : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel h-72 shimmer" />
            ))}
          </div>
        ) : !data?.puzzles.length ? (
          <div className="panel p-12 text-center" style={{ color: '#a8a8b8' }}>No puzzles match this filter yet.</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {data.puzzles.map((p) => (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <PuzzleCard p={p} currentUsername={me.data?.user?.username} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatedSection>
    </div>
  );
}
