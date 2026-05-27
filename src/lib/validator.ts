// Validation for both Zod request schemas and Killer Sudoku structural rules.
import { z } from 'zod';
import type { Cage, Grid } from './types';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[A-Za-z0-9_]+$/, 'Username may contain letters, digits, and underscores only'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one digit'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const resultSchema = z.object({
  puzzleId: z.number().int().positive(),
  timeSeconds: z.number().int().min(0).max(86400),
  hintsUsed: z.number().int().min(0).max(81),
});
export type ResultInput = z.infer<typeof resultSchema>;

export const ratingSchema = z.object({
  puzzleId: z.number().int().positive(),
  stars: z.number().int().min(1).max(5),
  difficultyFeedback: z.enum(['too_easy', 'fits', 'too_hard']),
});
export type RatingInput = z.infer<typeof ratingSchema>;

const cellTuple = z.tuple([z.number().int().min(0).max(8), z.number().int().min(0).max(8)]);
export const cageSchema = z.object({
  id: z.number().int(),
  sum: z.number().int().min(1).max(45),
  cells: z.array(cellTuple).min(1).max(9),
});

export const puzzleCreateSchema = z.object({
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  grid: z.array(z.array(z.number().int().min(0).max(9)).length(9)).length(9),
  cages: z.array(cageSchema).min(1).max(81),
});
export type PuzzleCreateInput = z.infer<typeof puzzleCreateSchema>;

export function validateCageSumTotal(cages: Array<{ sum: number }>): boolean {
  return cages.reduce((acc, c) => acc + c.sum, 0) === 405;
}

export interface StructureResult {
  ok: boolean;
  reason?: 'overlap' | 'incomplete' | 'empty_cage' | 'out_of_range' | 'too_large';
}

export function validateCageStructure(
  cages: Array<{ cells: Array<[number, number]>; sum: number }>,
  requireFullCover: boolean,
): StructureResult {
  const covered = new Set<string>();
  for (const cage of cages) {
    if (cage.cells.length === 0) return { ok: false, reason: 'empty_cage' };
    if (cage.cells.length > 9) return { ok: false, reason: 'too_large' };
    const localSet = new Set<string>();
    for (const [r, c] of cage.cells) {
      if (r < 0 || r > 8 || c < 0 || c > 8) return { ok: false, reason: 'out_of_range' };
      const key = `${r},${c}`;
      if (localSet.has(key)) return { ok: false, reason: 'overlap' };
      localSet.add(key);
      if (covered.has(key)) return { ok: false, reason: 'overlap' };
      covered.add(key);
    }
  }
  if (requireFullCover && covered.size !== 81) return { ok: false, reason: 'incomplete' };
  return { ok: true };
}

export interface CheckResult {
  ok: boolean;
  reason?: 'incomplete' | 'duplicate_row' | 'duplicate_col' | 'duplicate_box' | 'cage_dup' | 'cage_sum';
  conflicts?: Array<[number, number]>;
  cageId?: number;
}

export function checkSolution(grid: Grid, cages: Cage[]): CheckResult {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v < 1 || v > 9) return { ok: false, reason: 'incomplete', conflicts: [[r, c]] };
    }
  }
  for (let i = 0; i < 9; i++) {
    const row = new Set<number>();
    const col = new Set<number>();
    for (let j = 0; j < 9; j++) {
      row.add(grid[i][j]);
      col.add(grid[j][i]);
    }
    if (row.size !== 9) return { ok: false, reason: 'duplicate_row' };
    if (col.size !== 9) return { ok: false, reason: 'duplicate_col' };
  }
  for (let br = 0; br < 3; br++)
    for (let bc = 0; bc < 3; bc++) {
      const box = new Set<number>();
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) box.add(grid[br * 3 + i][bc * 3 + j]);
      if (box.size !== 9) return { ok: false, reason: 'duplicate_box' };
    }
  for (const cage of cages) {
    let sum = 0;
    const values = new Set<number>();
    for (const [r, c] of cage.cells) {
      const v = grid[r][c];
      if (values.has(v)) return { ok: false, reason: 'cage_dup', cageId: cage.id };
      values.add(v);
      sum += v;
    }
    if (sum !== cage.sum) return { ok: false, reason: 'cage_sum', cageId: cage.id };
  }
  return { ok: true };
}
