import Link from 'next/link';
import { Github } from 'lucide-react';
import { AUTHOR, GITHUB_URL, PROJECT_TAGLINE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-12 py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/55">
        <p>
          Made by <span className="text-white/75">{AUTHOR}</span> · {PROJECT_TAGLINE}
        </p>
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 hover:text-white/85 transition-colors"
        >
          <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>View on GitHub</span>
        </Link>
      </div>
    </footer>
  );
}
