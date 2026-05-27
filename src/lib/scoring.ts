// Pure-logic helpers for scoring, daily puzzle selection, and per-user stats.
export interface ResultLike { timeSeconds: number; hintsUsed: number }

export const HINT_PENALTY_SECONDS = 60;

export function scoreOf({ timeSeconds, hintsUsed }: ResultLike): number {
  return timeSeconds + hintsUsed * HINT_PENALTY_SECONDS;
}

export function pickDailyPuzzleId(dateStr: string, pool: number[]): number {
  if (pool.length === 0) throw new Error('pool empty');
  let h = 5381 >>> 0;
  for (let i = 0; i < dateStr.length; i++) h = (((h << 5) + h + dateStr.charCodeAt(i)) >>> 0) >>> 0;
  return pool[h % pool.length];
}

export interface StatsInput {
  difficulty: number;
  timeSeconds: number;
  hintsUsed: number;
  completedAt: string;
}

export interface Stats {
  totalSolved: number;
  bestPerDifficulty: Record<number, number>;
  avgPerDifficulty: Record<number, number>;
  totalHints: number;
  currentStreak: number;
}

export function computeStats(results: StatsInput[], referenceDate?: string): Stats {
  const bestPerDifficulty: Record<number, number> = {};
  const sumPerDifficulty: Record<number, number> = {};
  const countPerDifficulty: Record<number, number> = {};
  let totalHints = 0;
  for (const r of results) {
    const prev = bestPerDifficulty[r.difficulty];
    if (prev === undefined || r.timeSeconds < prev) bestPerDifficulty[r.difficulty] = r.timeSeconds;
    sumPerDifficulty[r.difficulty] = (sumPerDifficulty[r.difficulty] || 0) + r.timeSeconds;
    countPerDifficulty[r.difficulty] = (countPerDifficulty[r.difficulty] || 0) + 1;
    totalHints += r.hintsUsed;
  }
  const avgPerDifficulty: Record<number, number> = {};
  for (const k of Object.keys(sumPerDifficulty)) {
    const d = Number(k);
    avgPerDifficulty[d] = Math.round(sumPerDifficulty[d] / countPerDifficulty[d]);
  }
  const days = results.map((r) => r.completedAt.slice(0, 10));
  const today = referenceDate ?? new Date().toISOString().slice(0, 10);
  const currentStreak = computeStreak(days, today);
  return { totalSolved: results.length, bestPerDifficulty, avgPerDifficulty, totalHints, currentStreak };
}

export function computeStreak(days: string[], today: string): number {
  const set = new Set(days);
  if (!set.has(today)) return 0;
  let streak = 0;
  const cur = new Date(today + 'T00:00:00Z');
  while (set.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setUTCDate(cur.getUTCDate() - 1);
  }
  return streak;
}

export function buildRatingUpsert(
  userId: number,
  puzzleId: number,
  stars: number,
  difficultyFeedback: 'too_easy' | 'fits' | 'too_hard',
) {
  return {
    where: { user_id_puzzle_id: { user_id: userId, puzzle_id: puzzleId } },
    create: { userId, puzzleId, stars, difficultyFeedback },
    update: { stars, difficultyFeedback },
  };
}
