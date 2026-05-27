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

// R4 cage palette — riso-print harmony, 12 saturated tones used at 10-12% opacity
const CAGE_PALETTE = [
  '#f87171', // coral
  '#fb923c', // orange
  '#fbbf24', // amber
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#60a5fa', // sky
  '#818cf8', // indigo
  '#a78bfa', // iris
  '#e879f9', // fuchsia
  '#f472b6', // pink
  '#f9a8d4', // rose
];

export function cageColor(cageId: number): string {
  return CAGE_PALETTE[cageId % CAGE_PALETTE.length];
}
