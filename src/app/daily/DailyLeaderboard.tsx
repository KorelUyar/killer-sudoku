'use client';
import { useQuery } from '@tanstack/react-query';
import { formatTime } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface DailyLB { date: string; puzzleId?: number; results: Array<{ username: string; timeSeconds: number; hintsUsed: number; score: number }> }

export function DailyLeaderboard() {
  const { data, isLoading } = useQuery<DailyLB>({
    queryKey: ['daily-lb'],
    queryFn: async () => {
      const r = await fetch('/api/daily/leaderboard');
      return r.json();
    },
    refetchInterval: 15_000,
  });

  return (
    <div className="card">
      <h2 className="text-lg font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-300" /> Daily leaderboard</h2>
      {isLoading ? (
        <div className="mt-4 h-24 animate-pulse bg-white/5 rounded-md" />
      ) : data && data.results.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/55 text-left">
              <tr>
                <th className="py-2">#</th>
                <th>User</th>
                <th>Time</th>
                <th>Hints</th>
                <th className="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 text-white/55">{i + 1}</td>
                  <td>{r.username}</td>
                  <td className="font-mono">{formatTime(r.timeSeconds)}</td>
                  <td className="font-mono text-white/70">{r.hintsUsed}</td>
                  <td className="font-mono text-accent-glow text-right">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white/60 mt-4 text-sm">No one has solved today&apos;s puzzle yet — be the first!</p>
      )}
    </div>
  );
}
