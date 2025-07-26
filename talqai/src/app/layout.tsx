import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI-Powered Multimodal Assistant',
  description: 'A multimodal AI assistant with voice, text, and image capabilities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
