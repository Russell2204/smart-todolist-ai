import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart ToDoList | AI-приоритезация с Google Gemini',
  description: 'Умный список задач с автоматической категоризацией, матрицей Эйзенхауэра и декомпозицией на базе Google Gemini 2.5 Flash',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased min-h-screen selection:bg-violet-500/20 selection:text-violet-700 dark:selection:text-violet-300">
        {children}
      </body>
    </html>
  );
}
