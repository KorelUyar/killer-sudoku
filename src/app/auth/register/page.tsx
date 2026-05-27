'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        const message = data.issues
          ? Object.values(data.issues).flat().join(' • ')
          : data.error ?? 'Registration failed';
        toast.error(message);
        return;
      }
      queryClient.setQueryData(['me'], { user: data.user });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success(`Welcome, ${data.user.username}! 👋`);
      router.refresh();
      router.push('/play');
    });
  };

  return (
    <div className="mx-auto max-w-md px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-accent-glow" /> Create account
        </h1>
        <p className="text-white/60 text-sm mb-6">Track your scores and save your puzzles.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="u" className="text-sm text-white/75 mb-1 block">Username</label>
            <input id="u" className="input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" />
            <p className="text-xs text-white/45 mt-1">3–20 chars: letters, digits, or underscore.</p>
          </div>
          <div>
            <label htmlFor="e" className="text-sm text-white/75 mb-1 block">Email</label>
            <input id="e" type="email" className="input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="p" className="text-sm text-white/75 mb-1 block">Password</label>
            <input id="p" type="password" className="input" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <p className="text-xs text-white/45 mt-1">At least 8 chars with a letter and a digit.</p>
          </div>
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-white/60 mt-6">
          Already have one?{' '}
          <Link href="/auth/login" className="text-accent-glow hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
