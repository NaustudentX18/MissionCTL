import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MissionCTL — AI Command Center',
  description: 'Mission control for your entire AI stack. Monitor costs, compare models, manage API keys across Claude, OpenAI, Gemini, Groq, Mistral, DeepSeek, and 10+ more providers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#050508]">
        {children}
      </body>
    </html>
  );
}
