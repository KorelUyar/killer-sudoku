// Test fixtures loaded from the JSON produced by scripts/build-fixtures.ts.
import data from './fixtures-data.json' with { type: 'json' };
import type { Cage, Grid } from '../src/lib/types';

export interface Puzzle { grid: Grid; cages: Cage[]; solved: Grid }

const cast = (p: { grid: number[][]; cages: Array<{ id: number; sum: number; cells: number[][] }>; solved: number[][] }): Puzzle => ({
  grid: p.grid,
  cages: p.cages.map((c) => ({ id: c.id, sum: c.sum, cells: c.cells as Array<[number, number]> })),
  solved: p.solved,
});

export const samplePuzzles: Record<'easy' | 'medium' | 'hard', Puzzle> = {
  easy: cast(data.easy),
  medium: cast(data.medium),
  hard: cast(data.hard),
};

export const almostSolvedPuzzle: Puzzle = cast(data.almostSolved);
export const unsolvablePuzzle: Puzzle = cast(data.unsolvable);
export const ambiguousPuzzle: Puzzle = cast(data.ambiguous);
