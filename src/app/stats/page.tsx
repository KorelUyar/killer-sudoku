import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { StatsDashboard } from './StatsDashboard';

export default async function StatsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return <StatsDashboard username={user.username} />;
}
