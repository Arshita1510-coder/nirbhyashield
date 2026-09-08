'use client';

import React, { useState } from 'react';
import { Bus, QrCode, ShieldAlert, CheckCircle2, AlertTriangle, Radio, Send, MapPin, Users } from 'lucide-react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';

export default function TransitSafetyPage() {
  const [vehicleId, setVehicleId] = useState('DL-01-PC-9821');
  const [routeName, setRouteName] = useState('DTC Express Route #544 (Janakpuri to Nehru Place)');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hazardCategory, setHazardCategory] = useState<'poor_lighting' | 'harassment' | 'isolated' | 'suspicious_activity' | 'unmonitored'>('harassment');
  const [hazardDesc, setHazardDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleVehicleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleId) {
      await supabaseService.addTransitCheckin(vehicleId, routeName);
      setIsCheckedIn(true);
    }
  };

  const handleTransitPanic = async () => {
    await supabaseService.createSOSSession('transit', vehicleId);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hazardDesc) {
      await supabaseService.addSafetyReport({
        category: hazardCategory,
        description: `[Transit Vehicle ${vehicleId}] ${hazardDesc}`,
        lat: 28.6139,
        lng: 77.2090,
        severity: 'high',
      });
      setReportSubmitted(true);
      setHazardDesc('');
      setTimeout(() => setReportSubmitted(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
          <Bus className="w-3.5 h-3.5 text-cyan-400" /> TRACK CARD #23
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">Public Transport Safety System</h1>
        <p className="text-xs text-slate-400">
          Connected reporting & response workflows for buses, trains, metros, and auto-rickshaws.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Vehicle Check-in & Transit Panic Button */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Vehicle QR Check-in Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Transit Vehicle Safety Check-in</h2>
                  <p className="text-xs text-slate-400">Scan onboard QR code or enter bus/auto registration number.</p>
                </div>
              </div>

              {isCheckedIn && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                </span>
              )}
            </div>

            <form onSubmit={handleVehicleCheckin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Vehicle / Bus Number:</label>
                  <input
                    type="text"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Route / Line Name:</label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {isCheckedIn ? 'Update Vehicle Info' : 'Simulate Vehicle QR Scan'}
                </button>
              </div>
            </form>
          </div>

          {/* In-Transit Emergency Panic Button Card */}
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">In-Transit Panic Mode</span>
                <h3 className="text-xl font-black text-white">Transit SOS Alert Trigger</h3>
                <p className="text-xs text-slate-300">
                  Broadcasts vehicle registration ({vehicleId}) and live route GPS breadcrumbs to Police Command & emergency contacts.
                </p>
              </div>

              <button
                onClick={handleTransitPanic}
                className="px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-900/50 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 border border-rose-400/40"
              >
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <span>TRANSIT PANIC</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Crowdsourced Hazard Reporter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Report Transit Hazard</h2>
              <p className="text-xs text-slate-400">Crowdsource safety ratings for stations, buses & stops.</p>
            </div>
          </div>

          {reportSubmitted && (
            <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Hazard report submitted & logged to public map!
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Issue Category:</label>
              <select
                value={hazardCategory}
                onChange={(e: any) => setHazardCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="harassment">Harassment / Unsafe Conduct</option>
                <option value="poor_lighting">Poor Lighting at Stop/Station</option>
                <option value="isolated">Isolated / Unmonitored Exit</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="unmonitored">CCTV Non-functional</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Description / Location Details:</label>
              <textarea
                rows={3}
                value={hazardDesc}
                onChange={(e) => setHazardDesc(e.target.value)}
                placeholder="Describe issue (e.g., Unlit bus shelter near exit gate 3...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Safety Report
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
