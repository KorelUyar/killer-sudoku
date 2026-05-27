import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, issueToken, setAuthCookie, HttpError } from '@/lib/auth';
import { loginSchema } from '@/lib/validator';
import { withErrors } from '@/lib/api-helpers';

export const POST = withErrors(async (req) => {
  const body = await req.json();
  const { username, password } = loginSchema.parse(body);
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new HttpError(401, 'Invalid credentials');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');
  const token = await issueToken(user.id, user.username);
  await setAuthCookie(token);
  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email },
  });
});
