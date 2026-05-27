// Unit tests for lib/validator.ts (Zod schemas + Killer Sudoku structural rules).
import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  resultSchema,
  ratingSchema,
  validateCageStructure,
  validateCageSumTotal,
  checkSolution,
} from '../src/lib/validator';
import { samplePuzzles } from './fixtures';

describe('Register schema (UC2)', () => {
  it('TC-05 [Positive]: accepts valid credentials', () => {
    expect(() => registerSchema.parse({ username: 'alice', email: 'a@b.de', password: 'Pass1234' })).not.toThrow();
  });

  it('TC-07 [Negative]: rejects invalid email', () => {
    expect(() => registerSchema.parse({ username: 'alice', email: 'no-at-sign', password: 'Pass1234' })).toThrow();
  });

  it('TC-08 [Boundary]: accepts 3-char username (min)', () => {
    expect(() => registerSchema.parse({ username: 'abc', email: 'a@b.de', password: 'Pass1234' })).not.toThrow();
  });

  it('TC-09 [Boundary]: accepts 20-char username (max)', () => {
    expect(() => registerSchema.parse({ username: 'a'.repeat(20), email: 'a@b.de', password: 'Pass1234' })).not.toThrow();
  });

  it('TC-10 [Boundary]: rejects 21-char username', () => {
    expect(() => registerSchema.parse({ username: 'a'.repeat(21), email: 'a@b.de', password: 'Pass1234' })).toThrow();
  });

  it('TC-11 [Negative]: rejects password without a digit', () => {
    expect(() => registerSchema.parse({ username: 'alice', email: 'a@b.de', password: 'onlyletters' })).toThrow();
  });

  it('TC-12 [Boundary]: rejects password under 8 chars', () => {
    expect(() => registerSchema.parse({ username: 'alice', email: 'a@b.de', password: 'A1b2c3' })).toThrow();
  });
});

describe('Cage structure (UC4)', () => {
  it('TC-20 [Boundary]: cage with 1 cell is valid', () => {
    const cages = [{ id: 1, sum: 5, cells: [[0, 0]] }];
    expect(validateCageStructure(cages, /* requireFullCover */ false).ok).toBe(true);
  });

  it('TC-21 [Boundary]: cage with 9 cells is valid', () => {
    const cells: Array<[number, number]> = Array.from({ length: 9 }, (_, i) => [0, i]);
    const cages = [{ id: 1, sum: 45, cells }];
    expect(validateCageStructure(cages, false).ok).toBe(true);
  });

  it('TC-22 [Negative]: overlapping cages rejected', () => {
    const cages = [
      { id: 1, sum: 5, cells: [[0, 0], [0, 1]] as Array<[number, number]> },
      { id: 2, sum: 3, cells: [[0, 1], [0, 2]] as Array<[number, number]> },
    ];
    const result = validateCageStructure(cages, false);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('overlap');
  });

  it('TC-23 [Negative]: incomplete coverage rejected when fullCover required', () => {
    const cages = [{ id: 1, sum: 5, cells: [[0, 0]] as Array<[number, number]> }];
    expect(validateCageStructure(cages, true).ok).toBe(false);
  });

  it('TC-24 [Boundary]: cage-size 0 rejected', () => {
    const cages = [{ id: 1, sum: 5, cells: [] as Array<[number, number]> }];
    expect(validateCageStructure(cages, false).ok).toBe(false);
  });
});

describe('Cage sum total = 405 (UC5)', () => {
  it('TC-26 [Negative]: cage sums totalling 400 rejected', () => {
    const cages = samplePuzzles.easy.cages.map((c, i) => (i === 0 ? { ...c, sum: c.sum - 5 } : c));
    expect(validateCageSumTotal(cages)).toBe(false);
  });

  it('TC-29 [Boundary]: cage sums totalling exactly 405 accepted', () => {
    expect(validateCageSumTotal(samplePuzzles.easy.cages)).toBe(true);
  });
});

describe('checkSolution (UC9)', () => {
  it('TC-43 [Positive]: a fully correct grid passes', () => {
    const { solved, cages } = samplePuzzles.easy;
    expect(checkSolution(solved, cages).ok).toBe(true);
  });

  it('TC-44 [Negative]: a wrong cell is reported', () => {
    const { solved, cages } = samplePuzzles.easy;
    const broken = solved.map((row) => [...row]);
    broken[0][0] = ((broken[0][0] % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    expect(checkSolution(broken, cages).ok).toBe(false);
  });

  it('TC-45 [Negative]: incomplete grid rejected', () => {
    const { solved, cages } = samplePuzzles.easy;
    const incomplete = solved.map((row) => [...row]);
    incomplete[8][8] = 0;
    expect(checkSolution(incomplete, cages).ok).toBe(false);
  });

  it('TC-46 [Negative]: cage-sum mismatch reported', () => {
    const { solved, cages } = samplePuzzles.easy;
    const badCages = cages.map((c, i) => (i === 0 ? { ...c, sum: c.sum + 7 } : c));
    const result = checkSolution(solved, badCages);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('cage_sum');
  });
});

describe('Result schema (UC10)', () => {
  it('TC-50 [Negative]: negative time rejected', () => {
    expect(() => resultSchema.parse({ puzzleId: 1, timeSeconds: -1, hintsUsed: 0 })).toThrow();
  });

  it('TC-49 [Boundary]: 0 hints accepted', () => {
    expect(() => resultSchema.parse({ puzzleId: 1, timeSeconds: 300, hintsUsed: 0 })).not.toThrow();
  });
});

describe('Rating schema (UC13)', () => {
  it('TC-63 [Negative]: stars > 5 rejected', () => {
    expect(() => ratingSchema.parse({ puzzleId: 1, stars: 6, difficultyFeedback: 'fits' })).toThrow();
  });

  it('TC-13rating [Positive]: valid rating accepted', () => {
    expect(() => ratingSchema.parse({ puzzleId: 1, stars: 4, difficultyFeedback: 'too_easy' })).not.toThrow();
  });
});
