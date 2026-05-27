// Unit tests for pure-logic helpers behind API routes (no HTTP layer).
import { describe, it, expect } from 'vitest';
import { scoreOf, computeStats, computeStreak, pickDailyPuzzleId } from '../src/lib/scoring';

describe('Score formula (UC8)', () => {
  it('TC-42 [Positive]: score = time + 60 × hintsUsed', () => {
    expect(scoreOf({ timeSeconds: 300, hintsUsed: 2 })).toBe(420);
  });

  it('TC-42b [Boundary]: zero hints yields raw time', () => {
    expect(scoreOf({ timeSeconds: 180, hintsUsed: 0 })).toBe(180);
  });
});

describe('Daily puzzle (UC12)', () => {
  it('TC-58 [Positive]: same daily for all users on same date', () => {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const a = pickDailyPuzzleId('2026-05-27', pool);
    const b = pickDailyPuzzleId('2026-05-27', pool);
    expect(a).toBe(b);
  });

  it('TC-60 [Boundary]: deterministic selection across days picks varied puzzles', () => {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const dates = ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28'];
    const ids = new Set(dates.map((d) => pickDailyPuzzleId(d, pool)));
    expect(ids.size).toBeGreaterThanOrEqual(2);
  });
});

describe('Stats aggregation (UC14)', () => {
  it('TC-67 [Positive]: best time per difficulty correct', () => {
    const stats = computeStats([
      { difficulty: 1, timeSeconds: 200, hintsUsed: 0, completedAt: '2026-05-25T10:00:00Z' },
      { difficulty: 1, timeSeconds: 150, hintsUsed: 0, completedAt: '2026-05-26T10:00:00Z' },
      { difficulty: 2, timeSeconds: 600, hintsUsed: 1, completedAt: '2026-05-26T10:00:00Z' },
    ]);
    expect(stats.bestPerDifficulty[1]).toBe(150);
    expect(stats.bestPerDifficulty[2]).toBe(600);
  });

  it('TC-69 [Positive]: win streak counts consecutive days', () => {
    const days = ['2026-05-25', '2026-05-26', '2026-05-27'];
    expect(computeStreak(days, '2026-05-27')).toBe(3);
  });

  it('TC-70 [Boundary]: streak resets on missed day', () => {
    const days = ['2026-05-24', '2026-05-25', '2026-05-27'];
    expect(computeStreak(days, '2026-05-27')).toBe(1);
  });
});

describe('Rating upsert (UC13)', () => {
  it('TC-64 [Positive]: second rating overwrites first', async () => {
    // Pure-DB behaviour is exercised via Prisma's `upsert`. The unique constraint
    // `(user_id, puzzle_id)` is asserted in the integration suite at runtime.
    // Here we assert the helper that builds the upsert payload.
    const { buildRatingUpsert } = await import('../src/lib/scoring');
    const payload = buildRatingUpsert(1, 1, 5, 'fits');
    expect(payload.update.stars).toBe(5);
    expect(payload.where.user_id_puzzle_id).toEqual({ user_id: 1, puzzle_id: 1 });
  });
});
