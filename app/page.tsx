'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, Navigation, Bus, AlertTriangle, Users, Database, Zap, Lock, ArrowRight, ShieldCheck, PhoneCall, Radio } from 'lucide-react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';
import { TrustedContact } from '@/lib/supabase/types';

export default function OverviewPage() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [activeSession, setActiveSession] = useState(nirbhayaStore.getActiveSession());
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const refreshContacts = async () => {
    const list = await supabaseService.getContacts();
    setContacts(list);
  };

  useEffect(() => {
    refreshContacts();
    setActiveSession(nirbhayaStore.getActiveSession());
    return nirbhayaStore.subscribe(() => {
      refreshContacts();
      setActiveSession(nirbhayaStore.getActiveSession());
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

      {/* Middle Grid: Trusted Contacts Management & Architecture Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trusted Contacts Card */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  onClick={() => nirbhayaStore.removeContact(contact.id)}
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

        {/* Supabase Architecture Badge */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Database className="w-4 h-4" /> Supabase Backend Stack
          </div>
          
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Supabase Realtime:</strong> Streams <code className="text-emerald-300">sos_locations</code> breadcrumbs instantly without custom WebSockets.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Strict RLS Policies:</strong> Blocks unauthorized database reads. Tokenized RPC view powers live tracking.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">PostGIS Spatial Queries:</strong> Powers safe-point radius lookups & route deviation distance math.
              </div>
            </li>
          </ul>

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              href="/responder"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Open Responder Command Center
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
