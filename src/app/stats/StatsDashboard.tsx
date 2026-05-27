'use client';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Line, LineChart, Legend } from 'recharts';
import Link from 'next/link';
import { formatTime } from '@/lib/utils';
import { DotGridIllustration } from '@/components/shared/DotGridIllustration';

interface StatsResponse {
  stats: {
    totalSolved: number;
    bestPerDifficulty: Record<number, number>;
    avgPerDifficulty: Record<number, number>;
    totalHints: number;
    currentStreak: number;
  };
  recent: Array<{ puzzleId: number; difficulty: number; timeSeconds: number; hintsUsed: number; completedAt: string }>;
  series: Array<{ label: string; weekStartISO: string; easy: number | null; medium: number | null; hard: number | null; count: number }>;
  firstSolveDate: string | null;
}

const DIFF_COLOR: Record<number, string> = { 1: '#86efac', 2: '#fcd34d', 3: '#f43f5e' };

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const labelByLevel = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const;
  const color = DIFF_COLOR[level];
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] rounded border font-medium"
      style={{ color, backgroundColor: `${color}14`, borderColor: `${color}29` }}
    >
      {labelByLevel[level]}
    </span>
  );
}

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
      <div className="mx-auto max-w-[1200px] px-6 pt-16">
        <div className="h-64 panel animate-pulse" />
      </div>
    );
  }

  if (data.stats.totalSolved === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-24 text-center">
        <p className="caption">Your performance</p>
        <h1 className="text-5xl font-semibold tracking-[-0.025em] mt-2" style={{ color: '#fafafe' }}>Stats</h1>
        <div className="mt-12">
          <DotGridIllustration size={96} />
        </div>
        <h3 className="mt-6 text-xl font-medium" style={{ color: '#fafafe' }}>Your stats await</h3>
        <p className="mt-2 max-w-sm mx-auto" style={{ color: '#a8a8b8' }}>
          Solve your first puzzle to start tracking your performance over time.
        </p>
        <Link href="/play" className="btn-primary mt-6 inline-flex text-sm">
          Browse puzzles →
        </Link>
      </div>
    );
  }

  const bestEasy = data.stats.bestPerDifficulty[1] ?? data.stats.bestPerDifficulty[2] ?? data.stats.bestPerDifficulty[3];
  const bestTime = bestEasy != null ? formatTime(bestEasy) : '—';
  const firstSolveDate = data.firstSolveDate
    ? new Date(data.firstSolveDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const metrics: Array<{ value: string; label: string }> = [
    { value: String(data.stats.totalSolved), label: 'Puzzles solved' },
    { value: bestTime, label: 'Best time' },
    { value: `${data.stats.currentStreak}d`, label: 'Current streak' },
    { value: String(data.stats.totalHints), label: 'Hints used' },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-16">
      <p className="caption">Your performance</p>
      <h1 className="text-5xl font-semibold tracking-[-0.025em] mt-2" style={{ color: '#f4f4f5' }}>Stats</h1>
      <p className="mt-2" style={{ color: '#a1a1aa' }}>
        {username} · since {firstSolveDate}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 mt-16 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="text-5xl font-mono font-semibold tabular-nums" style={{ color: '#f4f4f5' }}>{m.value}</div>
            <div className="caption mt-3">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12 mt-12">
        <div>
          <h3 className="text-lg font-medium mb-6" style={{ color: '#f4f4f5' }}>Average time by difficulty</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.series}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" stroke="#52525b" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  stroke="#52525b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => (typeof v === 'number' ? `${Math.round(v / 60)}m` : '')}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                  contentStyle={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => (v == null ? '—' : formatTime(Number(v)))}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} iconSize={6} iconType="circle" />
                <Line type="monotone" dataKey="easy" stroke="#86efac" strokeWidth={1.5} dot={false} name="Easy" connectNulls />
                <Line type="monotone" dataKey="medium" stroke="#fcd34d" strokeWidth={1.5} dot={false} name="Medium" connectNulls />
                <Line type="monotone" dataKey="hard" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Hard" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="text-lg font-medium" style={{ color: '#f4f4f5' }}>Puzzles per week</h3>
            <span className="text-xs" style={{ color: '#52525b' }}>last 8 weeks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.series} barCategoryGap="20%">
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" stroke="#52525b" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: '#1a1a1f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Bar dataKey="count" fill="#a78bfa" radius={[2, 2, 0, 0]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-baseline gap-3 mb-6">
          <h3 className="text-lg font-medium" style={{ color: '#f4f4f5' }}>Recent</h3>
          <span className="text-sm" style={{ color: '#52525b' }}>last {data.recent.length} solves</span>
        </div>
        {data.recent.length === 0 ? (
          <p className="text-sm" style={{ color: '#52525b' }}>No recent solves.</p>
        ) : (
          <div>
            {data.recent.map((r) => (
              <div
                key={`${r.puzzleId}-${r.completedAt}`}
                className="grid grid-cols-[64px_88px_72px_72px_72px_1fr] gap-6 py-4 items-center text-sm border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="font-mono" style={{ color: '#52525b' }}>#{r.puzzleId}</span>
                <DifficultyBadge level={r.difficulty as 1 | 2 | 3} />
                <span className="font-mono" style={{ color: '#f4f4f5' }}>{formatTime(r.timeSeconds)}</span>
                <span style={{ color: '#a1a1aa' }}>{r.hintsUsed} hints</span>
                <span className="font-mono font-medium" style={{ color: '#f4f4f5' }}>{r.timeSeconds + r.hintsUsed * 60}</span>
                <span className="text-right" style={{ color: '#52525b' }}>{relativeTime(r.completedAt as unknown as string)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
