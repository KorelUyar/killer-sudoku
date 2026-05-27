'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, PlusSquare, Calendar, Trophy, BarChart3, BookOpen, LogIn, LogOut, UserPlus, Settings, ChevronDown, Github, Camera, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GITHUB_URL } from '@/lib/constants';
import { LogoMark } from './Logo';
import { Avatar } from './Avatar';

interface User { id: number; username: string; email: string; avatarUrl?: string | null }

const navLinks = [
  { href: '/play', label: 'Play', icon: Grid3X3 },
  { href: '/create', label: 'Create', icon: PlusSquare, requiresAuth: true },
  { href: '/daily', label: 'Daily', icon: Calendar },
  { href: '/leaderboard', label: 'Trophy', icon: Trophy },
  { href: '/stats', label: 'Stats', icon: BarChart3, requiresAuth: true },
  { href: '/rules', label: 'Rules', icon: BookOpen },
];

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

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large (max 2 MB)');
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append('avatar', file);
    try {
      const r = await fetch('/api/auth/avatar', { method: 'POST', body: form });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? 'Upload failed');
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Avatar updated');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onAvatarRemove = async () => {
    const r = await fetch('/api/auth/avatar', { method: 'DELETE' });
    if (!r.ok) {
      toast.error('Remove failed');
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    toast.success('Avatar removed');
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
            <LogoMark size={16} className="group-hover:opacity-80 transition-opacity" />
            <span className="font-semibold tracking-tight text-[15px]">
              <span style={{ color: '#a78bfa' }}>Killer</span>{' '}
              <span style={{ color: '#f4f4f5' }}>Sudoku</span>
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
                  <Avatar user={user} size={28} />
                  <span className="hidden sm:inline text-sm text-[#f4f4f5] max-w-[140px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-[#a1a1aa] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onAvatarChange}
                  className="hidden"
                />
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      role="menu"
                      className="absolute right-0 mt-2 w-64 rounded-xl py-1.5 text-sm z-50"
                      style={{
                        backgroundColor: '#1a1a1f',
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div className="px-4 py-4 border-b border-white/[0.06]">
                        <div className="relative w-16 h-16 mx-auto group">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="block w-full h-full"
                            aria-label="Change avatar"
                          >
                            <Avatar user={user} size={64} />
                            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                            {uploading && (
                              <div className="absolute inset-0 rounded-full bg-black/80 flex items-center justify-center text-xs">
                                ...
                              </div>
                            )}
                          </button>
                        </div>
                        <div className="text-center mt-3">
                          <p className="font-medium text-[#f4f4f5] truncate">{user.username}</p>
                          <p className="text-xs text-[#a1a1aa] truncate">{user.email}</p>
                        </div>
                        {user.avatarUrl && (
                          <button
                            onClick={onAvatarRemove}
                            className="text-xs text-[#a1a1aa] hover:text-[#f43f5e] mt-2 mx-auto flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Remove photo
                          </button>
                        )}
                      </div>
                      <Link href="/stats" role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] text-[#f4f4f5]">
                        <BarChart3 className="h-4 w-4 text-[#a1a1aa]" /> My stats
                      </Link>
                      <Link href="/create" role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] text-[#f4f4f5]">
                        <PlusSquare className="h-4 w-4 text-[#a1a1aa]" /> Create a puzzle
                      </Link>
                      <Link href="/play" role="menuitem" className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] text-[#f4f4f5]">
                        <Settings className="h-4 w-4 text-[#a1a1aa]" /> Browse puzzles
                      </Link>
                      <button
                        onClick={onLogout}
                        disabled={pending}
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#f43f5e]/10 text-[#f43f5e] w-full text-left"
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
