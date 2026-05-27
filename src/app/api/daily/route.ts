import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HttpError } from '@/lib/auth';
import { pickDailyPuzzleId } from '@/lib/scoring';
import { todayISO } from '@/lib/utils';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async () => {
  const today = todayISO();
  const todayDate = new Date(today + 'T00:00:00Z');

  const existing = await prisma.dailyPuzzle.findUnique({
    where: { date: todayDate },
    include: { puzzle: { include: { creator: { select: { username: true } } } } },
  });
  if (existing) {
    return NextResponse.json({
      date: today,
      puzzleId: existing.puzzleId,
      difficulty: existing.puzzle.difficulty,
      grid: existing.puzzle.gridJson,
      cages: existing.puzzle.cagesJson,
      creator: existing.puzzle.creator.username,
    });
  }

  const pool = await prisma.puzzle.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
  if (pool.length === 0) throw new HttpError(503, 'No puzzles available for daily selection');
  const puzzleId = pickDailyPuzzleId(today, pool.map((p) => p.id));
  await prisma.dailyPuzzle.create({ data: { puzzleId, date: todayDate } });
  const created = await prisma.puzzle.findUniqueOrThrow({
    where: { id: puzzleId },
    include: { creator: { select: { username: true } } },
  });
  return NextResponse.json({
    date: today,
    puzzleId: created.id,
    difficulty: created.difficulty,
    grid: created.gridJson,
    cages: created.cagesJson,
    creator: created.creator.username,
  });
});
