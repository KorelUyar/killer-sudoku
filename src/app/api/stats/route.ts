import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { computeStats } from '@/lib/scoring';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async () => {
  const user = await requireUser();
  const results = await prisma.result.findMany({
    where: { userId: user.id },
    include: { puzzle: { select: { difficulty: true } } },
    orderBy: { completedAt: 'desc' },
  });
  const stats = computeStats(
    results.map((r) => ({
      difficulty: r.puzzle.difficulty,
      timeSeconds: r.timeSeconds,
      hintsUsed: r.hintsUsed,
      completedAt: r.completedAt.toISOString(),
    })),
  );
  const recent = results.slice(0, 10).map((r) => ({
    puzzleId: r.puzzleId,
    difficulty: r.puzzle.difficulty,
    timeSeconds: r.timeSeconds,
    hintsUsed: r.hintsUsed,
    completedAt: r.completedAt,
  }));

  // Bucket per ISO week × difficulty for the line + bar charts (last 8 weeks).
  function isoWeekStart(d: Date): Date {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = date.getUTCDay() || 7; // Monday = 1, Sunday = 7
    if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
    return date;
  }
  const today = new Date();
  const thisWeek = isoWeekStart(today);
  const weeks: Array<{ label: string; weekStartISO: string }> = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(thisWeek);
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push({ label: `W${8 - i}`, weekStartISO: d.toISOString().slice(0, 10) });
  }

  type WeekRow = { label: string; weekStartISO: string; easy: number | null; medium: number | null; hard: number | null; count: number };
  const series: WeekRow[] = weeks.map((w) => ({ ...w, easy: null, medium: null, hard: null, count: 0 }));
  const sums: Record<number, Record<string, { sum: number; n: number }>> = { 1: {}, 2: {}, 3: {} };

  for (const r of results) {
    const ws = isoWeekStart(r.completedAt).toISOString().slice(0, 10);
    const row = series.find((s) => s.weekStartISO === ws);
    if (!row) continue;
    row.count++;
    const dKey = r.puzzle.difficulty;
    if (!sums[dKey][ws]) sums[dKey][ws] = { sum: 0, n: 0 };
    sums[dKey][ws].sum += r.timeSeconds;
    sums[dKey][ws].n++;
  }
  for (const row of series) {
    const e = sums[1][row.weekStartISO];
    const m = sums[2][row.weekStartISO];
    const h = sums[3][row.weekStartISO];
    row.easy = e ? Math.round(e.sum / e.n) : null;
    row.medium = m ? Math.round(m.sum / m.n) : null;
    row.hard = h ? Math.round(h.sum / h.n) : null;
  }

  const firstSolveDate = results.length ? results[results.length - 1].completedAt : null;

  return NextResponse.json({ stats, recent, series, firstSolveDate });
});
