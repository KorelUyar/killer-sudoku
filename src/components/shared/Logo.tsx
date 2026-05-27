// 3×3 dot-grid monogram — two-tone (5 inner-cross dots violet, 4 corners cyan).
// Geometric, not literal — replaces the ✨ sparkle.
export function LogoMark({ size = 16, className = '' }: { size?: number; className?: string }) {
  // Indices: 0 1 2
  //          3 4 5
  //          6 7 8
  // Corners = 0, 2, 6, 8 → cyan
  // Cross (top, left, center, right, bottom) = 1, 3, 4, 5, 7 → violet
  const CORNERS = new Set([0, 2, 6, 8]);
  return (
    <div
      className={`grid grid-cols-3 gap-[2px] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{ backgroundColor: CORNERS.has(i) ? '#22d3ee' : '#a78bfa' }}
        />
      ))}
    </div>
  );
}

export function LogoWordmark({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <LogoMark size={size} />
      <span>
        <span style={{ color: '#a78bfa' }}>Killer</span>{' '}
        <span style={{ color: '#f4f4f5' }}>Sudoku</span>
      </span>
    </span>
  );
}
