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
    <div className="mx-auto max-w-[1200px] px-6 pt-16">
      <div className="text-center mb-10">
        <p className="caption">Daily challenge · {todayISO()}</p>
        <h1 className="text-4xl md:text-5xl font-semibold mt-2 tracking-[-0.025em]" style={{ color: '#f4f4f5' }}>
          Today&apos;s puzzle, the same for everyone.
        </h1>
      </div>
      <SolveBoard
        isDaily
        puzzleId={daily.puzzle.id}
        difficulty={daily.puzzle.difficulty}
        creator={daily.puzzle.creator.username}
        grid={daily.puzzle.gridJson as unknown as number[][]}
        cages={daily.puzzle.cagesJson as unknown as { id: number; sum: number; cells: Array<[number, number]> }[]}
        currentUser={user}
      />
      <div className="mt-12">
        <DailyLeaderboard />
      </div>
    </div>
  );
}
