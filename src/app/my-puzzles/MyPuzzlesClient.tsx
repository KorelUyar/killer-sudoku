'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Trash2, Calendar, Star, Plus, Loader2 } from 'lucide-react';

interface MyPuzzle {
  id: number;
  difficulty: number;
  createdAt: string;
  playCount: number;
  ratingCount: number;
  averageRating: number | null;
}

const DIFF_LABEL = ['', 'Easy', 'Medium', 'Hard'];
const DIFF_BADGE: Record<number, string> = {
  1: 'text-[#86efac] bg-[#86efac]/10 border-[#86efac]/25',
  2: 'text-[#fdba74] bg-[#fdba74]/10 border-[#fdba74]/25',
  3: 'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/25',
};

function formatRelativeDate(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function MyPuzzlesClient() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ puzzles: MyPuzzle[] }>({
    queryKey: ['my-puzzles'],
    queryFn: async () => {
      const r = await fetch('/api/puzzles/mine');
      if (!r.ok) throw new Error('Failed to load');
      return r.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/puzzles/${id}`, { method: 'DELETE' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Failed to delete');
      return data;
    },
    onSuccess: () => {
      toast.success('Puzzle deleted');
      queryClient.invalidateQueries({ queryKey: ['my-puzzles'] });
      queryClient.invalidateQueries({ queryKey: ['puzzles'] });
      setConfirmDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setConfirmDelete(null);
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-24">
        <div className="h-72 panel animate-pulse" />
      </main>
    );
  }

  const puzzles = data?.puzzles ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 pt-24 pb-24">
      <p className="caption">Your creations</p>
      <h1 className="text-5xl font-semibold mt-2 tracking-[-0.025em]" style={{ color: '#f4f4f5' }}>My puzzles</h1>
      <p className="mt-2" style={{ color: '#a1a1aa' }}>
        {puzzles.length === 0
          ? "You haven't created any puzzles yet."
          : `${puzzles.length} ${puzzles.length === 1 ? 'puzzle' : 'puzzles'} you've designed.`}
      </p>

      {puzzles.length === 0 ? (
        <div className="mt-16 text-center py-16">
          <Plus className="w-12 h-12 mx-auto" style={{ color: '#3f3f46' }} />
          <h3 className="text-xl font-medium mt-4" style={{ color: '#f4f4f5' }}>No puzzles yet</h3>
          <p className="mt-2 max-w-md mx-auto" style={{ color: '#a1a1aa' }}>
            Design your first Killer Sudoku. Use the visual cage editor or let the random generator make one for you.
          </p>
          <Link href="/create" className="btn-primary text-sm mt-6 inline-flex">
            Create your first puzzle <Plus className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-12">
          <div
            className="hidden md:grid grid-cols-[64px_92px_1fr_120px_88px_88px_48px] gap-6 px-4 py-2 caption"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span>#</span>
            <span>Difficulty</span>
            <span>Name</span>
            <span>Created</span>
            <span>Plays</span>
            <span>Rating</span>
            <span></span>
          </div>
          {puzzles.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[64px_1fr_48px] md:grid-cols-[64px_92px_1fr_120px_88px_88px_48px] gap-3 md:gap-6 px-4 py-4 items-center border-b transition-colors group hover:bg-white/[0.02]"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="font-mono text-sm" style={{ color: '#52525b' }}>#{p.id}</span>
              <span className="hidden md:inline">
                <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] rounded border font-medium ${DIFF_BADGE[p.difficulty]}`}>
                  {DIFF_LABEL[p.difficulty]}
                </span>
              </span>
              <Link href={`/play/${p.id}`} className="font-medium hover:text-[#22d3ee] transition-colors" style={{ color: '#f4f4f5' }}>
                Puzzle #{p.id}
                <span className="md:hidden block mt-0.5">
                  <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] rounded border font-medium ${DIFF_BADGE[p.difficulty]}`}>
                    {DIFF_LABEL[p.difficulty]}
                  </span>
                </span>
              </Link>
              <span className="hidden md:inline-flex items-center gap-2 text-sm" style={{ color: '#a1a1aa' }}>
                <Calendar className="h-3.5 w-3.5" />
                {formatRelativeDate(typeof p.createdAt === 'string' ? p.createdAt : new Date(p.createdAt).toISOString())}
              </span>
              <span className="hidden md:inline text-sm" style={{ color: '#a1a1aa' }}>
                {p.playCount} {p.playCount === 1 ? 'play' : 'plays'}
              </span>
              <span className="hidden md:inline text-sm" style={{ color: '#a1a1aa' }}>
                {p.averageRating !== null ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} fill="#fbbf24" />
                    {p.averageRating.toFixed(1)}
                  </span>
                ) : (
                  <span style={{ color: '#3f3f46' }}>—</span>
                )}
              </span>
              <button
                onClick={() => setConfirmDelete(p.id)}
                className="p-2 rounded transition-colors hover:bg-[#f43f5e]/10 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Delete puzzle"
                style={{ color: '#a1a1aa' }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => !deleteMutation.isPending && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 6 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-xl"
              style={{
                backgroundColor: '#1a1a23',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: '#f4f4f5' }}>Delete this puzzle?</h3>
              <p className="text-sm mt-2" style={{ color: '#a1a1aa' }}>
                This will permanently delete Puzzle #{confirmDelete}, along with all results and ratings from other players. This cannot be undone.
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleteMutation.isPending}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete !== null && deleteMutation.mutate(confirmDelete)}
                  disabled={deleteMutation.isPending}
                  className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#f43f5e', color: '#0a0a0f' }}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                    </>
                  ) : (
                    'Delete puzzle'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
