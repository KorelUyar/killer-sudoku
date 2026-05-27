// Compute a single hint.
//
// The hint targets the cell that the player most needs to correct:
//   1. solve the *original* puzzle (givens only) to get the canonical solution
//   2. consider every cell that is not a given AND whose current value
//      differs from the solution (either empty OR wrong)
//   3. among those, pick the one with the fewest legal candidates relative
//      to the player's current grid (MRV — minimum remaining values)
//   4. return its correct value
//
// Returning a *wrong* user value is treated the same as an empty cell:
// the player gets corrected.
import { solve } from './solver';
import type { Cage, Grid } from './types';

export interface Hint { row: number; col: number; value: number }

function isAllCorrect(grid: Grid, solved: Grid): boolean {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (grid[r][c] !== solved[r][c]) return false;
  }
  return true;
}

export function computeHint(
  currentGrid: Grid,
  cages: Cage[],
  originalGrid?: Grid,
): Hint | null {
  // Solve from the *original* puzzle so wrong user values don't break the solver.
  const origin = originalGrid ?? currentGrid.map((row) => row.map((v) => 0));
  const solved = solve(origin, cages);
  if (!solved) return null;

  // If the player has already solved the puzzle, no hint is possible.
  if (isAllCorrect(currentGrid, solved)) return null;

  const cellToCage: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  cages.forEach((cg, i) => cg.cells.forEach(([r, c]) => (cellToCage[r][c] = i)));

  let best: Hint | null = null;
  let bestCount = 10;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      // Skip cells that are givens — those are fixed by the puzzle author.
      if (origin[r][c] !== 0) continue;
      // Skip cells already correctly filled.
      if (currentGrid[r][c] === solved[r][c]) continue;

      // Count candidates relative to the player's current state.
      const used = new Set<number>();
      for (let i = 0; i < 9; i++) {
        if (i !== c && currentGrid[r][i] > 0) used.add(currentGrid[r][i]);
        if (i !== r && currentGrid[i][c] > 0) used.add(currentGrid[i][c]);
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const rr = br + i;
        const cc = bc + j;
        if ((rr !== r || cc !== c) && currentGrid[rr][cc] > 0) used.add(currentGrid[rr][cc]);
      }
      const cageIdx = cellToCage[r][c];
      if (cageIdx >= 0) {
        for (const [cr, cc] of cages[cageIdx].cells) {
          if ((cr !== r || cc !== c) && currentGrid[cr][cc] > 0) used.add(currentGrid[cr][cc]);
        }
      }
      const candCount = Math.max(0, 9 - used.size);
      if (candCount < bestCount) {
        bestCount = candCount;
        best = { row: r, col: c, value: solved[r][c] };
        if (candCount <= 1) return best;
      }
    }
  }
  return best;
}
