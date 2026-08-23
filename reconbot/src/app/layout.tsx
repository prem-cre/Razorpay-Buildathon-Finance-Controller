import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RazorpayX Finance Controller | Multi-Source Autonomous Reconciliation',
  description: 'AI-Powered Multi-Source Financial Reconciliation Engine',
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
        <link href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700' rel='stylesheet' />
        <link href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800' rel='stylesheet' />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
