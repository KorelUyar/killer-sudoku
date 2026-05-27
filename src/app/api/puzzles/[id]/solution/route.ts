import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HttpError } from '@/lib/auth';
import { solve } from '@/lib/solver';
import { withErrors } from '@/lib/api-helpers';
import type { Cage, Grid } from '@/lib/types';

// Returns the canonical solution to a puzzle.
// Used by the "Give up" flow — no auth needed but the caller's progress isn't saved.
export const GET = withErrors(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) throw new HttpError(404, 'Puzzle not found');
  const puzzle = await prisma.puzzle.findUnique({ where: { id: numId } });
  if (!puzzle) throw new HttpError(404, 'Puzzle not found');
  const original = puzzle.gridJson as unknown as Grid;
  const cages = puzzle.cagesJson as unknown as Cage[];
  const solved = solve(original, cages);
  if (!solved) throw new HttpError(500, 'Could not solve this puzzle');
  return NextResponse.json({ solved });
});
