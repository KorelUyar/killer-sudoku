import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { hashPassword, issueToken, setAuthCookie, HttpError } from '@/lib/auth';
import { registerSchema } from '@/lib/validator';
import { withErrors } from '@/lib/api-helpers';

export const POST = withErrors(async (req) => {
  const body = await req.json();
  const { username, email, password } = registerSchema.parse(body);
  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true },
    });
    const token = await issueToken(user.id, user.username);
    await setAuthCookie(token);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'Username or email already in use');
    }
    throw err;
  }
});
