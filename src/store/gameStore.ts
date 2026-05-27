import { create } from 'zustand';
import type { Cage, Grid } from '@/lib/types';

export const HINT_PENALTY_SECONDS = 60;

interface GameState {
  puzzleId: number | null;
  grid: Grid;
  notes: Set<number>[][];
  givens: boolean[][];
  revealed: boolean[][];           // cells filled by "Give up" reveal
  emptyCellCount: number;          // initial empty cell count = hint cap
  cages: Cage[];
  selected: [number, number] | null;
  conflicts: Set<string>;
  hintsUsed: number;
  startedAt: number;
  elapsedSeconds: number;          // raw wall-clock seconds since startedAt
  displaySeconds: number;          // = elapsedSeconds + hintsUsed * HINT_PENALTY_SECONDS
  hintPenaltyFlash: number;        // increments each hint to drive +60 animation
  notesMode: boolean;
  lastPlaced: [number, number] | null;
  hintCell: [number, number] | null;
  status: 'idle' | 'playing' | 'paused' | 'won' | 'gave_up';

  loadPuzzle: (puzzleId: number, grid: Grid, cages: Cage[]) => void;
  selectCell: (r: number, c: number) => void;
  placeNumber: (n: number) => void;
  erase: () => void;
  toggleNotesMode: () => void;
  applyHint: (row: number, col: number, value: number) => void;
  revealSolution: (solved: Grid) => void;
  setConflicts: (cells: Array<[number, number]>) => void;
  clearConflicts: () => void;
  tick: () => void;
  reset: () => void;
  win: () => void;
}

function emptyNotes(): Set<number>[][] {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
}

function emptyBoolGrid(): boolean[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(false));
}

export const useGameStore = create<GameState>((set, get) => ({
  puzzleId: null,
  grid: Array.from({ length: 9 }, () => Array(9).fill(0)),
  notes: emptyNotes(),
  givens: emptyBoolGrid(),
  revealed: emptyBoolGrid(),
  emptyCellCount: 81,
  cages: [],
  selected: null,
  conflicts: new Set(),
  hintsUsed: 0,
  startedAt: Date.now(),
  elapsedSeconds: 0,
  displaySeconds: 0,
  hintPenaltyFlash: 0,
  notesMode: false,
  lastPlaced: null,
  hintCell: null,
  status: 'idle',

  loadPuzzle: (puzzleId, grid, cages) => {
    const givens = grid.map((row) => row.map((v) => v !== 0));
    const emptyCellCount = givens.flat().filter((g) => !g).length;
    set({
      puzzleId,
      grid: grid.map((r) => [...r]),
      notes: emptyNotes(),
      givens,
      revealed: emptyBoolGrid(),
      emptyCellCount,
      cages,
      selected: null,
      conflicts: new Set(),
      hintsUsed: 0,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      displaySeconds: 0,
      hintPenaltyFlash: 0,
      notesMode: false,
      lastPlaced: null,
      hintCell: null,
      status: 'playing',
    });
  },

  selectCell: (r, c) => set({ selected: [r, c], hintCell: null }),

  placeNumber: (n) => {
    const { selected, grid, givens, notesMode, notes, status } = get();
    if (!selected || status !== 'playing') return;
    const [r, c] = selected;
    if (givens[r][c]) return;
    if (notesMode) {
      const newNotes = notes.map((row) => row.map((s) => new Set(s)));
      const cellSet = newNotes[r][c];
      if (cellSet.has(n)) cellSet.delete(n);
      else cellSet.add(n);
      set({ notes: newNotes });
      return;
    }
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = n;
    const newNotes = notes.map((row) => row.map((s) => new Set(s)));
    newNotes[r][c].clear();
    set({ grid: newGrid, notes: newNotes, lastPlaced: [r, c], conflicts: new Set() });
  },

  erase: () => {
    const { selected, grid, givens, notes, status } = get();
    if (!selected || status !== 'playing') return;
    const [r, c] = selected;
    if (givens[r][c]) return;
    if (grid[r][c] !== 0) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = 0;
      set({ grid: newGrid });
      return;
    }
    if (notes[r][c].size > 0) {
      const newNotes = notes.map((row) => row.map((s) => new Set(s)));
      newNotes[r][c].clear();
      set({ notes: newNotes });
    }
  },

  toggleNotesMode: () => set({ notesMode: !get().notesMode }),

  revealSolution: (solved) => {
    const { givens, grid } = get();
    const newGrid = grid.map((r) => [...r]);
    const newRevealed = emptyBoolGrid();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (givens[r][c]) continue;
        if (newGrid[r][c] !== solved[r][c]) {
          newGrid[r][c] = solved[r][c];
          newRevealed[r][c] = true;
        }
      }
    }
    set({
      grid: newGrid,
      revealed: newRevealed,
      notes: emptyNotes(),
      status: 'gave_up',
      selected: null,
      conflicts: new Set(),
    });
  },

  applyHint: (row, col, value) => {
    const { grid, notes, hintsUsed, elapsedSeconds, hintPenaltyFlash } = get();
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = value;
    const newNotes = notes.map((r) => r.map((s) => new Set(s)));
    newNotes[row][col].clear();
    const newHintsUsed = hintsUsed + 1;
    set({
      grid: newGrid,
      notes: newNotes,
      hintsUsed: newHintsUsed,
      // Timer jumps forward by HINT_PENALTY_SECONDS visually.
      displaySeconds: elapsedSeconds + newHintsUsed * HINT_PENALTY_SECONDS,
      hintPenaltyFlash: hintPenaltyFlash + 1,
      hintCell: [row, col],
      selected: [row, col],
      lastPlaced: [row, col],
    });
  },

  setConflicts: (cells) => set({ conflicts: new Set(cells.map(([r, c]) => `${r},${c}`)) }),
  clearConflicts: () => set({ conflicts: new Set() }),

  tick: () => {
    const { startedAt, status, hintsUsed } = get();
    if (status !== 'playing') return;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    set({
      elapsedSeconds: elapsed,
      displaySeconds: elapsed + hintsUsed * HINT_PENALTY_SECONDS,
    });
  },

  reset: () =>
    set({
      puzzleId: null,
      grid: Array.from({ length: 9 }, () => Array(9).fill(0)),
      notes: emptyNotes(),
      givens: emptyBoolGrid(),
      revealed: emptyBoolGrid(),
      emptyCellCount: 81,
      cages: [],
      selected: null,
      conflicts: new Set(),
      hintsUsed: 0,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      displaySeconds: 0,
      hintPenaltyFlash: 0,
      notesMode: false,
      lastPlaced: null,
      hintCell: null,
      status: 'idle',
    }),

  win: () => set({ status: 'won' }),
}));
