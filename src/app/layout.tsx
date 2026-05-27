import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/shared/Navbar';
import { AuroraBackground } from '@/components/shared/AuroraBackground';
import { QueryProvider } from '@/components/shared/QueryProvider';
import { SoundProvider } from '@/components/shared/SoundProvider';
import { Footer } from '@/components/shared/Footer';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Killer Sudoku — Skills Battle 2026',
  description: 'A modern Killer Sudoku web app: solve, create, and climb the leaderboard.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuroraBackground />
        <QueryProvider>
          <SoundProvider>
            <Navbar initialUser={user} />
            <main className="relative z-10 min-h-screen pt-20 pb-16">{children}</main>
            <Footer />
            <Toaster
              position="bottom-right"
              richColors
              toastOptions={{
                style: {
                  background: 'rgba(11,10,23,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f5f5fa',
                },
              }}
            />
          </SoundProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
