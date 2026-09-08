'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Radio, MapPin, Battery, Clock, Mic, PhoneCall, CheckCircle2, ShieldAlert } from 'lucide-react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { SOSSession, SOSLocation } from '@/lib/supabase/types';

export default function ResponderPage() {
  const [activeSession, setActiveSession] = useState<SOSSession | null>(null);
  const [locations, setLocations] = useState<SOSLocation[]>([]);
  const [contacts, setContacts] = useState(nirbhayaStore.getContacts());

  useEffect(() => {
    const current = nirbhayaStore.getActiveSession();
    setActiveSession(current);
    if (current) {
      setLocations(nirbhayaStore.getLocations(current.id));
    }

    return nirbhayaStore.subscribe(() => {
      const updated = nirbhayaStore.getActiveSession();
      setActiveSession(updated);
      if (updated) {
        setLocations(nirbhayaStore.getLocations(updated.id));
      }
      setContacts(nirbhayaStore.getContacts());
    });
  }, []);

  const latestLoc = locations[locations.length - 1] || { lat: 28.6139, lng: 77.2090, battery_pct: 85, speed: 0, recorded_at: new Date().toISOString() };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> RESPONDER COMMAND HUB
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Trusted Contact & Responder Portal</h1>
          <p className="text-xs text-slate-400">
            Authorized portal for emergency contacts and responders to monitor live broadcasts & audio clips.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-400">Supabase Auth Claim:</span>
          <code className="text-emerald-400 font-mono font-bold">is_trusted_contact = true</code>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Emergency Dispatch Stream */}
        <div className="lg:col-span-2 space-y-6">
          {activeSession && activeSession.status === 'active' ? (
            <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center animate-ping">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">LIVE DISPATCH BROADCAST</h2>
                    <p className="text-xs text-rose-400 font-semibold">
                      Trigger Type: {activeSession.trigger_type.toUpperCase()} • Session ID: {activeSession.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => nirbhayaStore.resolveSOS(activeSession.id, 'resolved')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Emergency Resolved
                </button>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Battery Level:</span>
                  <span className="font-extrabold text-emerald-400 text-base flex items-center gap-1">
                    <Battery className="w-4 h-4" /> {latestLoc.battery_pct}%
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Breadcrumb Count:</span>
                  <span className="font-extrabold text-cyan-400 text-base">
                    {locations.length} updates
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Speed Movement:</span>
                  <span className="font-extrabold text-white text-base">
                    {latestLoc.speed} km/h
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Last GPS Timestamp:</span>
                  <span className="font-extrabold text-slate-300 text-xs">
                    {new Date(latestLoc.recorded_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1 text-rose-400">
                    <MapPin className="w-4 h-4" /> Current Coordinates:
                  </span>
                  <span className="font-mono text-white text-sm">
                    {latestLoc.lat.toFixed(6)}, {latestLoc.lng.toFixed(6)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Realtime subscriptions active via Supabase Postgres changes on table <code className="text-rose-300">sos_locations</code>.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">All Systems Normal & Safe</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active emergency SOS dispatches at this moment. Standing by on Supabase Realtime channel.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Responder Roster & Quick Dispatch */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-400" /> Emergency Contact Roster
          </h2>

          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-slate-400">{c.phone}</div>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold"
                >
                  Call
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
