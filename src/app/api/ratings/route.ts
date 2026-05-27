import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, HttpError } from '@/lib/auth';
import { ratingSchema } from '@/lib/validator';
import { withErrors } from '@/lib/api-helpers';

export const POST = withErrors(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { puzzleId, stars, difficultyFeedback } = ratingSchema.parse(body);

  const hasResult = await prisma.result.findFirst({
    where: { userId: user.id, puzzleId },
    select: { id: true },
  });
  if (!hasResult) throw new HttpError(403, 'You must solve the puzzle before rating it');

  await prisma.rating.upsert({
    where: { user_id_puzzle_id: { userId: user.id, puzzleId } },
    create: { userId: user.id, puzzleId, stars, difficultyFeedback },
    update: { stars, difficultyFeedback },
  });
  return NextResponse.json({ ok: true });
});
