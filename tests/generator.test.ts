// Unit tests for lib/generator.ts (random Killer Sudoku generator).
import { describe, it, expect } from 'vitest';
import { generatePuzzle, generateSolved } from '../src/lib/generator';
import { countSolutions, solve } from '../src/lib/solver';
import { validateCageSumTotal, validateCageStructure } from '../src/lib/validator';

describe('Killer Sudoku generator', () => {
  it('TC-GEN-01 [Positive]: produces a valid filled grid (no duplicates per row/col/box)', () => {
    const grid = generateSolved(42);
    for (let i = 0; i < 9; i++) {
      const row = new Set(grid[i]);
      const col = new Set(grid.map((r) => r[i]));
      expect(row.size).toBe(9);
      expect(col.size).toBe(9);
    }
    for (let br = 0; br < 3; br++)
      for (let bc = 0; bc < 3; bc++) {
        const box = new Set<number>();
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) box.add(grid[br * 3 + i][bc * 3 + j]);
        expect(box.size).toBe(9);
      }
  });

  it('TC-GEN-02 [Positive]: generated easy puzzle has uniquely solvable cages', () => {
    const p = generatePuzzle(123, 1);
    expect(validateCageSumTotal(p.cages)).toBe(true);
    expect(validateCageStructure(p.cages, true).ok).toBe(true);
    const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(countSolutions(empty, p.cages, 2)).toBe(1);
  });

  it('TC-GEN-03 [Positive]: generated medium puzzle is uniquely solvable', () => {
    const p = generatePuzzle(456, 2);
    const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(countSolutions(empty, p.cages, 2)).toBe(1);
    const solved = solve(empty, p.cages);
    expect(solved).not.toBeNull();
    // Solver's solution must agree with the generator's "solved" grid.
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      expect(solved![r][c]).toBe(p.solved[r][c]);
    }
  });

  it('TC-GEN-04 [Boundary]: cage size distribution scales with difficulty', () => {
    // Hard puzzles tend to use larger cages than easy puzzles.
    const easy = generatePuzzle(11, 1);
    const hard = generatePuzzle(11, 3);
    const avg = (cs: { cells: unknown[] }[]) => cs.reduce((s, c) => s + c.cells.length, 0) / cs.length;
    expect(avg(hard.cages)).toBeGreaterThan(avg(easy.cages));
  });

  it('TC-GEN-05 [Positive]: same seed yields deterministic generation', () => {
    const a = generatePuzzle(2024, 2);
    const b = generatePuzzle(2024, 2);
    expect(a.cages.length).toBe(b.cages.length);
    for (let i = 0; i < a.cages.length; i++) {
      expect(a.cages[i].sum).toBe(b.cages[i].sum);
      expect(a.cages[i].cells).toEqual(b.cages[i].cells);
    }
  });
});
