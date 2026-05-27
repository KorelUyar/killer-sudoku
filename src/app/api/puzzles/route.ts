import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, HttpError } from '@/lib/auth';
import {
  puzzleCreateSchema,
  validateCageSumTotal,
  validateCageStructure,
} from '@/lib/validator';
import { countSolutions } from '@/lib/solver';
import { withErrors } from '@/lib/api-helpers';
import type { Cage, Grid } from '@/lib/types';

export const GET = withErrors(async (req) => {
  const url = new URL(req.url);
  const difficulty = url.searchParams.get('difficulty');
  const where = difficulty ? { difficulty: Number(difficulty) } : {};
  const puzzles = await prisma.puzzle.findMany({
    where,
    orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
    include: {
      creator: { select: { username: true } },
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
      creator: p.creator.username,
      solvedCount: p._count.results,
      ratingCount: p._count.ratings,
      averageRating: avg,
    };
  });
  return NextResponse.json({ puzzles: data });
});

export const POST = withErrors(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { difficulty, grid, cages } = puzzleCreateSchema.parse(body);
  const structure = validateCageStructure(
    cages.map((c) => ({ cells: c.cells as Array<[number, number]>, sum: c.sum })),
    true,
  );
  if (!structure.ok) throw new HttpError(400, `Cage structure invalid: ${structure.reason}`);
  if (!validateCageSumTotal(cages)) throw new HttpError(400, 'Cage sums must total 405');
  const typedCages: Cage[] = cages.map((c) => ({
    id: c.id,
    sum: c.sum,
    cells: c.cells as Array<[number, number]>,
  }));
  const n = countSolutions(grid as Grid, typedCages, 2);
  if (n === 0) throw new HttpError(400, 'Puzzle has no solution');
  if (n > 1) throw new HttpError(400, 'Solution is not unique');
  const puzzle = await prisma.puzzle.create({
    data: {
      creatorId: user.id,
      difficulty,
      gridJson: grid as unknown as object,
      cagesJson: typedCages as unknown as object,
    },
  });
  return NextResponse.json({ puzzleId: puzzle.id }, { status: 201 });
});
