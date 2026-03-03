import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'F1 Predictor 2026',
  description: 'Predict F1 qualifying and race results. Compete with friends on the leaderboard.',
  openGraph: {
    title: 'F1 Predictor 2026',
    description: 'Predict F1 qualifying and race results. Compete with friends on the leaderboard.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-gradient-main min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
