'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Lightbulb,
  Check,
  RotateCcw,
  Trophy,
  Star,
  Volume2,
  VolumeX,
  X,
  CircleX,
  Share2,
  Link as LinkIcon,
  Copy,
  Loader2,
  Check as CheckIcon,
} from 'lucide-react';
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
  /** Set to true when this board is used inside the Daily page so we invalidate the daily LB after solve. */
  isDaily?: boolean;
}

const diffLabel = ['', 'Easy', 'Medium', 'Hard'];

export function SolveBoard({ puzzleId, difficulty, creator, grid, cages, currentUser, isDaily = false }: Props) {
  const loadPuzzle = useGameStore((s) => s.loadPuzzle);
  const board = useGameStore((s) => s.grid);
  const setConflicts = useGameStore((s) => s.setConflicts);
  const clearConflicts = useGameStore((s) => s.clearConflicts);
  const applyHint = useGameStore((s) => s.applyHint);
  const revealSolution = useGameStore((s) => s.revealSolution);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const displaySeconds = useGameStore((s) => s.displaySeconds);
  const emptyCellCount = useGameStore((s) => s.emptyCellCount);
  const status = useGameStore((s) => s.status);
  const win = useGameStore((s) => s.win);

  const { play, enabled, setEnabled } = useSound();
  const queryClient = useQueryClient();

  const [resultSaved, setResultSaved] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<'too_easy' | 'fits' | 'too_hard'>('fits');
  const [ratingState, setRatingState] = useState<'idle' | 'submitting' | 'saved'>('idle');
  const [savedStars, setSavedStars] = useState<number>(0);
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const hintsRemaining = Math.max(0, emptyCellCount - hintsUsed);
  const hintsDisabled = hintsRemaining <= 0 || status !== 'playing';
  const gaveUp = status === 'gave_up';
  const won = status === 'won';

  useEffect(() => {
    loadPuzzle(puzzleId, grid, cages);
    setResultSaved(false);
    setRating(0);
    setFeedback('fits');
    setRatingState('idle');
    setSavedStars(0);
    setConfirmGiveUp(false);
    setShareOpen(false);
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
        if (post.ok) {
          setResultSaved(true);
          // Refresh leaderboards & stats
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          if (isDaily) queryClient.invalidateQueries({ queryKey: ['daily-lb'] });
        }
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
    if (hintsDisabled) return;
    const r = await fetch(`/api/puzzles/${puzzleId}/hint`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ grid: board, hintsUsed }),
    });
    const data = await r.json();
    if (!r.ok) {
      toast.error(data.error ?? 'Hint failed');
      return;
    }
    if (!data.hint) {
      toast.success('No hint needed — your grid looks correct!');
      return;
    }
    applyHint(data.hint.row, data.hint.col, data.hint.value);
    play('hint');
  }

  async function onGiveUp() {
    setConfirmGiveUp(false);
    const r = await fetch(`/api/puzzles/${puzzleId}/solution`);
    const data = await r.json();
    if (!r.ok || !data.solved) {
      toast.error(data.error ?? 'Could not reveal the solution');
      return;
    }
    revealSolution(data.solved as Grid);
    play('error');
    toast.message('Solution revealed', { description: 'Better luck next time!' });
  }

  async function submitRating() {
    if (!currentUser || !resultSaved || rating === 0 || ratingState !== 'idle') return;
    setRatingState('submitting');
    try {
      const r = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ puzzleId, stars: rating, difficultyFeedback: feedback }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? 'Failed to save rating');
        setRatingState('idle');
        return;
      }
      setSavedStars(rating);
      setRatingState('saved');
      toast.success('Thanks for rating!');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to save rating, please try again.');
      setRatingState('idle');
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/play/${puzzleId}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
  }

  function copyShareText() {
    const url = `${window.location.origin}/play/${puzzleId}`;
    const text = `I just solved Killer Sudoku #${puzzleId} in ${formatTime(elapsedSeconds)} with ${hintsUsed} hints 🎯
Score: ${displaySeconds}
Try it: ${url}`;
    navigator.clipboard.writeText(text).then(() => toast.success('Text copied to clipboard!'));
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-16 grid lg:grid-cols-[1fr_auto] gap-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: '#a1a1aa' }}>
              Puzzle #{puzzleId} · by {creator}
            </div>
            <div className="text-lg font-medium mt-1" style={{ color: '#f4f4f5' }}>
              {diffLabel[difficulty]} cages
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Timer />
            <span className="text-sm" style={{ color: '#a1a1aa' }}>
              Hints: <span className="font-mono" style={{ color: '#a78bfa' }}>{hintsUsed}</span>
              {emptyCellCount > 0 && <span className="text-[#52525b]"> / {emptyCellCount}</span>}
            </span>
            <button
              aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
              onClick={() => setEnabled(!enabled)}
              className="p-2 rounded-lg hover:bg-white/[0.04] text-[#a1a1aa] hover:text-[#f4f4f5]"
            >
              {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <SudokuGrid cages={cages} />
      </div>

      <div className="flex flex-col gap-4 w-full lg:w-80">
        <NumberPad />
        <div className="panel p-4 flex flex-col gap-2">
          <button
            onClick={onHint}
            disabled={hintsDisabled}
            title={hintsRemaining === 0 ? 'Max hints reached' : undefined}
            className="btn-ghost justify-between disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" style={{ color: '#f59e0b' }} /> Hint
            </span>
            <span className="text-xs" style={{ color: '#52525b' }}>
              {hintsRemaining > 0 ? '+60s penalty' : 'Max reached'}
            </span>
          </button>
          <button onClick={onCheck} className="btn-primary" disabled={gaveUp}>
            <Check className="h-4 w-4" /> Check solution
          </button>
          <button onClick={() => loadPuzzle(puzzleId, grid, cages)} className="btn-ghost">
            <RotateCcw className="h-4 w-4" /> Restart
          </button>
          {!won && !gaveUp && (
            <button onClick={() => setConfirmGiveUp(true)} className="btn-danger">
              <CircleX className="h-4 w-4" /> Give up
            </button>
          )}
        </div>

        {gaveUp && (
          <div className="panel p-4">
            <p className="text-sm" style={{ color: '#a1a1aa' }}>
              You gave up. The solution is shown in rose. This run wasn&apos;t saved.
            </p>
          </div>
        )}

        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-5"
              style={{ borderColor: 'rgba(167, 139, 250, 0.35)' }}
            >
              <div className="flex items-center gap-2" style={{ color: '#fcd34d' }}>
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">Puzzle solved</span>
              </div>
              <p className="text-sm mt-2" style={{ color: '#a1a1aa' }}>
                Solve time <span className="font-mono" style={{ color: '#f4f4f5' }}>{formatTime(elapsedSeconds)}</span> · Hints{' '}
                <span className="font-mono" style={{ color: '#f4f4f5' }}>{hintsUsed}</span> · Score{' '}
                <span className="font-mono" style={{ color: '#a78bfa' }}>{displaySeconds}</span>
              </p>

              {currentUser && resultSaved && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-sm mb-2" style={{ color: '#a1a1aa' }}>Rate this puzzle</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = ratingState === 'saved' ? n <= savedStars : n <= rating;
                      const color = ratingState === 'saved' ? '#fcd34d' : filled ? '#a78bfa' : '#3f3f46';
                      return (
                        <button
                          key={n}
                          onClick={() => ratingState === 'idle' && setRating(n)}
                          disabled={ratingState !== 'idle'}
                          aria-label={`${n} star${n > 1 ? 's' : ''}`}
                          className="p-1 disabled:cursor-default"
                        >
                          <Star
                            className="h-5 w-5"
                            style={{ color, fill: filled ? color : 'transparent' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    {(['too_easy', 'fits', 'too_hard'] as const).map((f) => {
                      const selected = ratingState === 'saved' ? false : feedback === f;
                      return (
                        <button
                          key={f}
                          onClick={() => ratingState === 'idle' && setFeedback(f)}
                          disabled={ratingState !== 'idle'}
                          className={`px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50 ${
                            selected
                              ? 'bg-white/[0.06] border-white/25 text-[#f4f4f5]'
                              : 'border-white/[0.10] text-[#a1a1aa] hover:text-[#f4f4f5]'
                          }`}
                        >
                          {f.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={submitRating}
                    disabled={rating === 0 || ratingState !== 'idle'}
                    className={`text-sm mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      ratingState === 'saved'
                        ? 'cursor-default'
                        : 'btn-primary'
                    }`}
                    style={
                      ratingState === 'saved'
                        ? { backgroundColor: '#10b981', color: '#0a0a0b' }
                        : undefined
                    }
                  >
                    {ratingState === 'submitting' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                      </>
                    ) : ratingState === 'saved' ? (
                      <>
                        <CheckIcon className="h-4 w-4" /> Rated
                      </>
                    ) : (
                      'Submit rating'
                    )}
                  </button>
                </div>
              )}

              {currentUser && resultSaved && (
                <button
                  onClick={() => setShareOpen(true)}
                  className="btn-ghost w-full mt-3"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              )}

              {!currentUser && (
                <p className="text-xs mt-3" style={{ color: '#52525b' }}>
                  Sign in to save your time to the leaderboard.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmGiveUp && (
          <ConfirmDialog
            title="Give up on this puzzle?"
            description="We'll show you the solution. This won't be saved to your stats or the leaderboard."
            confirmLabel="Yes, show solution"
            onConfirm={onGiveUp}
            onCancel={() => setConfirmGiveUp(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareOpen && (
          <ShareModal
            onClose={() => setShareOpen(false)}
            onCopyLink={() => { copyShareLink(); setShareOpen(false); }}
            onCopyText={() => { copyShareText(); setShareOpen(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 6 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-xl"
        style={{
          backgroundColor: '#1a1a1f',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <h3 className="text-lg font-semibold" style={{ color: '#f4f4f5' }}>{title}</h3>
        <p className="text-sm mt-2" style={{ color: '#a1a1aa' }}>{description}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            className="text-sm inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#f43f5e', color: '#0a0a0b' }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareModal({ onClose, onCopyLink, onCopyText }: {
  onClose: () => void;
  onCopyLink: () => void;
  onCopyText: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 6 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 6 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-xl"
        style={{
          backgroundColor: '#1a1a1f',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: '#f4f4f5' }}>Share this solve</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/[0.06] rounded">
            <X className="h-4 w-4" style={{ color: '#a1a1aa' }} />
          </button>
        </div>
        <div className="mt-5 grid gap-2">
          <button onClick={onCopyLink} className="btn-ghost justify-start">
            <LinkIcon className="h-4 w-4" /> Copy link
          </button>
          <button onClick={onCopyText} className="btn-ghost justify-start">
            <Copy className="h-4 w-4" /> Copy as text
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
