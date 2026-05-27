'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Grid3X3, PlusSquare, Calendar, Trophy, BarChart3, BookOpen, LogIn, LogOut, UserPlus, Settings, ChevronDown, Github } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GITHUB_URL } from '@/lib/constants';

interface User { id: number; username: string; email: string }

const navLinks = [
  { href: '/play', label: 'Play', icon: Grid3X3 },
  { href: '/create', label: 'Create', icon: PlusSquare, requiresAuth: true },
  { href: '/daily', label: 'Daily', icon: Calendar },
  { href: '/leaderboard', label: 'Trophy', icon: Trophy },
  { href: '/stats', label: 'Stats', icon: BarChart3, requiresAuth: true },
  { href: '/rules', label: 'Rules', icon: BookOpen },
];

function initials(name: string): string {
  const parts = name.trim().split(/[\s_-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Navbar({ initialUser }: { initialUser: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ user: User | null }>({
    queryKey: ['me'],
    queryFn: async () => {
      const r = await fetch('/api/auth/me', { cache: 'no-store' });
      return r.json();
    },
    initialData: { user: initialUser },
    staleTime: 30_000,
  });
  const user = data?.user ?? null;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // Close the menu whenever the user navigates somewhere.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const onLogout = () => {
    startTransition(async () => {
      const r = await fetch('/api/auth/logout', { method: 'POST' });
      if (r.ok) {
        toast.success('Signed out');
        await queryClient.invalidateQueries({ queryKey: ['me'] });
        router.refresh();
        router.push('/');
      }
    });
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="glass-strong rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-accent-glow group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 blur-md bg-accent-violet opacity-50 -z-10" />
            </div>
            <span className="font-semibold tracking-tight">
              <span className="text-gradient">Killer</span>{' '}
              <span className="text-white/90">Sudoku</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              const label = link.href === '/leaderboard' ? 'Leaderboard' : link.label;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="hidden sm:inline-flex p-2 rounded-lg hover:bg-white/5 text-white/55 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-glow"
                    style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}
                    aria-hidden
                  >
                    {initials(user.username)}
                  </span>
                  <span className="hidden sm:inline text-sm text-white/85 max-w-[140px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/55 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.14 }}
                      role="menu"
                      className="absolute right-0 mt-2 w-56 glass-strong rounded-xl py-1.5 text-sm shadow-glow"
                    >
                      <div className="px-3 py-2 border-b border-white/5">
                        <div className="text-white/95 font-medium truncate">{user.username}</div>
                        <div className="text-xs text-white/55 truncate">{user.email}</div>
                      </div>
                      <Link
                        href="/stats"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-white/85"
                      >
                        <BarChart3 className="h-4 w-4" /> My stats
                      </Link>
                      <Link
                        href="/create"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-white/85"
                      >
                        <PlusSquare className="h-4 w-4" /> Create a puzzle
                      </Link>
                      <Link
                        href="/play"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-white/85"
                      >
                        <Settings className="h-4 w-4" /> Browse puzzles
                      </Link>
                      <button
                        onClick={onLogout}
                        disabled={pending}
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-rose-400/10 text-rose-200 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm py-1.5">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm py-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
