import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HttpError, requireUser } from '@/lib/auth';
import { withErrors } from '@/lib/api-helpers';
import { todayISO } from '@/lib/utils';

export const GET = withErrors(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) throw new HttpError(404, 'Puzzle not found');
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: numId },
    include: { creator: { select: { username: true } } },
  });
  if (!puzzle) throw new HttpError(404, 'Puzzle not found');
  return NextResponse.json({
    id: puzzle.id,
    difficulty: puzzle.difficulty,
    grid: puzzle.gridJson,
    cages: puzzle.cagesJson,
    creator: puzzle.creator.username,
    createdAt: puzzle.createdAt,
  });
});

export const DELETE = withErrors(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) throw new HttpError(404, 'Puzzle not found');
  const puzzle = await prisma.puzzle.findUnique({ where: { id: numId } });
  if (!puzzle) throw new HttpError(404, 'Puzzle not found');

  // Only creator OR admin can delete.
  const isAdmin = user.username === 'admin';
  if (puzzle.creatorId !== user.id && !isAdmin) {
    throw new HttpError(403, 'You can only delete your own puzzles');
  }

  // Block deletion of today's daily puzzle so the live leaderboard doesn't break.
  const today = todayISO();
  const todayDate = new Date(today + 'T00:00:00Z');
  const dailyToday = await prisma.dailyPuzzle.findUnique({
    where: { date: todayDate },
    select: { puzzleId: true },
  });
  if (dailyToday?.puzzleId === numId) {
    throw new HttpError(409, "Can't delete — this is today's daily puzzle.");
  }

  await prisma.puzzle.delete({ where: { id: numId } });
  return NextResponse.json({ ok: true });
});
