// 3×3 dot-grid monogram — geometric, not literal. Replaces the ✨ sparkle.
export function LogoMark({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid grid-cols-3 gap-[2px] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-full" style={{ backgroundColor: '#a78bfa' }} />
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
