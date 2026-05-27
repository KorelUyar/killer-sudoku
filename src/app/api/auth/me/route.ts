import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { withErrors } from '@/lib/api-helpers';

export const GET = withErrors(async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
});
