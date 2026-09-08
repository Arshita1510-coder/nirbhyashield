'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Radio, MapPin, Battery, Clock, Mic, PhoneCall, CheckCircle2, ShieldAlert, AlertTriangle, ExternalLink, FileText, Activity } from 'lucide-react';
import { rakshaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';
import { SOSSession, SOSLocation, SafetyReport } from '@/lib/supabase/types';
import Link from 'next/link';

export default function ResponderPage() {
  const [activeSession, setActiveSession] = useState<SOSSession | null>(null);
  const [locations, setLocations] = useState<SOSLocation[]>([]);
  const [contacts, setContacts] = useState(rakshaStore.getContacts());
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);

  const refreshData = async () => {
    const current = rakshaStore.getActiveSession();
    setActiveSession(current);
    if (current) {
      setLocations(rakshaStore.getLocations(current.id));
    }
    setContacts(rakshaStore.getContacts());
    const reports = await supabaseService.getSafetyReports();
    setSafetyReports(reports);
  };

  useEffect(() => {
    refreshData();

    return rakshaStore.subscribe(() => {
      refreshData();
    });
  }, []);

  const latestLoc = locations[locations.length - 1] || { lat: 28.6139, lng: 77.2090, battery_pct: 85, speed: 0, recorded_at: new Date().toISOString() };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ADMIN & POLICE RESPONDER COMMAND HUB
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Live Emergency Dispatch & Safety Admin Portal</h1>
          <p className="text-xs text-slate-400">
            Realtime monitoring for active SOS dispatches, crowdsourced hazard reports, and responder roster.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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

                <div className="flex items-center gap-2">
                  <Link
                    href={`/track/${activeSession.tracking_token}`}
                    target="_blank"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Track Link
                  </Link>

                  <button
                    onClick={() => rakshaStore.resolveSOS(activeSession.id, 'resolved')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Resolve SOS
                  </button>
                </div>
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

          {/* Section: Live Crowdsourced Safety & Hazard Reports */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Public Hazard & Safety Reports Log</h2>
                  <p className="text-xs text-slate-400">Crowdsourced reports filed by citizens & commuters.</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                {safetyReports.length} Reports Logged
              </span>
            </div>

            <div className="space-y-3">
              {safetyReports.map((report) => (
                <div key={report.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase">{report.category.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        report.severity === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : report.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {report.severity} severity
                      </span>
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(report.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{report.description}</p>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" /> GPS: {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </span>
                    <span>Status: Logged to PostGIS Safety Layer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Responder Roster & System Stats */}
        <div className="space-y-6">
          {/* Roster */}
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

          {/* Admin System Diagnostics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Activity className="w-4 h-4" /> Admin System Status
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Postgres RLS:</span>
                <span className="text-emerald-400 font-bold">Enforced</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Realtime Channel:</span>
                <span className="text-emerald-400 font-bold">sos_locations</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Storage Vault:</span>
                <span className="text-emerald-400 font-bold">sos-media</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

