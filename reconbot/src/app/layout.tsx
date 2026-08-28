import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReconBot — Multi-Source Reconciliation',
  description: 'A finance-controller agent that reconciles gateway settlements, bank credits and order records — with a measured match rate and an honest exception list.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' rel='stylesheet' />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
