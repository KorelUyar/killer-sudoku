import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { MyPuzzlesClient } from './MyPuzzlesClient';

export default async function MyPuzzlesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return <MyPuzzlesClient />;
}
