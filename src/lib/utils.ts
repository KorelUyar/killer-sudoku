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

// R2 cage palette — desaturated pastels per spec
const CAGE_PALETTE = [
  '#fda4af', // rose
  '#fcd34d', // amber
  '#86efac', // mint
  '#93c5fd', // sky
  '#c4b5fd', // lavender
  '#f9a8d4', // pink
  '#fdba74', // peach
  '#6ee7b7', // teal
];

export function cageColor(cageId: number): string {
  return CAGE_PALETTE[cageId % CAGE_PALETTE.length];
}
