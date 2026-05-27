// Seed script: admin user, 9 puzzles (3 per difficulty), today's daily entry.
// Run: npx tsx seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generatePuzzle } from './src/lib/generator';
import { pickDailyPuzzleId } from './src/lib/scoring';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  const passwordHash = await bcrypt.hash('Admin1234', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@killer-sudoku.local',
      passwordHash,
    },
  });
  console.log(`✓ Admin user (id=${admin.id})`);

  const existing = await prisma.puzzle.count({ where: { creatorId: admin.id } });
  if (existing >= 9) {
    console.log(`✓ ${existing} puzzles already exist, skipping generation`);
  } else {
    console.log('Generating 9 puzzles (this can take a minute on hard)…');
    let seed = 1000;
    for (const difficulty of [1, 2, 3] as const) {
      for (let k = 0; k < 3; k++) {
        seed += 13;
        const start = Date.now();
        const puzzle = generatePuzzle(seed, difficulty);
        const ms = Date.now() - start;
        const preFilled = puzzle.grid.flat().filter((v) => v !== 0).length;
        const created = await prisma.puzzle.create({
          data: {
            creatorId: admin.id,
            difficulty,
            gridJson: puzzle.grid as unknown as object,
            cagesJson: puzzle.cages as unknown as object,
          },
        });
        console.log(`  ✓ puzzle #${created.id} (difficulty=${difficulty}, ${preFilled} clues) in ${ms}ms`);
      }
    }
  }

  const allPuzzleIds = (await prisma.puzzle.findMany({ select: { id: true }, orderBy: { id: 'asc' } })).map((p) => p.id);
  const today = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(today + 'T00:00:00Z');
  const dailyId = pickDailyPuzzleId(today, allPuzzleIds);
  await prisma.dailyPuzzle.upsert({
    where: { date: todayDate },
    update: { puzzleId: dailyId },
    create: { puzzleId: dailyId, date: todayDate },
  });
  console.log(`✓ Daily puzzle for ${today} → #${dailyId}`);

  console.log('🌱 Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
