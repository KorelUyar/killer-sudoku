'use client';
// Lightweight sound provider — uses the Web Audio API directly to generate
// short tones (no external mp3 assets required).
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type SoundKey = 'place' | 'erase' | 'error' | 'hint' | 'complete' | 'win';

interface SoundContextValue {
  play: (k: SoundKey) => void;
  enabled: boolean;
  setEnabled: (b: boolean) => void;
  volume: number;
  setVolume: (n: number) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const RECIPES: Record<SoundKey, Array<{ freq: number; durMs: number; type?: OscillatorType; gain?: number }>> = {
  place:    [{ freq: 880,  durMs: 60, type: 'sine', gain: 0.18 }],
  erase:    [{ freq: 320,  durMs: 70, type: 'sine', gain: 0.15 }],
  error:    [{ freq: 180,  durMs: 80, type: 'square', gain: 0.18 }, { freq: 130, durMs: 90, type: 'square', gain: 0.16 }],
  hint:     [{ freq: 660,  durMs: 60, type: 'triangle', gain: 0.18 }, { freq: 990, durMs: 80, type: 'triangle', gain: 0.16 }],
  complete: [{ freq: 660,  durMs: 80, type: 'sine', gain: 0.16 }, { freq: 880, durMs: 100, type: 'sine', gain: 0.16 }],
  win:      [
    { freq: 660, durMs: 100, type: 'triangle', gain: 0.2 },
    { freq: 880, durMs: 110, type: 'triangle', gain: 0.2 },
    { freq: 1320, durMs: 240, type: 'triangle', gain: 0.22 },
  ],
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabledState] = useState(true);
  const [volume, setVolumeState] = useState(0.6);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const e = localStorage.getItem('sound:enabled');
    const v = localStorage.getItem('sound:volume');
    if (e !== null) setEnabledState(e === 'true');
    if (v !== null) setVolumeState(Number(v));
  }, []);

  const setEnabled = (b: boolean) => {
    setEnabledState(b);
    if (typeof window !== 'undefined') localStorage.setItem('sound:enabled', String(b));
  };
  const setVolume = (n: number) => {
    setVolumeState(n);
    if (typeof window !== 'undefined') localStorage.setItem('sound:volume', String(n));
  };

  const play = useMemo(
    () => (key: SoundKey) => {
      if (!enabled || typeof window === 'undefined') return;
      if (!ctxRef.current) {
        const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
        const AC = window.AudioContext || w.webkitAudioContext;
        if (!AC) return;
        ctxRef.current = new AC();
      }
      const ctx = ctxRef.current;
      let t = ctx.currentTime;
      for (const step of RECIPES[key]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = step.type ?? 'sine';
        osc.frequency.value = step.freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime((step.gain ?? 0.18) * volume, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + step.durMs / 1000);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + step.durMs / 1000 + 0.02);
        t += step.durMs / 1000;
      }
    },
    [enabled, volume],
  );

  return (
    <SoundContext.Provider value={{ play, enabled, setEnabled, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used inside SoundProvider');
  return ctx;
}
