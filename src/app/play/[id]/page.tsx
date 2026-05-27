import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { SolveBoard } from './SolveBoard';

export default async function SolvePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: numId },
    include: { creator: { select: { username: true } } },
  });
  if (!puzzle) notFound();
  const user = await getCurrentUser();
  return (
    <SolveBoard
      puzzleId={puzzle.id}
      difficulty={puzzle.difficulty}
      creator={puzzle.creator.username}
      grid={puzzle.gridJson as unknown as number[][]}
      cages={puzzle.cagesJson as unknown as { id: number; sum: number; cells: Array<[number, number]> }[]}
      currentUser={user}
    />
  );
}
