import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async () => {
  const user = await requireUser();
  const puzzles = await prisma.puzzle.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { results: true, ratings: true } },
      ratings: { select: { stars: true } },
    },
  });
  const data = puzzles.map((p) => {
    const stars = p.ratings.map((r) => r.stars);
    const avg = stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : null;
    return {
      id: p.id,
      difficulty: p.difficulty,
      createdAt: p.createdAt,
      playCount: p._count.results,
      ratingCount: p._count.ratings,
      averageRating: avg,
    };
  });
  return NextResponse.json({ puzzles: data });
});
