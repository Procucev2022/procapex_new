import type { Metadata } from 'next';
import './globals.css';
import { ProcurementProvider } from '../context/ProcurementContext';

export const metadata: Metadata = {
  title: 'ProCPX – Procurement & AI Cost Intelligence Platform',
  description: 'Enterprise source-to-award procurement platform with AI-assisted BOQ generation, 4-way commercial checks, and automated Work Orders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen">
        <ProcurementProvider>
          {children}
        </ProcurementProvider>
      </body>
    </html>
  );
}
