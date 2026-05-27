import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser, HttpError } from '@/lib/auth';
import { generatePuzzle } from '@/lib/generator';
import { withErrors } from '@/lib/api-helpers';

const body = z.object({
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  seed: z.number().int().optional(),
});

// Generate (but don't persist) a random Killer Sudoku.
// The caller is expected to POST the same body back to /api/puzzles to save it.
export const POST = withErrors(async (req) => {
  await requireUser();
  const { difficulty, seed } = body.parse(await req.json());
  const useSeed = seed ?? Math.floor(Math.random() * 2_147_483_647);
  try {
    const puzzle = generatePuzzle(useSeed, difficulty);
    return NextResponse.json({ difficulty, grid: puzzle.grid, cages: puzzle.cages, seed: useSeed });
  } catch (err) {
    throw new HttpError(500, `Generation failed: ${(err as Error).message}`);
  }
});
