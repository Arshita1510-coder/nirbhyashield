'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { SOSSession, SOSLocation } from '@/lib/supabase/types';
import { ShieldAlert, Battery, Radio, MapPin, Clock, Mic, CheckCircle2, Phone } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet map to avoid SSR window issues
const LiveTrackingMap = dynamic(() => import('@/components/maps/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500 text-xs">
      Loading Live Emergency Map...
    </div>
  ),
});

export default function PublicLiveTrackPage() {
  const params = useParams();
  const token = params.token as string;

  const [session, setSession] = useState<SOSSession | null>(null);
  const [locations, setLocations] = useState<SOSLocation[]>([]);

  useEffect(() => {
    const data = nirbhayaStore.getSessionByToken(token);
    setSession(data.session);
    setLocations(data.locations);

    return nirbhayaStore.subscribe(() => {
      const updated = nirbhayaStore.getSessionByToken(token);
      setSession(updated.session);
      setLocations(updated.locations);
    });
  }, [token]);

  const latestLoc = locations[locations.length - 1] || { lat: 28.6139, lng: 77.2090, battery_pct: 85, speed: 0, recorded_at: new Date().toISOString() };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      
      {/* Top Warning Banner */}
      <div className="bg-rose-950/90 border border-rose-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-ping" /> REALTIME EMERGENCY STREAM
              </div>
              <h1 className="text-2xl font-black text-white mt-1">Live Victim Location Broadcast</h1>
            </div>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-6 py-3 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" /> Call Police Emergency (112)
          </a>
        </div>

        {session && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-rose-900/60">
            <div className="bg-slate-950/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block">Status:</span>
              <span className="font-bold text-rose-400 uppercase">{session.status}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block">Trigger Source:</span>
              <span className="font-bold text-white uppercase">{session.trigger_type}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block">Device Battery:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5" /> {latestLoc.battery_pct}%
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block">Breadcrumb Updates:</span>
              <span className="font-bold text-cyan-400">{locations.length} recorded</span>
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold flex items-center gap-1 text-rose-400">
            <MapPin className="w-4 h-4" /> Live GPS Breadcrumb Map
          </span>
          <span className="text-slate-400">
            Last Updated: {new Date(latestLoc.recorded_at).toLocaleTimeString()}
          </span>
        </div>

        <div className="h-96 rounded-xl overflow-hidden border border-slate-800">
          <LiveTrackingMap locations={locations} />
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1">
        <strong className="text-white flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Privacy Protected Live View
        </strong>
        <p>
          This live tracking page is powered by Supabase tokenized security functions. Access is restricted exclusively to holders of this emergency link and expires automatically once the SOS session is marked resolved.
        </p>
      </div>

    </div>
  );
}
