import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MissionCTL — AI Command Center',
  description: 'World-class mission control for all your AI subscriptions. Monitor token usage, costs, model news, and more.',
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
