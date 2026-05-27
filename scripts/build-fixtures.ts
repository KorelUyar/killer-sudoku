// Generates real Killer Sudoku fixtures once and writes them as JSON.
// Run with: npx tsx scripts/build-fixtures.ts
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generatePuzzle } from '../src/lib/generator';
import { countSolutions, solve } from '../src/lib/solver';
import type { Cage, Grid } from '../src/lib/types';

console.log('Generating sample puzzles...');
const start = Date.now();
const easy = generatePuzzle(101, 1);
console.log(`  easy ✓ (${Date.now() - start}ms)`);
const t2 = Date.now();
const medium = generatePuzzle(202, 2);
console.log(`  medium ✓ (${Date.now() - t2}ms)`);
const t3 = Date.now();
const hard = generatePuzzle(303, 3);
console.log(`  hard ✓ (${Date.now() - t3}ms)`);

// Build "empty grid" puzzles (cages-only) which is the canonical Killer Sudoku form.
function emptyGrid(): Grid { return Array.from({ length: 9 }, () => Array(9).fill(0)); }

// almostSolved: full solved grid, blank one cell, give all cages
const almost = JSON.parse(JSON.stringify(easy.solved)) as Grid;
almost[0][0] = 0;

// unsolvable: take easy's cages and corrupt one sum to an impossible value.
// Choose a 2-cell cage and set sum = 19 (max for 2 cells = 9+8=17).
const twoCell = easy.cages.find((c) => c.cells.length === 2);
if (!twoCell) throw new Error('expected a 2-cell cage in easy');
const unsolvable = {
  grid: emptyGrid(),
  cages: easy.cages.map((c) => (c.id === twoCell.id ? { ...c, sum: 19 } : c)),
  solved: emptyGrid(),
};

// ambiguous: 9 row-cages summing 45 each. countSolutions ≥ 2 (many sudoku solutions).
const rowCages: Cage[] = [];
for (let r = 0; r < 9; r++) {
  rowCages.push({
    id: r + 1,
    sum: 45,
    cells: Array.from({ length: 9 }, (_, c) => [r, c] as [number, number]),
  });
}
const ambiguous = { grid: emptyGrid(), cages: rowCages, solved: emptyGrid() };

// Verify everything before saving
console.log('Verifying...');
function verifyUnique(name: string, grid: Grid, cages: Cage[]): void {
  const t = Date.now();
  const n = countSolutions(grid, cages, 2);
  console.log(`  ${name}: ${n} solution(s) [${Date.now() - t}ms]`);
}
verifyUnique('easy', emptyGrid(), easy.cages);
verifyUnique('medium', emptyGrid(), medium.cages);
verifyUnique('hard', emptyGrid(), hard.cages);
verifyUnique('almostSolved', almost, easy.cages);
const ambN = countSolutions(emptyGrid(), rowCages, 2);
console.log(`  ambiguous row-cages: countSolutions(max=2) = ${ambN}`);
const unsolvedSolve = solve(emptyGrid(), unsolvable.cages);
console.log(`  unsolvable: solve() = ${unsolvedSolve === null ? 'null ✓' : 'NON-NULL ✗'}`);

const payload = {
  easy: { grid: emptyGrid(), cages: easy.cages, solved: easy.solved },
  medium: { grid: emptyGrid(), cages: medium.cages, solved: medium.solved },
  hard: { grid: emptyGrid(), cages: hard.cages, solved: hard.solved },
  almostSolved: { grid: almost, cages: easy.cages, solved: easy.solved },
  unsolvable: { grid: emptyGrid(), cages: unsolvable.cages, solved: emptyGrid() },
  ambiguous: { grid: emptyGrid(), cages: ambiguous.cages, solved: emptyGrid() },
};

const outPath = resolve('tests/fixtures-data.json');
writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`Wrote ${outPath}`);
