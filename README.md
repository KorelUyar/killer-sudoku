<div align="center">

# 🎯 Killer Sudoku

### A premium web application for solving and creating Killer Sudoku puzzles

**Skills Battle 2026 — Application Development**

Built with Next.js 15, TypeScript, Prisma, MySQL, and a lot of attention to detail.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Screenshots](#-screenshots)

---

</div>

## ✨ Features

- 🎮 **Solve Puzzles** — Play through hand-crafted Killer Sudoku puzzles with elegant cage rendering
- 🎨 **Create Puzzles** — Visual cage editor with tap-to-select, plus a one-click Random Generator
- 💡 **Smart Hints** — Constraint-propagation-based hint system (with time penalty)
- 📅 **Daily Challenge** — A new puzzle every day, with a dedicated leaderboard
- 🏆 **Global Leaderboard** — Time + hints based scoring across all puzzles
- ⭐ **Community Ratings** — Rate puzzles after solving, with difficulty feedback
- 📊 **Personal Stats** — Win streaks, average times, hint usage trends
- 🌙 **Premium Dark UI** — Glassmorphism, aurora background, gradient accents
- 🔊 **Subtle Sound Design** — Optional audio feedback for every interaction
- ⌨️ **Keyboard-First** — Arrow keys, number keys, full a11y support

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 18 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| State | Zustand + TanStack Query |
| Database | MySQL 8 |
| ORM | Prisma |
| Auth | JWT in HttpOnly cookies (`jose` + `bcryptjs`) |
| Validation | Zod |
| Testing | Vitest |
| Charts | Recharts |
| Sound | Web Audio API (no audio assets) |

## 🧠 The Algorithm

The heart of the app is a Killer Sudoku solver implemented in [`src/lib/solver.ts`](src/lib/solver.ts):

- **Backtracking** with constraint propagation
- **MRV** (Minimum Remaining Values) heuristic
- **Cage-sum constraints** evaluated incrementally
- **Uniqueness check** — refuses to save puzzles with multiple solutions
- **Math shortcut** — uses the fact that all 81 cells sum to 405 to fail-fast on invalid cage configurations

The random puzzle generator in [`src/lib/generator.ts`](src/lib/generator.ts) produces valid, unique puzzles with cage sizes calibrated per difficulty level.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **MySQL** 8 or higher (running locally)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/KorelUyar/killer-sudoku.git
cd killer-sudoku

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL and JWT_SECRET

# 4. Initialize the database
mysql -u root -p < sudoku.sql
npx prisma generate
npx prisma db push

# 5. Seed initial data (admin user + 9 puzzles + today's daily)
npx tsx seed.ts

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're in.

### Default Login

| Username | Password |
|---|---|
| `admin` | `Admin1234` |

### Run the Tests

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## 📸 Screenshots

> Add your screenshots to `docs/mockups/screenshots/` and reference them here.

| Landing | Solve |
|---|---|
| ![Landing](docs/mockups/screenshots/01-landing.png) | ![Solve](docs/mockups/screenshots/05-solve.png) |
| Create | Stats |
|---|---|
| ![Create](docs/mockups/screenshots/06-create.png) | ![Stats](docs/mockups/screenshots/09-stats.png) |

## 📂 Project Structure

```
killer-sudoku/
├── src/
│   ├── app/              # Next.js routes (App Router)
│   ├── components/       # React components
│   │   ├── sudoku/       # Grid, Cell, NumberPad, Timer
│   │   └── shared/       # Navbar, Aurora, SoundProvider, Footer
│   ├── lib/              # Core logic
│   │   ├── solver.ts     # Killer Sudoku solver
│   │   ├── validator.ts  # Validation logic
│   │   ├── hint.ts       # Hint algorithm
│   │   ├── generator.ts  # Random puzzle generator
│   │   ├── scoring.ts    # Score & stats helpers
│   │   ├── auth.ts       # JWT + bcrypt
│   │   └── constants.ts  # Repo URL, author, project name
│   └── store/            # Zustand stores
├── prisma/
│   └── schema.prisma
├── tests/                # Vitest test suites
├── docs/                 # Documentation, test protocols (MD + PDF)
└── sudoku.sql            # Standalone MySQL schema
```

## 🗺️ Use Cases Implemented

All 11 mandatory use cases from the assignment, plus 3 self-defined extensions:

| # | Use Case | Status |
|---|---|---|
| 1 | Read rules | ✅ |
| 2 | Create user | ✅ |
| 3 | Login | ✅ |
| 4 | Enter puzzle | ✅ |
| 5 | Save new puzzle (only if solvable & unique) | ✅ |
| 6 | Solve puzzle | ✅ |
| 7 | Ask for a hint (+60s penalty) | ✅ |
| 8 | Show high score | ✅ |
| 9 | Check solution | ✅ |
| 10 | Save result | ✅ |
| 11 | Auto solve | ✅ |
| 12 | Puzzle of the Day (extension) | ✅ |
| 13 | Rate puzzle after solving (extension) | ✅ |
| 14 | Personal stats dashboard (extension) | ✅ |

## 📐 Validation Rules

- Σ of all cage sums must equal **405** (9 × 45) — fail-fast check before invoking the solver
- Cages must cover all 81 cells with no overlap
- Cage size: 1–9 cells
- Cage sum: 1–45
- Difficulty: 1, 2, or 3
- Username: 3–20 chars, alphanumeric + underscore
- Password: min 8 chars, ≥1 letter, ≥1 digit
- Email: RFC-compliant format

## 🧪 Testing

**85 documented test cases** (50+ minimum requirement), **47 automated** via Vitest:

- Pure logic (solver, validator, hint, scoring, generator) — full unit-test coverage
- API routes — exercised through the manual test plan
- UI flows — manual test protocol

See [`docs/test-protocol-FINAL.pdf`](docs/test-protocol-FINAL.pdf) for the full protocol with results.

## 📄 Documentation

Full documentation is in [`docs/DOCUMENTATION.pdf`](docs/DOCUMENTATION.pdf), covering:

- Mockups & design rationale
- Database ER diagram
- Class diagram
- Additional use cases & justification
- Validation rules
- Hint algorithm explanation
- Math: why Σ = 405
- Test protocol summary

## 👤 Author

**Korel Uyar**
Skills Battle 2026 — BZZ Bildungszentrum Zürichsee

## 📜 License

This project was built for the Skills Battle 2026 competition. Code is provided as-is for educational purposes.

<div align="center">

Made with care, caffeine, and a healthy obsession with cage constraints.

</div>
