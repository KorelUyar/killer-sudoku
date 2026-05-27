import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PuzzleBuilder } from './PuzzleBuilder';

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return <PuzzleBuilder />;
}
