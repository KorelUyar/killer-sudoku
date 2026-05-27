import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { todayISO } from '@/lib/utils';
import { pickDailyPuzzleId } from '@/lib/scoring';
import { SolveBoard } from '../play/[id]/SolveBoard';
import { DailyLeaderboard } from './DailyLeaderboard';

async function ensureTodaysDaily() {
  const today = todayISO();
  const todayDate = new Date(today + 'T00:00:00Z');
  let daily = await prisma.dailyPuzzle.findUnique({
    where: { date: todayDate },
    include: { puzzle: { include: { creator: { select: { username: true } } } } },
  });
  if (!daily) {
    const pool = await prisma.puzzle.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
    if (pool.length === 0) return null;
    const picked = pickDailyPuzzleId(today, pool.map((p) => p.id));
    await prisma.dailyPuzzle.create({ data: { puzzleId: picked, date: todayDate } });
    daily = await prisma.dailyPuzzle.findUnique({
      where: { date: todayDate },
      include: { puzzle: { include: { creator: { select: { username: true } } } } },
    });
  }
  return daily;
}

export default async function DailyPage() {
  const daily = await ensureTodaysDaily();
  if (!daily) redirect('/play');
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-sm text-accent-glow">
          🗓 Daily Challenge · {todayISO()}
        </div>
        <h1 className="text-3xl font-semibold mt-3 tracking-tight">
          Today&apos;s puzzle, the same for everyone.
        </h1>
      </div>
      <SolveBoard
        puzzleId={daily.puzzle.id}
        difficulty={daily.puzzle.difficulty}
        creator={daily.puzzle.creator.username}
        grid={daily.puzzle.gridJson as unknown as number[][]}
        cages={daily.puzzle.cagesJson as unknown as { id: number; sum: number; cells: Array<[number, number]> }[]}
        currentUser={user}
      />
      <div className="mt-10">
        <DailyLeaderboard />
      </div>
    </div>
  );
}
