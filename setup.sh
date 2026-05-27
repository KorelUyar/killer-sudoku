#!/usr/bin/env bash
set -euo pipefail

echo "📦  Installing npm dependencies…"
npm install --no-audit --no-fund

if [ ! -f .env ]; then
  echo "🔐  Creating .env from .env.example (edit it before running for real!)"
  cp .env.example .env
fi

echo "🐬  Applying sudoku.sql to MySQL — you'll be prompted for the MySQL root password"
mysql -u root -p < sudoku.sql

echo "🔧  Generating Prisma client + pushing schema…"
npx prisma generate
npx prisma db push --skip-generate

echo "🌱  Seeding admin + 9 puzzles + today's daily…"
npx tsx seed.ts

cat <<EOF

✅  Setup complete.

Next steps:
   npm run dev      → http://localhost:3000
   npm test         → run unit tests

Default login: admin / Admin1234
EOF
