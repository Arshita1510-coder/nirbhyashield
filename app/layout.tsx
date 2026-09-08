import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import EmergencyBar from '@/components/layout/EmergencyBar';

export const metadata: Metadata = {
  title: 'RakshaShield — Women & Public Safety Platform',
  description: 'Core SOS Alert Engine, Safe Route Recommendation, Transit Safety, and Job/Interview Scam Detection powered by Supabase & PostGIS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <EmergencyBar />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>© 2026 RakshaShield. Built for rapid, consent-driven safety assistance with Supabase & PostGIS.</p>
        </footer>
      </body>
    </html>
  );
}
