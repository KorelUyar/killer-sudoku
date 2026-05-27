import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scoreOf } from '@/lib/scoring';
import { todayISO } from '@/lib/utils';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async () => {
  const today = todayISO();
  const todayDate = new Date(today + 'T00:00:00Z');
  const daily = await prisma.dailyPuzzle.findUnique({ where: { date: todayDate } });
  if (!daily) return NextResponse.json({ date: today, results: [] });

  const results = await prisma.result.findMany({
    where: { puzzleId: daily.puzzleId },
    include: { user: { select: { username: true } } },
    orderBy: { completedAt: 'asc' },
  });

  const ranked = results
    .map((r) => ({
      username: r.user.username,
      timeSeconds: r.timeSeconds,
      hintsUsed: r.hintsUsed,
      score: scoreOf({ timeSeconds: r.timeSeconds, hintsUsed: r.hintsUsed }),
      completedAt: r.completedAt,
    }))
    .sort((a, b) => a.score - b.score);

  return NextResponse.json({ date: today, puzzleId: daily.puzzleId, results: ranked });
});
