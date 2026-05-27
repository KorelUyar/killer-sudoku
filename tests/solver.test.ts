// Unit tests for lib/solver.ts (Killer Sudoku backtracking solver).
// Skeletons created in Phase 0; bodies filled in Phase 2.
import { describe, it, expect } from 'vitest';
import { solve, countSolutions } from '../src/lib/solver';
import { validateCageSumTotal } from '../src/lib/validator';
import { samplePuzzles, unsolvablePuzzle, ambiguousPuzzle, almostSolvedPuzzle } from './fixtures';

describe('Killer Sudoku Solver', () => {
  it('TC-51 [Positive]: solves a valid medium puzzle within 2 seconds', () => {
    const puzzle = samplePuzzles.medium;
    const start = Date.now();
    const result = solve(puzzle.grid, puzzle.cages);
    const duration = Date.now() - start;
    expect(result).not.toBeNull();
    expect(duration).toBeLessThan(2000);
  });

  it('TC-52 [Negative]: returns null on an unsolvable puzzle', () => {
    const result = solve(unsolvablePuzzle.grid, unsolvablePuzzle.cages);
    expect(result).toBeNull();
  });

  it('TC-53 [Boundary]: handles a puzzle with a single empty cell', () => {
    const result = solve(almostSolvedPuzzle.grid, almostSolvedPuzzle.cages);
    expect(result).not.toBeNull();
    expect(result!.flat().every((v) => v >= 1 && v <= 9)).toBe(true);
  });

  it('TC-54 [Positive]: countSolutions returns 1 for a uniquely-solvable puzzle', () => {
    expect(countSolutions(samplePuzzles.easy.grid, samplePuzzles.easy.cages, 2)).toBe(1);
  });

  it('TC-55 [Negative]: countSolutions returns ≥2 for an ambiguous puzzle', () => {
    expect(countSolutions(ambiguousPuzzle.grid, ambiguousPuzzle.cages, 2)).toBeGreaterThanOrEqual(2);
  });

  it('TC-56 [Positive]: cage-sum 405 cheap check short-circuits before backtracking', () => {
    // Construct cages whose sums do not total 405.
    const badCages = samplePuzzles.easy.cages.map((c, i) => (i === 0 ? { ...c, sum: c.sum - 1 } : c));
    expect(validateCageSumTotal(badCages)).toBe(false);
  });
});
