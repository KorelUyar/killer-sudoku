import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GuestLanding } from './GuestLanding';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/play');

  // Live numbers for the stats strip — falls back to defaults if the DB is empty
  // or unreachable (e.g. during static prerender).
  let puzzleCount = 9;
  let userCount = 1;
  try {
    [puzzleCount, userCount] = await Promise.all([
      prisma.puzzle.count(),
      prisma.user.count(),
    ]);
  } catch {
    /* keep defaults */
  }

  return <GuestLanding puzzleCount={puzzleCount} userCount={userCount} />;
}
