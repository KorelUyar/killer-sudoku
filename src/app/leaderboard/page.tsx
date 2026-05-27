'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Trophy, Filter } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Row {
  id: number;
  username: string;
  puzzleId: number;
  difficulty: number;
  timeSeconds: number;
  hintsUsed: number;
  completedAt: string;
  score: number;
}

const diffLabel = ['', 'Easy', 'Medium', 'Hard'];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<number | null>(null);
  const { data, isLoading } = useQuery<{ results: Row[] }>({
    queryKey: ['leaderboard', filter],
    queryFn: async () => {
      const url = filter ? `/api/results?difficulty=${filter}` : '/api/results';
      const r = await fetch(url);
      return r.json();
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-300" /> Leaderboard
          </h1>
          <p className="text-white/60 mt-1">Lower score = faster, fewer hints.</p>
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

      <div className="card">
        {isLoading ? (
          <div className="h-64 animate-pulse bg-white/5 rounded-lg" />
        ) : !data?.results.length ? (
          <p className="text-white/60 text-center py-16">No results yet — be the first to solve a puzzle.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-white/55">
              <tr>
                <th className="py-2 pr-4">#</th>
                <th className="pr-4">User</th>
                <th className="pr-4">Puzzle</th>
                <th className="pr-4">Difficulty</th>
                <th className="pr-4">Time</th>
                <th className="pr-4">Hints</th>
                <th className="pr-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((r, i) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 text-white/45 font-mono">{i + 1}</td>
                  <td className="pr-4">{r.username}</td>
                  <td className="pr-4 text-white/70 font-mono">#{r.puzzleId}</td>
                  <td className="pr-4">{diffLabel[r.difficulty]}</td>
                  <td className="pr-4 font-mono">{formatTime(r.timeSeconds)}</td>
                  <td className="pr-4 font-mono text-white/70">{r.hintsUsed}</td>
                  <td className="pr-4 text-right font-mono text-accent-glow">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
