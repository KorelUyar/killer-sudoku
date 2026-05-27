'use client';
import { useMemo, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, RotateCcw, Wand2, Pencil, Dice5, Sparkles, Loader2 } from 'lucide-react';
import { cageColor } from '@/lib/utils';
import type { Cage } from '@/lib/types';

const EMPTY_GRID: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

function adjacent([r, c]: [number, number]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < 8) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < 8) out.push([r, c + 1]);
  return out;
}

export function PuzzleBuilder() {
  const router = useRouter();
  const [cages, setCages] = useState<Cage[]>([]);
  const [drafting, setDrafting] = useState<Array<[number, number]>>([]);
  const [draftSum, setDraftSum] = useState<string>('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [pending, startTransition] = useTransition();
  const [nextId, setNextId] = useState(1);
  const [mode, setMode] = useState<'manual' | 'random'>('manual');
  const [generating, setGenerating] = useState(false);

  const cellToCage = useMemo(() => {
    const m: Array<Array<{ cageId: number; sum: number } | null>> = Array.from({ length: 9 }, () => Array(9).fill(null));
    cages.forEach((cg) => cg.cells.forEach(([r, c]) => (m[r][c] = { cageId: cg.id, sum: cg.sum })));
    return m;
  }, [cages]);

  const draftSet = useMemo(() => new Set(drafting.map(([r, c]) => `${r},${c}`)), [drafting]);
  const coverage = useMemo(() => cages.reduce((sum, c) => sum + c.cells.length, 0), [cages]);
  const cageSumTotal = useMemo(() => cages.reduce((s, c) => s + c.sum, 0), [cages]);

  function toggleCell(r: number, c: number) {
    if (cellToCage[r][c]) return; // already in a saved cage
    const key = `${r},${c}`;
    if (draftSet.has(key)) {
      setDrafting((d) => d.filter(([rr, cc]) => !(rr === r && cc === c)));
      return;
    }
    if (drafting.length === 0) {
      setDrafting([[r, c]]);
      return;
    }
    if (drafting.length >= 9) {
      toast.warning('Cages can have at most 9 cells');
      return;
    }
    // Must be adjacent to at least one cell already in drafting
    const isAdjacent = drafting.some(([dr, dc]) => Math.abs(dr - r) + Math.abs(dc - c) === 1);
    if (!isAdjacent) {
      toast.warning('Cage cells must be orthogonally adjacent');
      return;
    }
    setDrafting((d) => [...d, [r, c]]);
  }

  function commitCage() {
    const sum = Number(draftSum);
    if (drafting.length === 0) return toast.error('Pick at least one cell');
    if (!Number.isFinite(sum) || sum < 1 || sum > 45) return toast.error('Sum must be between 1 and 45');
    setCages((cs) => [...cs, { id: nextId, sum, cells: [...drafting] }]);
    setNextId((n) => n + 1);
    setDrafting([]);
    setDraftSum('');
  }

  function deleteCage(id: number) {
    setCages((cs) => cs.filter((c) => c.id !== id));
  }

  function resetAll() {
    setCages([]);
    setDrafting([]);
    setDraftSum('');
    setNextId(1);
  }

  function autoExtendDraft() {
    if (drafting.length === 0) return;
    const used = new Set(drafting.map(([r, c]) => `${r},${c}`));
    for (const [r, c] of drafting) {
      for (const [nr, nc] of adjacent([r, c])) {
        if (cellToCage[nr][nc] || used.has(`${nr},${nc}`)) continue;
        setDrafting((d) => [...d, [nr, nc]]);
        return;
      }
    }
    toast.info('No free adjacent cell.');
  }

  async function savePuzzle() {
    if (coverage !== 81) return toast.error(`Cover all 81 cells (currently ${coverage}/81)`);
    if (cageSumTotal !== 405) return toast.error(`Cage sums must total 405 (currently ${cageSumTotal})`);
    startTransition(async () => {
      const r = await fetch('/api/puzzles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ difficulty, grid: EMPTY_GRID, cages }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? 'Save failed');
        return;
      }
      toast.success(`Puzzle #${data.puzzleId} saved!`);
      router.push(`/play/${data.puzzleId}`);
    });
  }

  async function generateRandom() {
    setGenerating(true);
    try {
      const r = await fetch('/api/puzzles/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? 'Generation failed');
        return;
      }
      const generated: Cage[] = (data.cages as Cage[]).map((c) => ({
        ...c,
        cells: c.cells as Array<[number, number]>,
      }));
      setCages(generated);
      setDrafting([]);
      setDraftSum('');
      const maxId = generated.reduce((m, c) => Math.max(m, c.id), 0);
      setNextId(maxId + 1);
      toast.success('Random puzzle generated. Review, then Save.');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-[1fr_auto] gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create a puzzle</h1>
        <p className="text-white/65 mt-1">
          Tap cells to build a cage, set its sum, and add it. Cover all 81 cells with cages whose
          sums total <span className="font-mono text-accent-glow">405</span>.
        </p>

        <div className="mt-5 inline-flex rounded-xl glass p-1 text-sm">
          <button
            onClick={() => setMode('manual')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'manual' ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white'
            }`}
            aria-pressed={mode === 'manual'}
          >
            <Pencil className="h-4 w-4" /> Build manually
          </button>
          <button
            onClick={() => setMode('random')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'random' ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white'
            }`}
            aria-pressed={mode === 'random'}
          >
            <Dice5 className="h-4 w-4" /> Generate random
          </button>
        </div>

        <div className="sudoku-grid mt-6">
          {EMPTY_GRID.flatMap((row, r) =>
            row.map((_, c) => {
              const ci = cellToCage[r][c];
              const isDrafting = draftSet.has(`${r},${c}`);
              const isFirst = isDrafting && drafting[0]?.[0] === r && drafting[0]?.[1] === c;
              const showFirstSaved =
                ci && cages.find((cg) => cg.id === ci.cageId)?.cells.sort(([a, b], [d, e]) => a - d || b - e)[0].join(',') === `${r},${c}`;
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => toggleCell(r, c)}
                  className={`sudoku-cell ${(c + 1) % 3 === 0 && c !== 8 ? 'border-r-thick' : ''} ${(r + 1) % 3 === 0 && r !== 8 ? 'border-b-thick' : ''}`}
                  style={{
                    background: ci
                      ? `color-mix(in oklab, ${cageColor(ci.cageId)} 22%, transparent)`
                      : isDrafting
                        ? 'rgba(124,58,237,0.35)'
                        : undefined,
                    cursor: 'pointer',
                  }}
                >
                  {showFirstSaved && (
                    <span className="cage-sum" style={{ color: `color-mix(in oklab, ${cageColor(ci!.cageId)} 80%, white 20%)` }}>
                      {ci?.sum}
                    </span>
                  )}
                  {isFirst && draftSum && <span className="cage-sum text-accent-glow">{draftSum}</span>}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="lg:w-80 flex flex-col gap-4">
        {mode === 'random' && (
          <div className="card border-2 border-accent-violet/30">
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-glow" /> Random generator
            </h2>
            <p className="text-xs text-white/55 mb-3">
              Picks cage sizes for the chosen difficulty, then verifies the puzzle has exactly one
              solution. Hard puzzles can take 1–3 seconds.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {([1, 2, 3] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-lg border text-sm transition-colors ${
                    difficulty === d
                      ? 'bg-white/10 border-white/25 text-white'
                      : 'border-white/10 text-white/65 hover:border-white/20'
                  }`}
                >
                  {['Easy', 'Medium', 'Hard'][d - 1]}
                </button>
              ))}
            </div>
            <button onClick={generateRandom} disabled={generating} className="btn-primary w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? 'Generating…' : cages.length > 0 ? 'Regenerate' : 'Generate puzzle'}
            </button>
          </div>
        )}

        <div className="card">
          <h2 className="font-semibold mb-3">Current cage</h2>
          {drafting.length === 0 ? (
            <p className="text-white/55 text-sm">Tap a cell on the grid to start a cage.</p>
          ) : (
            <>
              <div className="text-sm text-white/70 mb-2">{drafting.length} cell{drafting.length > 1 ? 's' : ''} selected</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={45}
                  placeholder="Sum"
                  value={draftSum}
                  onChange={(e) => setDraftSum(e.target.value.replace(/[^0-9]/g, ''))}
                  className="input flex-1"
                />
                <button onClick={autoExtendDraft} className="btn-ghost px-3" title="Extend with first free neighbour" aria-label="Auto-extend">
                  <Wand2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={commitCage} className="btn-primary flex-1">
                  <Plus className="h-4 w-4" /> Add cage
                </button>
                <button onClick={() => setDrafting([])} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Cages ({cages.length})</h2>
          <div className="space-y-1.5 text-sm max-h-48 overflow-y-auto pr-1">
            {cages.length === 0 ? (
              <p className="text-white/55">None yet.</p>
            ) : (
              cages.map((cg) => (
                <div
                  key={cg.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: cageColor(cg.id) }} />
                    <span className="text-white/75">
                      <span className="font-mono">Σ{cg.sum}</span> · {cg.cells.length} cells
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCage(cg.id)}
                    className="p-1 rounded hover:bg-rose-400/15 text-white/55 hover:text-rose-300"
                    aria-label="Delete cage"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 text-xs text-white/55 space-y-0.5">
            <div>Coverage: <span className={`font-mono ${coverage === 81 ? 'text-emerald-300' : 'text-white/80'}`}>{coverage} / 81</span></div>
            <div>Σ cage sums: <span className={`font-mono ${cageSumTotal === 405 ? 'text-emerald-300' : 'text-white/80'}`}>{cageSumTotal} / 405</span></div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Difficulty</h2>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 rounded-lg border transition-colors text-sm ${
                  difficulty === d ? 'bg-white/10 border-white/25 text-white' : 'border-white/10 text-white/65 hover:border-white/20'
                }`}
              >
                {['Easy', 'Medium', 'Hard'][d - 1]}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={savePuzzle}
          disabled={pending}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
        >
          <Save className="h-4 w-4" />
          {pending ? 'Validating…' : 'Save puzzle'}
        </motion.button>
        <button onClick={resetAll} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
}
