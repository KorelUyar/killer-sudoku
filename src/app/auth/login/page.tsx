'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? 'Login failed');
        return;
      }
      // Push the new ['me'] into the cache so the Navbar updates *before* navigation.
      queryClient.setQueryData(['me'], { user: data.user });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success(`Welcome back, ${data.user.username}! 👋`);
      router.refresh();
      router.push('/play');
    });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2" style={{ color: '#f4f4f5' }}>
          <LogIn className="h-5 w-5" style={{ color: '#a78bfa' }} /> Sign in
        </h1>
        <p className="text-sm mb-6" style={{ color: '#a1a1aa' }}>Welcome back to Killer Sudoku.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="u" className="text-sm mb-1 block" style={{ color: '#a1a1aa' }}>Username</label>
            <input
              id="u"
              className="input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="p" className="text-sm mb-1 block" style={{ color: '#a1a1aa' }}>Password</label>
            <input
              id="p"
              type="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm mt-6" style={{ color: '#a1a1aa' }}>
          New here?{' '}
          <Link href="/auth/register" className="hover:underline" style={{ color: '#a78bfa' }}>
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
