'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Users, ArrowRight, Filter } from 'lucide-react';
import { useState } from 'react';

interface PuzzleListItem {
  id: number;
  difficulty: number;
  creator: string;
  createdAt: string;
  solvedCount: number;
  averageRating: number | null;
  ratingCount: number;
}

const diffLabel = ['', 'Easy', 'Medium', 'Hard'];
const diffColor = [
  '',
  'bg-emerald-400/15 text-emerald-300 border-emerald-400/25',
  'bg-amber-400/15 text-amber-300 border-amber-400/25',
  'bg-rose-400/15 text-rose-300 border-rose-400/25',
];

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

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Puzzles</h1>
          <p className="text-white/60 mt-1">Pick one. The clock starts when you do.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/60" />
          {([null, 1, 2, 3] as const).map((d) => (
            <button
              key={String(d)}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filter === d
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'border-white/10 text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              {d === null ? 'All' : diffLabel[d]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse" />
          ))}
        </div>
      ) : !data?.puzzles.length ? (
        <div className="card text-center text-white/70">No puzzles match this filter yet.</div>
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
              className="card group flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border tracking-[0.08em] uppercase ${diffColor[p.difficulty]}`}
                >
                  {diffLabel[p.difficulty]}
                </span>
                <span className="text-xs text-white/45 font-mono">#{p.id}</span>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white/95">
                Puzzle #{p.id}
              </div>
              <div className="text-sm text-white/55 mt-1">by {p.creator}</div>
              <div className="flex items-center gap-4 text-xs text-white/55 mt-4">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {p.solvedCount}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  {p.averageRating !== null ? p.averageRating.toFixed(1) : '—'} ({p.ratingCount})
                </span>
              </div>
              <Link
                href={`/play/${p.id}`}
                className="btn-primary mt-5 self-start group-hover:translate-x-0.5 transition-transform"
              >
                Play <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
