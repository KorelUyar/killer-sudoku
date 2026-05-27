'use client';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, Award, Flame, Lightbulb, Trophy } from 'lucide-react';
import Link from 'next/link';
import { formatTime } from '@/lib/utils';

interface StatsResponse {
  stats: {
    totalSolved: number;
    bestPerDifficulty: Record<number, number>;
    avgPerDifficulty: Record<number, number>;
    totalHints: number;
    currentStreak: number;
  };
  recent: Array<{ puzzleId: number; difficulty: number; timeSeconds: number; hintsUsed: number; completedAt: string }>;
}

const diffLabel = ['', 'Easy', 'Medium', 'Hard'];

export function StatsDashboard({ username }: { username: string }) {
  const { data, isLoading } = useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: async () => {
      const r = await fetch('/api/stats');
      return r.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4">
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  if (data.stats.totalSolved === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4">
        <div className="card text-center py-16">
          <BarChart3 className="h-10 w-10 text-accent-glow mx-auto mb-3" />
          <h1 className="text-2xl font-semibold">No stats yet</h1>
          <p className="text-white/60 mt-2">Solve your first puzzle to start tracking your progress.</p>
          <Link href="/play" className="btn-primary mt-6 inline-flex">
            Browse puzzles
          </Link>
        </div>
      </div>
    );
  }

  const barData = [1, 2, 3].map((d) => ({
    name: diffLabel[d],
    best: data.stats.bestPerDifficulty[d] ?? null,
    avg: data.stats.avgPerDifficulty[d] ?? null,
  }));

  const cards = [
    { label: 'Solved', value: data.stats.totalSolved, icon: Trophy, color: 'text-amber-300' },
    { label: 'Current streak', value: `${data.stats.currentStreak}d`, icon: Flame, color: 'text-orange-300' },
    { label: 'Total hints used', value: data.stats.totalHints, icon: Lightbulb, color: 'text-cyan-300' },
    {
      label: 'Best (easy)',
      value: data.stats.bestPerDifficulty[1] ? formatTime(data.stats.bestPerDifficulty[1]) : '—',
      icon: Award,
      color: 'text-emerald-300',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4">
      <h1 className="text-3xl font-semibold tracking-tight">Hi, {username}</h1>
      <p className="text-white/60 mt-1">Your Killer Sudoku stats.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <Icon className={`h-5 w-5 ${c.color}`} />
              <div className="text-3xl font-semibold mt-3 font-mono">{c.value}</div>
              <div className="text-xs text-white/55 mt-1">{c.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4">Time by difficulty</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(v) => formatTime(Number(v))} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: 'rgba(11,10,23,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(v: number) => formatTime(v)}
              />
              <Bar dataKey="best" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              <Bar dataKey="avg" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4">Recent solves</h2>
        {data.recent.length === 0 ? (
          <p className="text-white/55 text-sm">No recent results.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-white/55">
              <tr>
                <th className="py-2 pr-4">Puzzle</th>
                <th className="pr-4">Difficulty</th>
                <th className="pr-4">Time</th>
                <th className="pr-4">Hints</th>
                <th className="pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-white/70 font-mono">#{r.puzzleId}</td>
                  <td className="pr-4">{diffLabel[r.difficulty]}</td>
                  <td className="pr-4 font-mono">{formatTime(r.timeSeconds)}</td>
                  <td className="pr-4 font-mono text-white/70">{r.hintsUsed}</td>
                  <td className="pr-4 text-white/55">{new Date(r.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
