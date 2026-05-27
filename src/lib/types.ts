export type Grid = number[][];

export interface Cage {
  id: number;
  sum: number;
  cells: Array<[number, number]>;
}

export interface Puzzle {
  grid: Grid;
  cages: Cage[];
  difficulty: 1 | 2 | 3;
}
