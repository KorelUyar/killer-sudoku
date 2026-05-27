import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// R3 cage palette — 12 desaturated pastels for more variation
const CAGE_PALETTE = [
  '#fda4af', // rose
  '#fb923c', // orange
  '#fbbf24', // amber
  '#a3e635', // lime
  '#86efac', // mint
  '#22d3ee', // cyan
  '#60a5fa', // sky
  '#818cf8', // indigo
  '#c4b5fd', // lavender
  '#f9a8d4', // pink
  '#fdba74', // peach
  '#6ee7b7', // teal
];

export function cageColor(cageId: number): string {
  return CAGE_PALETTE[cageId % CAGE_PALETTE.length];
}
