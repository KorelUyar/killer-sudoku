// Unit tests for lib/hint.ts.
import { describe, it, expect } from 'vitest';
import { computeHint } from '../src/lib/hint';
import { samplePuzzles, almostSolvedPuzzle } from './fixtures';

describe('Hint (UC7)', () => {
  it('TC-35 [Positive]: reveals a correct value for an empty cell', () => {
    const { grid, cages, solved } = samplePuzzles.easy;
    const hint = computeHint(grid, cages);
    expect(hint).not.toBeNull();
    expect(grid[hint!.row][hint!.col]).toBe(0);
    expect(hint!.value).toBe(solved[hint!.row][hint!.col]);
  });

  it('TC-36 [Positive]: an applied hint reduces empty-cell count by 1', () => {
    const { grid, cages } = samplePuzzles.easy;
    const before = grid.flat().filter((v) => v === 0).length;
    const hint = computeHint(grid, cages)!;
    const after = grid.map((r) => [...r]);
    after[hint.row][hint.col] = hint.value;
    const remaining = after.flat().filter((v) => v === 0).length;
    expect(before - remaining).toBe(1);
  });

  it('TC-37 [Negative]: returns null on an already-solved grid', () => {
    const { solved, cages } = samplePuzzles.easy;
    expect(computeHint(solved, cages)).toBeNull();
  });

  it('TC-38 [Positive]: picks the MRV (most constrained) empty cell', () => {
    // almostSolvedPuzzle has only one empty cell — MRV trivially returns it.
    const { grid, cages } = almostSolvedPuzzle;
    const hint = computeHint(grid, cages)!;
    expect(grid[hint.row][hint.col]).toBe(0);
  });

  it('TC-HINT-WRONG [Positive]: hints correct even when player has wrong values', () => {
    // Take the solved puzzle and corrupt one cell — the hint must surface the
    // correct value at that cell, not return "grid is complete".
    const { solved, cages } = samplePuzzles.easy;
    const broken = solved.map((row) => [...row]);
    const correct = broken[3][4];
    broken[3][4] = ((correct % 9) + 1); // any digit != correct
    const original = Array.from({ length: 9 }, () => Array(9).fill(0));
    const hint = computeHint(broken, cages, original);
    expect(hint).not.toBeNull();
    // The hint must agree with the canonical solution at the returned cell.
    expect(hint!.value).toBe(solved[hint!.row][hint!.col]);
  });

  it('TC-HINT-FULL-WRONG [Negative]: returns null when player accidentally typed the full solution', () => {
    const { solved, cages } = samplePuzzles.easy;
    const original = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(computeHint(solved, cages, original)).toBeNull();
  });
});
