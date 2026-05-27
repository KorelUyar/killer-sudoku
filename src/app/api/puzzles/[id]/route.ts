import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HttpError } from '@/lib/auth';
import { withErrors } from '@/lib/api-helpers';

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
