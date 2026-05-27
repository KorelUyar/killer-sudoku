import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { resultSchema } from '@/lib/validator';
import { scoreOf } from '@/lib/scoring';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async (req) => {
  const url = new URL(req.url);
  const difficulty = url.searchParams.get('difficulty');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '50'), 200);
  const puzzleId = url.searchParams.get('puzzleId');

  const where: Record<string, unknown> = {};
  if (puzzleId) where.puzzleId = Number(puzzleId);
  if (difficulty) where.puzzle = { difficulty: Number(difficulty) };

  const rows = await prisma.result.findMany({
    where,
    include: {
      user: { select: { username: true } },
      puzzle: { select: { difficulty: true } },
    },
    take: limit * 3,
    orderBy: { completedAt: 'desc' },
  });

  const enriched = rows
    .map((r) => ({
      id: r.id,
      username: r.user.username,
      puzzleId: r.puzzleId,
      difficulty: r.puzzle.difficulty,
      timeSeconds: r.timeSeconds,
      hintsUsed: r.hintsUsed,
      completedAt: r.completedAt,
      score: scoreOf({ timeSeconds: r.timeSeconds, hintsUsed: r.hintsUsed }),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  return NextResponse.json({ results: enriched });
});

export const POST = withErrors(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { puzzleId, timeSeconds, hintsUsed } = resultSchema.parse(body);
  await prisma.puzzle.findUniqueOrThrow({ where: { id: puzzleId } });
  const result = await prisma.result.create({
    data: { userId: user.id, puzzleId, timeSeconds, hintsUsed },
  });
  return NextResponse.json(
    { id: result.id, score: scoreOf({ timeSeconds, hintsUsed }) },
    { status: 201 },
  );
});
