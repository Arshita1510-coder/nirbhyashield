'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity, AlertTriangle, ArrowLeft, Battery, CheckCircle2, ChevronRight, Clock, Eye,
  MapPin, PhoneCall, Radio, ShieldAlert, ShieldCheck, Users,
} from 'lucide-react';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';
import { rakshaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';
import { SOSLocation, SOSSession, SafetyReport, TrustedContact } from '@/lib/supabase/types';

const cardStyles = {
  active: 'from-rose-500/20 to-rose-950/20 border-rose-500/25 text-rose-400',
  high: 'from-amber-500/20 to-amber-950/20 border-amber-500/25 text-amber-400',
  monitoring: 'from-blue-500/20 to-blue-950/20 border-blue-500/25 text-blue-400',
  resolved: 'from-emerald-500/20 to-emerald-950/20 border-emerald-500/25 text-emerald-400',
};

export default function ResponderPage() {
  const [activeSession, setActiveSession] = useState<SOSSession | null>(null);
  const [locations, setLocations] = useState<SOSLocation[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);

  const refreshData = async () => {
    const current = rakshaStore.getActiveSession();
    setActiveSession(current);
    setLocations(current ? rakshaStore.getLocations(current.id) : []);
    setContacts(rakshaStore.getContacts());
    setSafetyReports(await supabaseService.getSafetyReports());
  };

  useEffect(() => {
    refreshData();
    return rakshaStore.subscribe(refreshData);
  }, []);

  const highRiskCount = safetyReports.filter((report) => report.severity === 'high').length;
  const latestLocation = locations.at(-1);
  const activeCount = activeSession?.status === 'active' ? 1 : 0;
  const statusCards = [
    { label: 'Active Alerts', value: activeCount, detail: activeCount ? 'Needs attention' : 'Standing by', icon: Radio, style: cardStyles.active },
    { label: 'High Risk Cases', value: highRiskCount, detail: 'Requires response', icon: AlertTriangle, style: cardStyles.high },
    { label: 'Monitoring Cases', value: safetyReports.length, detail: 'Being tracked', icon: Eye, style: cardStyles.monitoring },
    { label: 'Resolved Cases', value: activeSession?.status === 'resolved' ? 1 : 0, detail: 'This session', icon: CheckCircle2, style: cardStyles.resolved },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> ADMIN & POLICE RESPONDER COMMAND HUB
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Live Emergency Dispatch & Safety Admin Portal</h1>
          <p className="text-xs text-slate-400">
            Realtime monitoring for active SOS dispatches, crowdsourced hazard reports, and responder roster.
          </p>
        </div>

        <Link
          href="/"
          className="self-start md:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-300 transition-all hover:text-white shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          Back to Overview
        </Link>
      </div>

      {/* System Status Alert Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-400 shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-400">All Systems Normal & Safe</h2>
            <p className="text-xs text-slate-400">
              {activeCount ? '⚠️ SOS session currently live! Realtime tracking active.' : 'No active emergency SOS dispatches at this moment. Standing by on Supabase Realtime channel.'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800/60 px-3 py-1 rounded-full shrink-0">
          ● RLS Security Active
        </span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map(({ label, value, detail, icon: Icon, style }) => (
          <div key={label} className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-br p-4 ${style}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/50"><Icon className="h-6 w-6" /></div>
            <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-200">{label}</p><div className="mt-1 flex items-center gap-2"><span className="text-2xl font-extrabold text-white">{value}</span><span className="rounded-full bg-slate-950/45 px-2 py-0.5 text-[10px] font-medium">{detail}</span></div></div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.25fr_0.88fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl xl:min-h-[382px]">
          <div className="mb-3 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]" /> Live Alert Feed</h2><span className="text-xs text-slate-400">Live queue</span></div>
          <div className="space-y-2">
            {activeSession ? <AlertRow icon={ShieldAlert} title="SOS Activated" subtitle={`Trigger: ${activeSession.trigger_type.replace('_', ' ')}`} tone="rose" badge="Active" /> : <AlertRow icon={ShieldCheck} title="No live SOS alerts" subtitle="The emergency queue is clear" tone="emerald" badge="Safe" />}
            {safetyReports.slice(0, 4).map((report) => <AlertRow key={report.id} icon={AlertTriangle} title={report.category.replace('_', ' ')} subtitle={report.description} tone={report.severity === 'high' ? 'amber' : 'blue'} badge={report.severity} />)}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl xl:min-h-[382px]">
          <div className="mb-3 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><MapPin className="h-4 w-4 text-cyan-400" /> Active Incidents Map</h2><span className="text-xs text-slate-400">Realtime view</span></div>
          <div className="h-[270px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 xl:h-[330px]"><LiveTrackingMap locations={locations} /></div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[10px] text-slate-400"><span className="text-rose-400">● SOS Alert</span><span className="text-amber-400">▲ Route Deviation</span><span className="text-blue-400">● Transit Alert</span>{latestLocation && <span className="ml-auto font-mono text-slate-500">{latestLocation.lat.toFixed(4)}, {latestLocation.lng.toFixed(4)}</span>}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl xl:min-h-[382px]">
          <div className="mb-3 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><Activity className="h-4 w-4 text-violet-400" /> Alert Analytics</h2><span className="text-xs text-slate-400">Live totals</span></div>
          <div className="grid grid-cols-3 gap-2">
            <AnalyticsCard label="Alerts" value={activeCount + safetyReports.length} color="rose" />
            <AnalyticsCard label="High risk" value={highRiskCount} color="amber" />
            <AnalyticsCard label="Resolved" value={activeSession?.status === 'resolved' ? 1 : 0} color="emerald" />
          </div>
          <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs"><Metric label="SOS dispatches" value={activeCount} color="text-rose-400" /><Metric label="Safety reports" value={safetyReports.length} color="text-amber-400" /><Metric label="Responder roster" value={contacts.length} color="text-cyan-400" /></div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.9fr_0.78fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><Radio className="h-4 w-4 text-rose-400" /> Recent Notifications</h2><span className="text-xs text-slate-400">System stream</span></div>
          <Notification text={activeSession ? 'Live SOS tracking is active' : 'Responder console is standing by'} time="Just now" tone="rose" />
          <Notification text={`${safetyReports.length} safety reports are available for review`} time="2 minutes ago" tone="amber" />
          <Notification text="Realtime channel connected and secure" time="5 minutes ago" tone="emerald" />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-1"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><Users className="h-4 w-4 text-blue-400" /> Emergency Contact Roster</h2></div>
          <div className="space-y-1.5">{contacts.map((contact) => <div key={contact.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-800/60"><span className="min-w-0"><span className="block truncate text-xs font-medium text-slate-200">{contact.name}</span><span className="block text-[10px] text-slate-500">{contact.phone}</span></span><a href={`tel:${contact.phone}`} className="ml-3 inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-700"><PhoneCall className="h-3 w-3" /> Call</a></div>)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl">
          <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Admin System Status</h2>
          <div className="space-y-2"><SystemRow label="Postgres RLS" value="Enforced" /><SystemRow label="Realtime Channel" value="sos_locations" /><SystemRow label="Storage Vault" value="sos-media" /></div>
        </div>
      </section>
    </div>
  );
}

function AlertRow({ icon: Icon, title, subtitle, tone, badge }: { icon: React.ElementType; title: string; subtitle: string; tone: 'rose' | 'amber' | 'blue' | 'emerald'; badge: string }) {
  const colors = { rose: 'bg-rose-500/15 text-rose-400', amber: 'bg-amber-500/15 text-amber-400', blue: 'bg-blue-500/15 text-blue-400', emerald: 'bg-emerald-500/15 text-emerald-400' };
  return <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/55 p-2.5"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold capitalize text-slate-200">{title}</p><p className="truncate text-[10px] text-slate-500">{subtitle}</p></div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${colors[tone]}`}>{badge}</span></div>;
}

function AnalyticsCard({ label, value, color }: { label: string; value: number; color: 'rose' | 'amber' | 'emerald' }) {
  const colors = { rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400', amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400', emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' };
  return <div className={`rounded-xl border p-3 text-center ${colors[color]}`}><span className="block text-2xl font-extrabold">{value}</span><span className="mt-1 block text-[10px] font-medium text-slate-400">{label}</span></div>;
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="flex items-center justify-between"><span className="text-slate-400">{label}</span><span className={`font-bold ${color}`}>{value}</span></div>;
}

function Notification({ text, time, tone }: { text: string; time: string; tone: 'rose' | 'amber' | 'emerald' }) {
  const colors = { rose: 'bg-rose-400', amber: 'bg-amber-400', emerald: 'bg-emerald-400' };
  return <div className="flex items-center gap-3 border-t border-slate-800 px-2 py-2.5 text-xs first:border-t-0"><span className={`h-2 w-2 rounded-full ${colors[tone]}`} /><span className="min-w-0 flex-1 truncate text-slate-300">{text}</span><span className="shrink-0 text-[10px] text-slate-500">{time}</span></div>;
}

function SystemRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg bg-slate-950/55 px-2.5 py-2 text-[11px]"><span className="text-slate-400">{label}</span><span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">{value}</span></div>;
}
