# Test Protocol — Killer Sudoku Web Application

**Project**: Killer Sudoku (Skills Battle 2026 — Application Development)
**Author**: Korel Uyar
**Date**: 2026-05-27
**Document version**: INITIAL (test plan only; "Actual Result" and "Status" columns are filled in the FINAL revision after implementation)

---

## 1. Scope

This document lists every test case that will be executed to verify the Killer Sudoku web application against the 14 use cases (11 mandatory + 3 additional).

For every use case, the protocol covers at least one **positive**, one **negative**, and where meaningful one **boundary** test. Pure-logic cases (solver, validator, hint, scoring) are additionally implemented as **automated unit tests** with Vitest; the column "Unit Test?" marks them with Y. UI-driven cases are executed manually.

Legend for the **Status** column (filled in FINAL revision only):

| Symbol | Meaning |
|--------|---------|
| ✅ | Pass |
| ❌ | Fail |
| ⚠ | Pass with caveat (see notes) |
| ⏳ | Not yet executed |

## 2. Test Environment

- Node.js 20+, MySQL 8+
- Browser: Chromium 120+ (manual cases)
- Tests run with `npm test` (Vitest)
- Database seeded with admin user `admin / Admin1234` and 9 puzzles (3 per difficulty)

---

## 3. Test Cases

| # | Use Case | Test Case Name | Type | Unit Test? | Preconditions | Steps | Expected Result | Actual Result | Status |
|---|----------|----------------|------|------------|---------------|-------|------------------|----------------|--------|
| 1 | UC1: read rules | Guest opens landing page | Positive | N | App running, not logged in | Visit `/` | Hero, rules teaser and "Read full rules" link visible | TBD | ⏳ |
| 2 | UC1: read rules | Full rules page renders example | Positive | N | App running | Visit `/rules` | Full rules + animated example Killer Sudoku puzzle visible | TBD | ⏳ |
| 3 | UC1: read rules | Rules accessible without auth | Negative | N | Logged out | Open `/rules` directly via URL | 200 OK, no redirect to login | TBD | ⏳ |
| 4 | UC1: read rules | Rules link from navbar always visible | Positive | N | Any auth state | Inspect navbar on every page | "Rules" link present | TBD | ⏳ |
| 5 | UC2: create user | Register with valid credentials | Positive | Y | DB clean | POST `/api/auth/register` with `{username:"alice", email:"a@b.de", password:"Pass1234"}` | 201 Created, user row in DB with bcrypt hash | TBD | ⏳ |
| 6 | UC2: create user | Duplicate username rejected | Negative | Y | User "alice" exists | POST register with username "alice" again | 409 Conflict, no row inserted | TBD | ⏳ |
| 7 | UC2: create user | Invalid email format rejected | Negative | Y | DB clean | POST register with email "not-an-email" | 400 Bad Request, Zod error | TBD | ⏳ |
| 8 | UC2: create user | Username with 3 chars accepted (min) | Boundary | Y | DB clean | POST register username="abc" | 201 Created | TBD | ⏳ |
| 9 | UC2: create user | Username with 20 chars accepted (max) | Boundary | Y | DB clean | POST register with 20-char username | 201 Created | TBD | ⏳ |
| 10 | UC2: create user | Username 21 chars rejected | Boundary | Y | DB clean | POST register with 21-char username | 400 Bad Request | TBD | ⏳ |
| 11 | UC2: create user | Password without digit rejected | Negative | Y | DB clean | POST register password="onlyletters" | 400 Bad Request | TBD | ⏳ |
| 12 | UC2: create user | Password under 8 chars rejected | Boundary | Y | DB clean | POST register password="A1b2c3" | 400 Bad Request | TBD | ⏳ |
| 13 | UC3: login | Login with valid creds returns JWT cookie | Positive | Y | User exists | POST `/api/auth/login` valid creds | 200 OK, HttpOnly cookie `auth_token` set | TBD | ⏳ |
| 14 | UC3: login | Wrong password rejected | Negative | Y | User exists | POST login wrong password | 401 Unauthorized, no cookie | TBD | ⏳ |
| 15 | UC3: login | Non-existent user rejected | Negative | Y | DB clean | POST login username "ghost" | 401 Unauthorized | TBD | ⏳ |
| 16 | UC3: login | Authenticated `/api/auth/me` returns user | Positive | N | Logged in | GET `/api/auth/me` | 200 OK with `{id, username, email}` | TBD | ⏳ |
| 17 | UC3: login | Logout clears cookie | Positive | N | Logged in | POST `/api/auth/logout` | 200 OK, cookie cleared, subsequent `/me` → 401 | TBD | ⏳ |
| 18 | UC4: enter puzzle | Logged-in user opens /create | Positive | N | Logged in | Visit `/create` | Empty 9×9 grid + cage drawing tools shown | TBD | ⏳ |
| 19 | UC4: enter puzzle | Guest redirected from /create | Negative | N | Not logged in | Visit `/create` | Redirect to `/auth/login` | TBD | ⏳ |
| 20 | UC4: enter puzzle | Cage of 1 cell allowed | Boundary | Y | Builder open | Draw cage covering single cell, set sum=5 | Cage saved client-side | TBD | ⏳ |
| 21 | UC4: enter puzzle | Cage of 9 cells allowed | Boundary | Y | Builder open | Draw cage covering an entire row | Cage saved | TBD | ⏳ |
| 22 | UC4: enter puzzle | Overlapping cages rejected | Negative | Y | Builder open | Attempt to draw a cage over already-caged cells | Error toast, cage not saved | TBD | ⏳ |
| 23 | UC4: enter puzzle | Cells not in any cage prevents save | Negative | Y | Builder open | Click Save with 80 cells caged | Error: "All 81 cells must be inside a cage" | TBD | ⏳ |
| 24 | UC4: enter puzzle | Difficulty selector enforces 1–3 | Boundary | Y | Builder open | Try to set difficulty=4 | UI prevents value, only 1/2/3 selectable | TBD | ⏳ |
| 25 | UC5: save new puzzle | Save valid puzzle persists in DB | Positive | Y | Logged in, valid puzzle in builder | POST `/api/puzzles` | 201 Created, row in `puzzles` table | TBD | ⏳ |
| 26 | UC5: save new puzzle | Reject puzzle where Σ cages ≠ 405 | Negative | Y | Puzzle with cage sums totalling 400 | POST `/api/puzzles` | 400 Bad Request, error "Cage sums must total 405" | TBD | ⏳ |
| 27 | UC5: save new puzzle | Reject unsolvable puzzle | Negative | Y | Puzzle constructed so no assignment works | POST `/api/puzzles` | 400 Bad Request, error "Puzzle has no solution" | TBD | ⏳ |
| 28 | UC5: save new puzzle | Reject puzzle with multiple solutions | Negative | Y | Puzzle with ambiguous cages | POST `/api/puzzles` | 400 Bad Request, error "Solution is not unique" | TBD | ⏳ |
| 29 | UC5: save new puzzle | Cage sum 45 for full-row cage accepted | Boundary | Y | Puzzle with one 9-cell cage summing 45 + rest of cages valid | POST `/api/puzzles` | 201 Created | TBD | ⏳ |
| 30 | UC6: solve puzzle | Open existing puzzle renders grid | Positive | N | Puzzle id 1 exists | Visit `/play/1` | Grid + cages render correctly | TBD | ⏳ |
| 31 | UC6: solve puzzle | Non-existent puzzle returns 404 | Negative | N | id 99999 not in DB | Visit `/play/99999` | 404 page | TBD | ⏳ |
| 32 | UC6: solve puzzle | Number entered persists in client state | Positive | N | Puzzle open | Click cell, press 5 | Cell shows 5, value retained in Zustand store | TBD | ⏳ |
| 33 | UC6: solve puzzle | Notes mode places candidates | Positive | N | Puzzle open | Toggle Notes, click cell, press 3 then 7 | 3 and 7 shown as small candidates in cell | TBD | ⏳ |
| 34 | UC6: solve puzzle | Arrow keys navigate grid | Positive | N | Cell selected | Press ArrowRight, ArrowDown | Selection moves accordingly | TBD | ⏳ |
| 35 | UC7: ask for hint | Hint reveals correct value | Positive | Y | Puzzle in progress | POST `/api/puzzles/:id/hint` with current state | 200 OK, returns `{row, col, value}` matching unique solution | TBD | ⏳ |
| 36 | UC7: ask for hint | Hint counter increments | Positive | Y | hintsUsed=0 in state | Request hint | Store hintsUsed=1, UI badge updates | TBD | ⏳ |
| 37 | UC7: ask for hint | Hint on already-solved grid is no-op | Negative | Y | All cells filled correctly | Request hint | 200 OK with `null`, counter NOT incremented | TBD | ⏳ |
| 38 | UC7: ask for hint | Hint picks MRV cell | Positive | Y | State where one empty cell has 1 candidate | Request hint | Returned cell is the MRV cell | TBD | ⏳ |
| 39 | UC8: show high score | Leaderboard sorted by score ascending | Positive | N | 3 results in DB | GET `/api/leaderboard` | Results ordered: best (lowest score) first | TBD | ⏳ |
| 40 | UC8: show high score | Filter by difficulty=2 | Positive | N | Results across difficulties | GET `/api/leaderboard?difficulty=2` | Only difficulty=2 results | TBD | ⏳ |
| 41 | UC8: show high score | Empty leaderboard renders empty state | Boundary | N | No results | Visit `/leaderboard` | "No results yet" message | TBD | ⏳ |
| 42 | UC8: show high score | Score = timeSeconds + hintsUsed × 60 | Positive | Y | Result(time=300, hints=2) | Compute score | Score = 420 | TBD | ⏳ |
| 43 | UC9: check solution | Valid full grid passes | Positive | Y | All cells correct | POST `/api/puzzles/:id/check` | 200 OK with `{ok: true}` | TBD | ⏳ |
| 44 | UC9: check solution | Invalid solution rejected | Negative | Y | One cell wrong | POST check | 200 OK with `{ok: false, conflicts: [...]}` | TBD | ⏳ |
| 45 | UC9: check solution | Incomplete grid rejected | Negative | Y | Some cells empty | POST check | 200 OK with `{ok: false, reason: "incomplete"}` | TBD | ⏳ |
| 46 | UC9: check solution | Cage sum mismatch reported | Negative | Y | Full grid but cage sum wrong | POST check | `{ok: false, reason: "cage_sum"}` with cage id | TBD | ⏳ |
| 47 | UC10: save result | Authenticated save persists | Positive | N | Logged in, puzzle solved | POST `/api/results` `{puzzleId, timeSeconds:300, hintsUsed:1}` | 201 Created, row in `results` | TBD | ⏳ |
| 48 | UC10: save result | Guest save rejected | Negative | N | Not logged in | POST `/api/results` | 401 Unauthorized | TBD | ⏳ |
| 49 | UC10: save result | Result with 0 hints accepted | Boundary | N | Logged in | POST result with hintsUsed=0 | 201 Created | TBD | ⏳ |
| 50 | UC10: save result | Negative time rejected | Negative | Y | Logged in | POST result with timeSeconds=-1 | 400 Bad Request | TBD | ⏳ |
| 51 | UC11: auto solve | Solver solves a valid puzzle within 2s | Positive | Y | Sample medium puzzle | Call `solve(grid, cages)` | Returns full solution; duration < 2000ms | TBD | ⏳ |
| 52 | UC11: auto solve | Solver returns null on unsolvable | Negative | Y | Constructed unsolvable puzzle | Call `solve()` | Returns `null` | TBD | ⏳ |
| 53 | UC11: auto solve | Solver handles single empty cell | Boundary | Y | Grid with 80/81 filled correctly | Call `solve()` | Returns grid with last cell filled | TBD | ⏳ |
| 54 | UC11: auto solve | Uniqueness check detects single solution | Positive | Y | Standard puzzle | Call `countSolutions(grid, cages, max=2)` | Returns 1 | TBD | ⏳ |
| 55 | UC11: auto solve | Uniqueness check detects multiple | Negative | Y | Ambiguous puzzle | Call `countSolutions(grid, cages, max=2)` | Returns 2 | TBD | ⏳ |
| 56 | UC11: auto solve | Σ cages ≠ 405 short-circuits before backtracking | Positive | Y | Puzzle with cage sums = 400 | Call `validate(cages)` | Returns false immediately, no solver invoked | TBD | ⏳ |
| 57 | UC12: daily | `/daily` shows today's puzzle | Positive | N | Daily puzzle for today exists | Visit `/daily` | Grid for today's daily renders | TBD | ⏳ |
| 58 | UC12: daily | Same daily for all users on same date | Positive | Y | Two users, same date | Both call `GET /api/daily` | Both receive same `puzzleId` | TBD | ⏳ |
| 59 | UC12: daily | Daily leaderboard scoped to today | Positive | N | Results on previous days exist | GET `/api/daily/leaderboard` | Only today's results returned | TBD | ⏳ |
| 60 | UC12: daily | First request of day creates daily row | Boundary | Y | No daily for today yet | GET `/api/daily` | Row inserted, daily puzzle id returned | TBD | ⏳ |
| 61 | UC13: rate puzzle | Rate puzzle after solve | Positive | N | Result saved for puzzle 1 | POST `/api/ratings` `{puzzleId:1, stars:5, difficultyFeedback:"fits"}` | 201 Created | TBD | ⏳ |
| 62 | UC13: rate puzzle | Cannot rate without solving | Negative | N | No result for user/puzzle | POST rating | 403 Forbidden | TBD | ⏳ |
| 63 | UC13: rate puzzle | Stars outside 1–5 rejected | Negative | Y | Logged in | POST rating stars=6 | 400 Bad Request | TBD | ⏳ |
| 64 | UC13: rate puzzle | Second rating updates first (upsert) | Positive | Y | Existing rating for user/puzzle | POST rating again with different stars | 200 OK, row updated not duplicated | TBD | ⏳ |
| 65 | UC13: rate puzzle | Average rating shown on puzzle card | Positive | N | 3 ratings: 4, 5, 3 | GET `/api/puzzles` | Average 4.0 displayed | TBD | ⏳ |
| 66 | UC14: stats | Stats page shows solved count | Positive | N | User solved 5 puzzles | Visit `/stats` | "Solved: 5" displayed | TBD | ⏳ |
| 67 | UC14: stats | Best time per difficulty | Positive | Y | Multiple results | GET `/api/stats` | Per-difficulty best time correct | TBD | ⏳ |
| 68 | UC14: stats | Empty stats for new user | Boundary | N | New user, no results | Visit `/stats` | Empty-state with CTA "Solve your first puzzle" | TBD | ⏳ |
| 69 | UC14: stats | Win streak counts consecutive days | Positive | Y | Results on 3 consecutive days | Compute streak | Streak = 3 | TBD | ⏳ |
| 70 | UC14: stats | Streak resets on missed day | Boundary | Y | Results day 1, 2, skip 3, 4 | Compute streak | Current streak = 1 | TBD | ⏳ |
| 71 | UC3: login | Navbar updates immediately after sign-in (no manual refresh) | Positive | N | Logged out, on `/auth/login` | Submit valid creds | Top-right navbar shows the avatar + username without the user having to refresh the browser | TBD | ⏳ |
| 72 | UC7: ask for hint | Hint adds a +60s penalty to the displayed timer | Positive | N | Puzzle in progress, timer running | Click the Hint button | Displayed timer immediately jumps forward by 60 seconds; a small "+60s" indicator floats above the timer | TBD | ⏳ |
| 73 | UC7: ask for hint | Hint corrects a wrong user value, not only empty cells | Positive | Y | Player has typed a wrong digit into at least one cell | Click Hint | Hint API returns a cell whose user-value differs from the canonical solution, and provides the correct value; the system does **not** wrongly say "grid is complete" | TBD | ⏳ |

---

## 4. Coverage Summary

| Use Case | Total | Positive | Negative | Boundary | Unit Tests |
|----------|-------|----------|----------|----------|------------|
| UC1 read rules | 4 | 3 | 1 | 0 | 0 |
| UC2 create user | 8 | 1 | 4 | 3 | 8 |
| UC3 login | 6 | 4 | 2 | 0 | 3 |
| UC4 enter puzzle | 7 | 1 | 3 | 3 | 5 |
| UC5 save new puzzle | 5 | 1 | 3 | 1 | 5 |
| UC6 solve puzzle | 5 | 4 | 1 | 0 | 0 |
| UC7 ask for hint | 6 | 5 | 1 | 0 | 5 |
| UC8 high score | 4 | 2 | 0 | 1 | 1 |
| UC9 check solution | 4 | 1 | 3 | 0 | 4 |
| UC10 save result | 4 | 1 | 2 | 1 | 1 |
| UC11 auto solve | 6 | 4 | 2 | 1 | 6 |
| UC12 daily | 4 | 3 | 0 | 1 | 2 |
| UC13 rate puzzle | 5 | 3 | 2 | 0 | 2 |
| UC14 stats | 5 | 3 | 0 | 2 | 3 |
| **Total** | **73** | **36** | **24** | **13** | **45** |

73 total test cases (well above the 50 minimum), 45 of which are automated via Vitest.

---

## 5. Execution Procedure

1. Run `npm install` to install dependencies.
2. Provision MySQL and apply `sudoku.sql`, then run `npx prisma db push`.
3. Seed with `npx tsx seed.ts` — this creates the `admin` user, 9 puzzles, today's daily entry.
4. Run `npm test -- --run` for the 45 unit tests.
5. Run `npm run dev` and execute the manual cases against `http://localhost:3000`.
6. Record outcomes in this document's *Actual Result* / *Status* columns and re-export the FINAL PDF.
