import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VigourAI - Dein KI Fitness Coach',
  description: 'Personalisierte Trainingspläne ohne Stress - Direkt im Browser.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
