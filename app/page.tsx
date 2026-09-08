'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, Navigation, Bus, AlertTriangle, Users, Database, Zap, Lock, ArrowRight, ShieldCheck, PhoneCall, Radio, CheckCircle2, Clock, Phone, MapPin, Shield, Activity, HelpCircle, FileText } from 'lucide-react';
import { rakshaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';
import { TrustedContact } from '@/lib/supabase/types';

export default function OverviewPage() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [activeSession, setActiveSession] = useState(rakshaStore.getActiveSession());
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [callingModal, setCallingModal] = useState<{ number: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const refreshContacts = async () => {
    const list = await supabaseService.getContacts();
    setContacts(list);
  };

  useEffect(() => {
    refreshContacts();
    setActiveSession(rakshaStore.getActiveSession());
    return rakshaStore.subscribe(() => {
      refreshContacts();
      setActiveSession(rakshaStore.getActiveSession());
    });
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newContactName && newContactPhone) {
      await supabaseService.addContact({
        name: newContactName,
        phone: newContactPhone,
        share_level: 'location_audio',
      });
      setNewContactName('');
      setNewContactPhone('');
      refreshContacts();
    }
  };

  const handleHotlineClick = (e: React.MouseEvent, number: string, title: string) => {
    e.preventDefault();
    setCallingModal({ number, title });
    setCopied(false);
    try {
      window.open(`tel:${number}`, '_self');
    } catch (err) {
      console.log('Tel URI fallback');
    }
  };

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Quick SOS Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border border-rose-900/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Core Alert Engine & Safety Ecosystem
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Rapid SOS & Consent-Driven Safety Ecosystem
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Backed by Supabase Realtime & PostGIS. Instant panic dispatch, ambient audio vault, safe route navigation, public transit reporting, and job scam emergency check-ins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/sos"
              className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-lg rounded-xl shadow-xl shadow-rose-900/50 flex items-center justify-center gap-3 transition-all hover:scale-105 border border-rose-400/30"
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span>TRIGGER SOS ENGINE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Main Module Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Module 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-rose-500/40 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-rose-400 font-bold tracking-wider uppercase">Track Card #21</span>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">Core SOS Alert Engine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Multi-trigger activation (Hold, PIN, Shake, Voice), Supabase Realtime breadcrumbs, & encrypted audio vault.
              </p>
            </div>
          </div>
          <Link href="/sos" className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-rose-400 flex items-center gap-1 hover:gap-2 transition-all">
            Launch SOS Controller <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-emerald-400 font-bold tracking-wider uppercase">Track Card #22</span>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Safe Route Recommender</h3>
              <p className="text-xs text-slate-400 mt-1">
                PostGIS spatial safe-points query, lighting/crowd safety index, and route deviation alert logic.
              </p>
            </div>
          </div>
          <Link href="/routes" className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
            Calculate Safe Routes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-cyan-400 font-bold tracking-wider uppercase">Track Card #23</span>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Transit Safety System</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bus/Train QR check-in, station safety reporting, and connected emergency response workflows.
              </p>
            </div>
          </div>
          <Link href="/transit" className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-cyan-400 flex items-center gap-1 hover:gap-2 transition-all">
            Open Transit Safety <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-bold tracking-wider uppercase">Scam Protection</span>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Job Scam & Check-in</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fake offer/interview text risk analyzer + automated interview safety check-in timer with auto-SOS escalation.
              </p>
            </div>
          </div>
          <Link href="/scam-detector" className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-amber-400 flex items-center gap-1 hover:gap-2 transition-all">
            Scan Offer / Set Timer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Middle Section: Trusted Contacts Management */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Emergency Trusted Contacts</h2>
              <p className="text-xs text-slate-400">Contacts receiving automated SMS alerts, live tracking URL, and audio access.</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            {contacts.length} Configured
          </span>
        </div>

        {/* Contact list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{contact.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-slate-500" /> {contact.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => rakshaStore.removeContact(contact.id)}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors p-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAddContact} className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Contact Name (e.g. Mom, Sister)"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            required
          />
          <input
            type="text"
            placeholder="Phone Number (+91 ...)"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            required
          />
          <button
            type="submit"
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Add Contact
          </button>
        </form>
      </div>

      {/* Section: 3-Step Emergency Response Workflow */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" /> Rapid Emergency Protocol
          </div>
          <h2 className="text-2xl font-extrabold text-white">How RakshaShield Protects You</h2>
          <p className="text-xs text-slate-400">
            Automated real-time safety pipeline from trigger to emergency responder arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Step 1 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-rose-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-rose-900/50">
              01
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Multi-Trigger Panic
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hold SOS button for 1.5s, speak voice keyword, enter false PIN under duress, or shake phone to trigger immediate panic dispatch.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-cyan-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-cyan-900/50">
              02
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" /> Realtime GPS & Vault
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supabase Realtime streams live GPS breadcrumbs every 2 seconds while ambient audio is buffered securely to the media vault.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-emerald-500/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-emerald-900/50">
              03
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Responder Dispatch
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trusted contacts receive automated SMS alerts with tokenized live tracking URL (<code className="text-emerald-300">/track/[token]</code>) & responder broadcast.
            </p>
          </div>
        </div>
      </div>

      {/* Section: One-Tap Emergency Hotlines Directory */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">National Emergency Hotline Directory</h2>
              <p className="text-xs text-slate-400">Instant one-tap direct calling for official emergency services.</p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full font-semibold">
            24/7 Toll-Free Priority Lines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="tel:112"
            onClick={(e) => handleHotlineClick(e, '112', 'National Emergency Line')}
            className="bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs text-slate-400">National Emergency</div>
              <div className="text-lg font-black text-white group-hover:text-rose-400 transition-colors">112</div>
              <div className="text-[10px] text-slate-500">Police, Ambulance, Fire</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="tel:1091"
            onClick={(e) => handleHotlineClick(e, '1091', 'Women Helpline (24/7)')}
            className="bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs text-slate-400">Women Helpline</div>
              <div className="text-lg font-black text-white group-hover:text-rose-400 transition-colors">1091</div>
              <div className="text-[10px] text-slate-500">Women in Distress</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="tel:181"
            onClick={(e) => handleHotlineClick(e, '181', 'Domestic Violence Helpline')}
            className="bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs text-slate-400">Domestic Abuse</div>
              <div className="text-lg font-black text-white group-hover:text-rose-400 transition-colors">181</div>
              <div className="text-[10px] text-slate-500">Domestic Violence Support</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="tel:1098"
            onClick={(e) => handleHotlineClick(e, '1098', 'Child Protection Line')}
            className="bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs text-slate-400">Child & Youth</div>
              <div className="text-lg font-black text-white group-hover:text-rose-400 transition-colors">1098</div>
              <div className="text-[10px] text-slate-500">Child Protection</div>
            </div>
            <PhoneCall className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      {/* Section: Platform Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" /> Privacy & Consent First
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            RakshaShield only streams location data during an explicit active SOS trigger or check-in session. Zero background tracking without user consent. Strict Supabase Row Level Security (RLS) policies guarantee location data is accessible only via tokenized emergency authorization links.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <MapPin className="w-4 h-4" /> PostGIS Spatial Safety Mathematics
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our route engine computes dynamic safety indices based on street lighting intensity, proximity to police pink booths, public transport density, and crowdsourced hazard reports. If a user strays off a safe path by &gt;120 meters, route deviation alerts auto-trigger safety check-ins.
          </p>
        </div>
      </div>

      {/* Emergency Call Modal for Desktop & Mobile */}
      {callingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-600/20 text-rose-500 border border-rose-500/30 mx-auto flex items-center justify-center animate-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs text-rose-400 font-extrabold uppercase tracking-wider">Direct Hotline Dispatch</span>
              <h3 className="text-xl font-black text-white mt-1">{callingModal.title}</h3>
              <div className="text-3xl font-black font-mono text-rose-500 mt-2">{callingModal.number}</div>
              <p className="text-xs text-slate-400 mt-2">
                Initiating emergency phone call request to official 24/7 hotline service.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => copyToClipboard(callingModal.number)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                {copied ? 'Copied Number to Clipboard!' : `Copy Number (${callingModal.number})`}
              </button>

              <a
                href={`tel:${callingModal.number}`}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
              >
                <PhoneCall className="w-4 h-4" /> Launch Device Phone Dialer
              </a>

              <button
                onClick={() => setCallingModal(null)}
                className="w-full bg-transparent hover:bg-slate-800 text-slate-400 py-2 rounded-xl text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

