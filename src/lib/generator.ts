// Deterministic Killer Sudoku puzzle generator.
// 1. Build a valid 9x9 Sudoku solution (base pattern + permutations).
// 2. Partition the grid into adjacent cages of size 1..maxSize.
// 3. Set each cage's sum to the sum of the solved values inside.
// 4. Verify uniqueness with countSolutions; otherwise retry.
import { countSolutions } from './solver';
import type { Cage, Grid } from './types';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function baseGrid(): Grid {
  const g: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) g[r][c] = ((3 * (r % 3) + Math.floor(r / 3) + c) % 9) + 1;
  return g;
}

export function generateSolved(seed: number): Grid {
  const rng = mulberry32(seed);
  let g = baseGrid();
  // digit relabel
  const perm = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
  g = g.map((row) => row.map((v) => perm[v - 1]));
  // shuffle rows within bands
  for (let band = 0; band < 3; band++) {
    const order = shuffle([0, 1, 2], rng);
    const original = [g[band * 3], g[band * 3 + 1], g[band * 3 + 2]];
    for (let i = 0; i < 3; i++) g[band * 3 + i] = original[order[i]];
  }
  // shuffle bands
  const bandOrder = shuffle([0, 1, 2], rng);
  const originalBands = [
    [g[0], g[1], g[2]],
    [g[3], g[4], g[5]],
    [g[6], g[7], g[8]],
  ];
  for (let i = 0; i < 3; i++) {
    g[i * 3] = originalBands[bandOrder[i]][0];
    g[i * 3 + 1] = originalBands[bandOrder[i]][1];
    g[i * 3 + 2] = originalBands[bandOrder[i]][2];
  }
  // shuffle cols within stacks
  for (let stack = 0; stack < 3; stack++) {
    const order = shuffle([0, 1, 2], rng);
    for (let r = 0; r < 9; r++) {
      const orig = [g[r][stack * 3], g[r][stack * 3 + 1], g[r][stack * 3 + 2]];
      for (let i = 0; i < 3; i++) g[r][stack * 3 + i] = orig[order[i]];
    }
  }
  // shuffle stacks
  const stackOrder = shuffle([0, 1, 2], rng);
  for (let r = 0; r < 9; r++) {
    const orig = [
      [g[r][0], g[r][1], g[r][2]],
      [g[r][3], g[r][4], g[r][5]],
      [g[r][6], g[r][7], g[r][8]],
    ];
    for (let i = 0; i < 3; i++) {
      g[r][i * 3] = orig[stackOrder[i]][0];
      g[r][i * 3 + 1] = orig[stackOrder[i]][1];
      g[r][i * 3 + 2] = orig[stackOrder[i]][2];
    }
  }
  // optional transpose
  if (rng() < 0.5) {
    const t: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) t[c][r] = g[r][c];
    g = t;
  }
  return g;
}

function neighbours([r, c]: [number, number]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < 8) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < 8) out.push([r, c + 1]);
  return out;
}

function partitionIntoCages(solved: Grid, rng: () => number, sizeWeights: number[]): Cage[] {
  // sizeWeights[i] = probability weight for cage size (i+1). Length must be ≥1.
  const assigned: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  const cages: Cage[] = [];
  const order: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) order.push([r, c]);
  const shuffled = shuffle(order, rng);
  let id = 1;
  for (const [r, c] of shuffled) {
    if (assigned[r][c] !== -1) continue;
    const totalW = sizeWeights.reduce((a, b) => a + b, 0);
    let pick = rng() * totalW;
    let targetSize = 1;
    for (let i = 0; i < sizeWeights.length; i++) {
      pick -= sizeWeights[i];
      if (pick <= 0) {
        targetSize = i + 1;
        break;
      }
    }
    const cells: Array<[number, number]> = [[r, c]];
    const cageIdx = cages.length;
    assigned[r][c] = cageIdx;
    while (cells.length < targetSize) {
      const frontier: Array<[number, number]> = [];
      const seen = new Set<string>();
      for (const cell of cells) {
        for (const nb of neighbours(cell)) {
          const key = `${nb[0]},${nb[1]}`;
          if (assigned[nb[0]][nb[1]] === -1 && !seen.has(key)) {
            seen.add(key);
            frontier.push(nb);
          }
        }
      }
      if (frontier.length === 0) break;
      // pick neighbour whose value is not yet present in cage (avoid same-cage dup early)
      const present = new Set<number>(cells.map(([cr, cc]) => solved[cr][cc]));
      const valid = frontier.filter(([nr, nc]) => !present.has(solved[nr][nc]));
      const pool = valid.length > 0 ? valid : frontier;
      const next = pool[Math.floor(rng() * pool.length)];
      // skip if it would duplicate (force size-1 cage rather than create invalid one)
      if (present.has(solved[next[0]][next[1]])) break;
      assigned[next[0]][next[1]] = cageIdx;
      cells.push(next);
    }
    let sum = 0;
    for (const [cr, cc] of cells) sum += solved[cr][cc];
    cages.push({ id: id++, sum, cells });
  }
  return cages;
}

export interface GeneratedPuzzle {
  solved: Grid;
  cages: Cage[];
  difficulty: 1 | 2 | 3;
}

export function generatePuzzle(seed: number, difficulty: 1 | 2 | 3): GeneratedPuzzle {
  const rng = mulberry32(seed);
  const sizeWeights: Record<number, number[]> = {
    // [size1, size2, size3, size4, size5]
    1: [1, 6, 4, 0, 0],
    2: [1, 5, 5, 2, 0],
    3: [2, 3, 4, 4, 2],
  };
  let attempts = 0;
  while (attempts++ < 200) {
    const solved = generateSolved(seed + attempts * 7919);
    const cages = partitionIntoCages(solved, rng, sizeWeights[difficulty]);
    // Cage-sum total cheap check
    if (cages.reduce((a, c) => a + c.sum, 0) !== 405) continue;
    // Uniqueness check
    const empty: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const n = countSolutions(empty, cages, 2);
    if (n === 1) return { solved, cages, difficulty };
  }
  throw new Error(`Failed to generate uniquely-solvable puzzle for difficulty ${difficulty}`);
}
