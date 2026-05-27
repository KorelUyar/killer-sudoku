'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Lightbulb, Check, RotateCcw, Trophy, Star, Volume2, VolumeX } from 'lucide-react';
import { SudokuGrid } from '@/components/sudoku/Grid';
import { NumberPad } from '@/components/sudoku/NumberPad';
import { Timer } from '@/components/sudoku/Timer';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/components/shared/SoundProvider';
import { formatTime } from '@/lib/utils';
import type { Cage, Grid } from '@/lib/types';

interface Props {
  puzzleId: number;
  difficulty: number;
  creator: string;
  grid: Grid;
  cages: Cage[];
  currentUser: { id: number; username: string } | null;
}

export function SolveBoard({ puzzleId, difficulty, creator, grid, cages, currentUser }: Props) {
  const loadPuzzle = useGameStore((s) => s.loadPuzzle);
  const board = useGameStore((s) => s.grid);
  const setConflicts = useGameStore((s) => s.setConflicts);
  const clearConflicts = useGameStore((s) => s.clearConflicts);
  const applyHint = useGameStore((s) => s.applyHint);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const displaySeconds = useGameStore((s) => s.displaySeconds);
  const status = useGameStore((s) => s.status);
  const win = useGameStore((s) => s.win);
  const { play, enabled, setEnabled } = useSound();
  const [resultSaved, setResultSaved] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<'too_easy' | 'fits' | 'too_hard'>('fits');

  useEffect(() => {
    loadPuzzle(puzzleId, grid, cages);
  }, [puzzleId, grid, cages, loadPuzzle]);

  async function onCheck() {
    const r = await fetch(`/api/puzzles/${puzzleId}/check`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grid: board }),
    });
    const data = await r.json();
    if (data.ok) {
      win();
      play('win');
      toast.success('Solved!');
      if (currentUser && !resultSaved) {
        const post = await fetch('/api/results', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ puzzleId, timeSeconds: elapsedSeconds, hintsUsed }),
        });
        if (post.ok) setResultSaved(true);
      }
    } else {
      play('error');
      if (data.reason === 'incomplete') toast.warning('Grid is not complete yet.');
      else if (data.reason === 'cage_sum') toast.error(`Cage #${data.cageId} sum is wrong.`);
      else toast.error('That solution is not correct.');
      if (data.conflicts) setConflicts(data.conflicts);
      setTimeout(() => clearConflicts(), 800);
    }
  }

  async function onHint() {
    const r = await fetch(`/api/puzzles/${puzzleId}/hint`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grid: board }),
    });
    const data = await r.json();
    if (!r.ok) {
      toast.error(data.error ?? 'Hint failed');
      return;
    }
    if (!data.hint) {
      toast.info('No hint available — grid is complete.');
      return;
    }
    applyHint(data.hint.row, data.hint.col, data.hint.value);
    play('hint');
    toast.success(`Hint: ${data.hint.value} at R${data.hint.row + 1}C${data.hint.col + 1}`);
  }

  async function submitRating() {
    if (!currentUser || !resultSaved || rating === 0) return;
    const r = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ puzzleId, stars: rating, difficultyFeedback: feedback }),
    });
    if (r.ok) toast.success('Thanks for rating!');
    else toast.error('Rating failed');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-[1fr_auto] gap-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-white/55">Puzzle #{puzzleId} · by {creator}</div>
            <div className="text-lg font-medium">
              {['', 'Easy', 'Medium', 'Hard'][difficulty]} cages
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Timer />
            <span className="text-sm text-white/65">Hints: <span className="font-mono text-accent-glow">{hintsUsed}</span></span>
            <button
              aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
              onClick={() => setEnabled(!enabled)}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <SudokuGrid cages={cages} />
      </div>

      <div className="flex flex-col gap-4 w-full lg:w-80">
        <NumberPad />
        <div className="card flex flex-col gap-2">
          <button onClick={onHint} className="btn-ghost justify-between">
            <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-300" /> Hint</span>
            <span className="text-xs text-white/45">+60s penalty</span>
          </button>
          <button onClick={onCheck} className="btn-primary">
            <Check className="h-4 w-4" /> Check solution
          </button>
          <button
            onClick={() => loadPuzzle(puzzleId, grid, cages)}
            className="btn-ghost"
          >
            <RotateCcw className="h-4 w-4" /> Restart
          </button>
        </div>

        <AnimatePresence>
          {status === 'won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-2 border-accent-violet/40"
            >
              <div className="flex items-center gap-2 text-amber-300">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">Puzzle solved</span>
              </div>
              <p className="text-sm text-white/70 mt-2">
                Solve time <span className="font-mono text-white">{formatTime(elapsedSeconds)}</span> · Hints{' '}
                <span className="font-mono text-white">{hintsUsed}</span> · Score{' '}
                <span className="font-mono text-accent-glow">{displaySeconds}</span>
              </p>

              {currentUser && resultSaved && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="text-sm text-white/70 mb-2">Rate this puzzle</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        className="p-1"
                      >
                        <Star className={`h-5 w-5 ${n <= rating ? 'fill-amber-300 text-amber-300' : 'text-white/30'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    {(['too_easy', 'fits', 'too_hard'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFeedback(f)}
                        className={`px-2.5 py-1 rounded-md border ${
                          feedback === f
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'border-white/10 text-white/65 hover:text-white'
                        }`}
                      >
                        {f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <button onClick={submitRating} disabled={rating === 0} className="btn-primary text-sm mt-3 w-full">
                    Submit rating
                  </button>
                </div>
              )}
              {!currentUser && (
                <p className="text-xs text-white/55 mt-3">
                  Sign in to save your time to the leaderboard.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
