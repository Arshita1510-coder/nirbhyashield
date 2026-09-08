'use client';

import React, { useState, useEffect } from 'react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { SOSSession } from '@/lib/supabase/types';
import Link from 'next/link';
import { AlertCircle, Radio, CheckCircle2 } from 'lucide-react';

export default function EmergencyBar() {
  const [session, setSession] = useState<SOSSession | null>(null);

  useEffect(() => {
    setSession(nirbhayaStore.getActiveSession());
    return nirbhayaStore.subscribe(() => {
      setSession(nirbhayaStore.getActiveSession());
    });
  }, []);

  if (!session || session.status !== 'active') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 border-b border-rose-500/50 text-white shadow-xl">
      <div className="w-full pl-1 pr-4 sm:pr-6 lg:pr-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0"></span>
          <div className="truncate">
            <span className="font-extrabold uppercase tracking-wider text-rose-100">EMERGENCY SOS ACTIVE:</span> Realtime GPS Breadcrumbs & Audio Stream Active
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/sos"
            className="bg-white text-rose-700 hover:bg-rose-50 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Active Dispatch
          </Link>
          <button
            onClick={() => nirbhayaStore.resolveSOS(session.id, 'resolved')}
            className="bg-rose-950/80 hover:bg-rose-900 text-white border border-rose-400/40 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Mark Safe
          </button>
        </div>
      </div>
    </div>
  );
}
