import { BookOpen, Sigma, Hash, Square, Shuffle } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-24">
      <p className="caption">How to play</p>
      <h1 className="text-5xl font-semibold mt-2 tracking-[-0.025em]" style={{ color: '#f4f4f5' }}>
        Killer Sudoku rules
      </h1>
      <p className="mt-3" style={{ color: '#a1a1aa' }}>
        Killer Sudoku combines Sudoku with addition. Every standard Sudoku rule still applies — plus
        a few new ones for the cages.
      </p>

      <ul className="mt-12 space-y-4">
        {[
          {
            icon: Hash,
            title: 'Fill 1–9 in every row',
            body: 'Each of the nine rows must contain the digits 1 to 9 exactly once.',
          },
          {
            icon: Hash,
            title: 'Fill 1–9 in every column',
            body: 'Each column must contain the digits 1 to 9 exactly once.',
          },
          {
            icon: Square,
            title: 'Fill 1–9 in every 3×3 box',
            body: 'Each of the nine 3×3 boxes must contain the digits 1 to 9 exactly once.',
          },
          {
            icon: Sigma,
            title: 'Cage sums must match',
            body:
              'A cage is a group of cells outlined with a dashed border. The small number in the top-left of a cage is the total — the digits inside the cage must add up to exactly that number.',
          },
          {
            icon: Shuffle,
            title: 'No repeats inside a cage',
            body: 'A digit may not appear more than once in the same cage, even if it could otherwise be valid.',
          },
        ].map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.title} className="card flex gap-4">
              <div className="shrink-0">
                <Icon className="h-6 w-6" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#f4f4f5' }}>{r.title}</div>
                <p className="mt-1" style={{ color: '#a1a1aa' }}>{r.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="card mt-10">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#f4f4f5' }}>
          <Sigma className="h-5 w-5" style={{ color: '#fbbf24' }} /> A useful fact
        </h2>
        <p className="mt-2" style={{ color: '#a1a1aa' }}>
          The digits 1 to 9 sum to 45. A solved Sudoku has nine rows each summing to 45, so the
          grand total is <span className="font-mono" style={{ color: '#fbbf24' }}>405</span>. Since cages cover
          every cell exactly once, the cage sums must total 405 too — a quick sanity check before
          you even start solving.
        </p>
      </div>
    </div>
  );
}
