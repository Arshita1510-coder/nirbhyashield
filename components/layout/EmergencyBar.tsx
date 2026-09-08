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
    <div className="bg-rose-600 border-b border-rose-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-between shadow-lg animate-pulse">
      <div className="flex items-center gap-3">
        <Radio className="w-5 h-5 text-white animate-spin" />
        <div>
          <span className="font-bold uppercase tracking-wider">EMERGENCY SOS ACTIVE:</span> Live GPS Broadcast & Audio Vault Recording via Supabase Realtime!
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/sos"
          className="bg-white text-rose-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-rose-50 transition-colors flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          View Active Dispatch
        </Link>
        <button
          onClick={() => nirbhayaStore.resolveSOS(session.id, 'resolved')}
          className="bg-rose-950/80 text-rose-100 hover:bg-rose-900 border border-rose-400 px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark Safe
        </button>
      </div>
    </div>
  );
}
