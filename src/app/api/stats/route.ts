import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { computeStats } from '@/lib/scoring';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async () => {
  const user = await requireUser();
  const results = await prisma.result.findMany({
    where: { userId: user.id },
    include: { puzzle: { select: { difficulty: true } } },
    orderBy: { completedAt: 'desc' },
  });
  const stats = computeStats(
    results.map((r) => ({
      difficulty: r.puzzle.difficulty,
      timeSeconds: r.timeSeconds,
      hintsUsed: r.hintsUsed,
      completedAt: r.completedAt.toISOString(),
    })),
  );
  const recent = results.slice(0, 20).map((r) => ({
    puzzleId: r.puzzleId,
    difficulty: r.puzzle.difficulty,
    timeSeconds: r.timeSeconds,
    hintsUsed: r.hintsUsed,
    completedAt: r.completedAt,
  }));
  return NextResponse.json({ stats, recent });
});
