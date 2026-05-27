import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { withErrors } from '@/lib/api-helpers';

export const POST = withErrors(async () => {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
});
