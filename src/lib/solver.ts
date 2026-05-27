// Killer Sudoku backtracking solver with cage constraints, MRV heuristic, and
// uniqueness check.
import type { Cage, Grid } from './types';

interface Workspace {
  grid: number[][];
  cages: Cage[];
  cellToCage: number[][];
}

function buildWorkspace(grid: Grid, cages: Cage[]): Workspace {
  const g = grid.map((row) => [...row]);
  const cellToCage: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  cages.forEach((cage, i) => {
    for (const [r, c] of cage.cells) cellToCage[r][c] = i;
  });
  return { grid: g, cages, cellToCage };
}

// Tight value-range check for the cage that contains (r,c) when placing v.
function cageAllows(ws: Workspace, r: number, c: number, v: number): boolean {
  const cageIdx = ws.cellToCage[r][c];
  if (cageIdx < 0) return false;
  const cage = ws.cages[cageIdx];
  let sum = v;
  let filled = 1;
  const usedInCage = new Set<number>([v]);
  for (const [cr, cc] of cage.cells) {
    if (cr === r && cc === c) continue;
    const cv = ws.grid[cr][cc];
    if (cv === 0) continue;
    if (usedInCage.has(cv)) return false;
    usedInCage.add(cv);
    sum += cv;
    filled++;
  }
  if (filled === cage.cells.length) return sum === cage.sum;
  if (sum >= cage.sum) return false;
  const remaining = cage.cells.length - filled;
  const available: number[] = [];
  for (let n = 1; n <= 9; n++) if (!usedInCage.has(n)) available.push(n);
  if (available.length < remaining) return false;
  let minFill = 0;
  for (let i = 0; i < remaining; i++) minFill += available[i];
  let maxFill = 0;
  for (let i = available.length - remaining; i < available.length; i++) maxFill += available[i];
  if (sum + maxFill < cage.sum) return false;
  if (sum + minFill > cage.sum) return false;
  return true;
}

function isValid(ws: Workspace, r: number, c: number, v: number): boolean {
  const g = ws.grid;
  for (let i = 0; i < 9; i++) {
    if (i !== c && g[r][i] === v) return false;
    if (i !== r && g[i][c] === v) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const rr = br + i;
      const cc = bc + j;
      if ((rr !== r || cc !== c) && g[rr][cc] === v) return false;
    }
  return cageAllows(ws, r, c, v);
}

function candidates(ws: Workspace, r: number, c: number): number[] {
  const result: number[] = [];
  for (let v = 1; v <= 9; v++) if (isValid(ws, r, c, v)) result.push(v);
  return result;
}

function findMRV(ws: Workspace): { r: number; c: number; cands: number[] } | null {
  let best: { r: number; c: number; cands: number[] } | null = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (ws.grid[r][c] !== 0) continue;
      const cands = candidates(ws, r, c);
      if (cands.length === 0) return { r, c, cands };
      if (best === null || cands.length < best.cands.length) best = { r, c, cands };
      if (best.cands.length === 1) return best;
    }
  }
  return best;
}

function backtrack(ws: Workspace): boolean {
  const m = findMRV(ws);
  if (m === null) return true;
  if (m.cands.length === 0) return false;
  for (const v of m.cands) {
    ws.grid[m.r][m.c] = v;
    if (backtrack(ws)) return true;
    ws.grid[m.r][m.c] = 0;
  }
  return false;
}

export function solve(grid: Grid, cages: Cage[]): Grid | null {
  const ws = buildWorkspace(grid, cages);
  return backtrack(ws) ? ws.grid : null;
}

export function countSolutions(grid: Grid, cages: Cage[], max = 2): number {
  const ws = buildWorkspace(grid, cages);
  let count = 0;
  const recurse = (): void => {
    if (count >= max) return;
    const m = findMRV(ws);
    if (m === null) {
      count++;
      return;
    }
    if (m.cands.length === 0) return;
    for (const v of m.cands) {
      ws.grid[m.r][m.c] = v;
      recurse();
      ws.grid[m.r][m.c] = 0;
      if (count >= max) return;
    }
  };
  recurse();
  return count;
}
