// R3 unit tests — difficulty pre-fills, distributed cell picker, hint targets.
import { describe, it, expect } from 'vitest';
import { PREFILL_RANGE, pickDistributedCells, generatePuzzle } from '../src/lib/generator';
import { computeHint } from '../src/lib/hint';
import { countSolutions } from '../src/lib/solver';
import type { Grid } from '../src/lib/types';

describe('R3 — difficulty-based pre-fills', () => {
  it('TC-R3-PREFILL-EASY [Positive]: Easy puzzle has 20–25 clues', () => {
    const p = generatePuzzle(2026001, 1);
    const givens = p.grid.flat().filter((v) => v !== 0).length;
    expect(givens).toBeGreaterThanOrEqual(PREFILL_RANGE[1][0]);
    expect(givens).toBeLessThanOrEqual(PREFILL_RANGE[1][1]);
  });

  it('TC-R3-PREFILL-MEDIUM [Positive]: Medium puzzle has 8–12 clues', () => {
    const p = generatePuzzle(2026002, 2);
    const givens = p.grid.flat().filter((v) => v !== 0).length;
    expect(givens).toBeGreaterThanOrEqual(PREFILL_RANGE[2][0]);
    expect(givens).toBeLessThanOrEqual(PREFILL_RANGE[2][1]);
  });

  it('TC-R3-PREFILL-HARD [Boundary]: Hard puzzle has 0 clues', () => {
    const p = generatePuzzle(2026003, 3);
    expect(p.grid.flat().filter((v) => v !== 0).length).toBe(0);
  });

  it('TC-R3-PREFILL-UNIQUE [Positive]: pre-filled clues match the canonical solution', () => {
    const p = generatePuzzle(2026010, 1);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (p.grid[r][c] !== 0) {
          expect(p.grid[r][c]).toBe(p.solved[r][c]);
        }
      }
    }
    // Pre-filled puzzle must still be uniquely solvable.
    expect(countSolutions(p.grid, p.cages, 2)).toBe(1);
  });
});

describe('R3 — distributed cell picker', () => {
  // Deterministic RNG so the assertion is stable.
  function mkRng(seed: number) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  it('TC-R3-DISTRIBUTE-COUNT [Positive]: returns exactly N unique cells', () => {
    const cells = pickDistributedCells(20, mkRng(1));
    expect(cells.length).toBe(20);
    const set = new Set(cells.map(([r, c]) => `${r},${c}`));
    expect(set.size).toBe(20);
  });

  it('TC-R3-DISTRIBUTE-SPREAD [Positive]: 9 cells distribute across all 9 boxes', () => {
    const cells = pickDistributedCells(9, mkRng(2));
    const boxes = new Set(cells.map(([r, c]) => `${Math.floor(r / 3)}-${Math.floor(c / 3)}`));
    expect(boxes.size).toBe(9);
  });

  it('TC-R3-DISTRIBUTE-ZERO [Boundary]: N=0 returns []', () => {
    expect(pickDistributedCells(0, mkRng(3))).toEqual([]);
  });
});

describe('R3 — hint targets pre-filled / wrong / empty cells correctly', () => {
  it('TC-R3-HINT-RESPECTS-GIVENS [Positive]: hint never overwrites a pre-filled cell', () => {
    const p = generatePuzzle(2026020, 1);
    const current: Grid = p.grid.map((row) => [...row]);
    const hint = computeHint(current, p.cages, p.grid);
    expect(hint).not.toBeNull();
    // The chosen cell must not be a given (i.e. originally 0).
    expect(p.grid[hint!.row][hint!.col]).toBe(0);
    // And the suggested value matches the canonical solution.
    expect(hint!.value).toBe(p.solved[hint!.row][hint!.col]);
  });
});
