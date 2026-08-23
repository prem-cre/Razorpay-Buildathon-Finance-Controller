import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'RazorpayX Finance Controller | Multi-Source Autonomous Reconciliation',
  description: 'AI-Powered Multi-Source Financial Reconciliation Engine',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
