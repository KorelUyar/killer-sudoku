'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, Filter } from 'lucide-react';
import { useState } from 'react';
import type { Cage } from '@/lib/types';
import { MiniGridPreview } from '@/components/sudoku/MiniGridPreview';

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
const DIFF_GLOW: Record<number, string> = {
  1: 'rgba(134, 239, 172, 0.25)', // mint
  2: 'rgba(253, 186, 116, 0.25)', // peach
  3: 'rgba(244, 63, 94, 0.25)',   // rose
};
const DIFF_BADGE: Record<number, string> = {
  1: 'text-[#86efac] bg-[#86efac]/10 border-[#86efac]/25',
  2: 'text-[#fdba74] bg-[#fdba74]/10 border-[#fdba74]/25',
  3: 'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/25',
};

function DifficultyBadge({ level }: { level: number }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] rounded border font-medium ${DIFF_BADGE[level]}`}
    >
      {DIFF_LABEL[level]}
    </span>
  );
}

function PuzzleCard({ p, currentUsername }: { p: PuzzleListItem; currentUsername?: string }) {
  const glow = DIFF_GLOW[p.difficulty];
  const isMine = currentUsername && p.creator === currentUsername;
  const cages = p.cages.map((c) => ({ ...c, cells: c.cells as Array<[number, number]> }));
  return (
    <Link
      href={`/play/${p.id}`}
      className="group relative block panel p-5 card-hover"
      style={{ ['--card-accent' as never]: glow }}
    >
      <div className="flex items-center justify-between">
        <DifficultyBadge level={p.difficulty} />
        <span className="text-xs font-mono" style={{ color: '#52525b' }}>#{p.id}</span>
      </div>

      <div className="mt-4 mb-4">
        <MiniGridPreview cages={cages} size={120} />
      </div>

      <h3 className="text-lg font-semibold tracking-tight" style={{ color: '#f4f4f5' }}>
        Puzzle #{p.id}
      </h3>
      <p className="text-sm mt-1" style={{ color: '#a1a1aa' }}>
        by {p.creator}
        {isMine && (
          <span className="ml-2 text-[10px] uppercase tracking-wider" style={{ color: '#22d3ee' }}>You</span>
        )}
      </p>

      <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: '#52525b' }}>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {p.solvedCount}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5" style={{ color: p.averageRating ? '#fbbf24' : '#52525b' }} fill={p.averageRating ? '#fbbf24' : 'transparent'} />
          {p.averageRating !== null ? `${p.averageRating.toFixed(1)} (${p.ratingCount})` : 'unrated'}
        </span>
      </div>

      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="h-4 w-4" style={{ color: '#a1a1aa' }} />
      </div>
    </Link>
  );
}

function DailyChallengeCard({ daily }: { daily: DailyResponse }) {
  const cages = daily.cages.map((c) => ({ ...c, cells: c.cells as Array<[number, number]> }));
  return (
    <Link
      href="/daily"
      className="group panel p-5 card-hover flex flex-col md:flex-row gap-6 items-start md:items-center"
      style={{ ['--card-accent' as never]: 'rgba(251, 191, 36, 0.30)' }}
    >
      <div className="shrink-0">
        <MiniGridPreview cages={cages} size={144} />
      </div>
      <div className="flex-1">
        <p className="caption" style={{ color: '#fbbf24' }}>Daily challenge · {daily.date}</p>
        <h3 className="text-2xl font-semibold mt-1 tracking-tight" style={{ color: '#f4f4f5' }}>
          Today&apos;s puzzle, the same for everyone.
        </h3>
        <p className="text-sm mt-2" style={{ color: '#a1a1aa' }}>
          {DIFF_LABEL[daily.difficulty]} · by {daily.creator}
        </p>
        <span className="btn-primary text-sm mt-4 group-hover:translate-x-0.5 transition-transform inline-flex">
          Play daily <ArrowRight className="h-3.5 w-3.5" />
        </span>
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
      <h1 className="text-5xl font-semibold tracking-[-0.025em] mt-2" style={{ color: '#f4f4f5' }}>Puzzles</h1>
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <p style={{ color: '#a1a1aa' }}>Pick one. The clock starts when you do.</p>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: '#a1a1aa' }} />
          {([null, 1, 2, 3] as const).map((d) => (
            <button
              key={String(d)}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filter === d
                  ? 'bg-white/[0.06] border-white/25 text-[#f4f4f5]'
                  : 'border-white/[0.10] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-white/20'
              }`}
            >
              {d === null ? 'All' : DIFF_LABEL[d]}
            </button>
          ))}
        </div>
      </div>

      {daily.data?.puzzleId && (
        <section className="mt-12">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-lg font-medium" style={{ color: '#f4f4f5' }}>Today&apos;s Challenge</h2>
            <span className="caption" style={{ color: '#fbbf24' }}>Daily</span>
          </div>
          <DailyChallengeCard daily={daily.data} />
        </section>
      )}

      <section className="mt-16">
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-lg font-medium" style={{ color: '#f4f4f5' }}>Browse</h2>
          <span className="text-sm" style={{ color: '#52525b' }}>
            {data ? `${data.puzzles.length} puzzles` : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="panel h-72 animate-pulse" />
            ))}
          </div>
        ) : !data?.puzzles.length ? (
          <div className="panel p-12 text-center" style={{ color: '#a1a1aa' }}>No puzzles match this filter yet.</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {data.puzzles.map((p) => (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              >
                <PuzzleCard p={p} currentUsername={me.data?.user?.username} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
