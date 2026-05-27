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

const CAGE_PALETTE = [
  'hsl(265 70% 70%)',
  'hsl(195 70% 70%)',
  'hsl(220 70% 75%)',
  'hsl(290 60% 75%)',
  'hsl(165 60% 70%)',
  'hsl(40 75% 75%)',
  'hsl(335 60% 75%)',
  'hsl(150 55% 70%)',
];

export function cageColor(cageId: number): string {
  return CAGE_PALETTE[cageId % CAGE_PALETTE.length];
}
