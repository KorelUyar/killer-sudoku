import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { HttpError } from '@/lib/auth';
import { computeHint } from '@/lib/hint';
import { withErrors } from '@/lib/api-helpers';
import type { Cage, Grid } from '@/lib/types';

const hintBody = z.object({
  grid: z.array(z.array(z.number().int().min(0).max(9)).length(9)).length(9),
});

export const POST = withErrors(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) throw new HttpError(404, 'Puzzle not found');
  const puzzle = await prisma.puzzle.findUnique({ where: { id: numId } });
  if (!puzzle) throw new HttpError(404, 'Puzzle not found');
  const body = await req.json();
  const { grid } = hintBody.parse(body);
  const cages = puzzle.cagesJson as unknown as Cage[];
  const original = puzzle.gridJson as unknown as Grid;
  const hint = computeHint(grid as Grid, cages, original);
  return NextResponse.json({ hint });
});
