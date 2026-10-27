import type { Metadata } from 'next';
import { Oswald, Rubik, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const rubik = Rubik({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-rubik',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'SMART·TODO // AI Task Engine',
  description: 'Тактический список задач с AI-приоритезацией Gemini 2.5 Flash и матрицей Эйзенхауэра',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${rubik.variable} ${oswald.variable} ${jetbrainsMono.variable} font-sans bg-base text-text-primary antialiased min-h-screen selection:bg-accent-amber/20 selection:text-accent-amber`}
      >
        {children}
      </body>
    </html>
  );
}
