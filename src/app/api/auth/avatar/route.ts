import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/db';
import { requireUser, HttpError } from '@/lib/auth';
import { withErrors } from '@/lib/api-helpers';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_DIR = path.join(process.cwd(), 'public', 'avatars');

async function ensureDir() {
  try {
    await mkdir(AVATAR_DIR, { recursive: true });
  } catch {
    /* exists */
  }
}

export const POST = withErrors(async (req) => {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get('avatar');
  if (!(file instanceof File)) throw new HttpError(400, 'No file uploaded');
  if (file.size === 0) throw new HttpError(400, 'Empty file');
  if (file.size > MAX_BYTES) throw new HttpError(400, 'File too large (max 2 MB)');
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new HttpError(400, 'Invalid file type (jpeg, png, webp only)');
  }

  await ensureDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${user.id}_${Date.now()}.webp`;
  const filepath = path.join(AVATAR_DIR, filename);

  const resized = await sharp(buffer)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();
  await writeFile(filepath, resized);

  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing?.avatarUrl) {
    const oldPath = path.join(process.cwd(), 'public', existing.avatarUrl);
    try { await unlink(oldPath); } catch { /* gone is fine */ }
  }

  const avatarUrl = `/avatars/${filename}`;
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
  return NextResponse.json({ ok: true, avatarUrl });
});

export const DELETE = withErrors(async () => {
  const user = await requireUser();
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing?.avatarUrl) {
    const filepath = path.join(process.cwd(), 'public', existing.avatarUrl);
    try { await unlink(filepath); } catch { /* gone is fine */ }
  }
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } });
  return NextResponse.json({ ok: true });
});
