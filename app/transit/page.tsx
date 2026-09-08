'use client';

import React, { useState } from 'react';
import { Bus, Train, Car, QrCode, ShieldAlert, CheckCircle2, AlertTriangle, Radio, Send, MapPin, Navigation } from 'lucide-react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';

type TransitMode = 'bus' | 'train' | 'auto' | 'cab' | 'other';

export default function TransitSafetyPage() {
  const [transitMode, setTransitMode] = useState<TransitMode>('bus');
  const [vehicleId, setVehicleId] = useState('DL-01-PC-9821');
  const [routeName, setRouteName] = useState('DTC Express Route #544 (Janakpuri to Nehru Place)');
  const [customModeLabel, setCustomModeLabel] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hazardCategory, setHazardCategory] = useState<'poor_lighting' | 'harassment' | 'isolated' | 'suspicious_activity' | 'unmonitored'>('harassment');
  const [hazardDesc, setHazardDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleModeChange = (mode: TransitMode) => {
    setTransitMode(mode);
    setIsCheckedIn(false);
    if (mode === 'bus') {
      setVehicleId('DL-01-PC-9821');
      setRouteName('DTC Express Route #544 (Janakpuri to Nehru Place)');
    } else if (mode === 'train') {
      setVehicleId('DMRC-YELLOW-04');
      setRouteName('Delhi Metro Yellow Line (Rajiv Chowk to HUDA City Centre)');
    } else if (mode === 'auto') {
      setVehicleId('DL-1R-A-4521');
      setRouteName('CP Metro Gate 2 to Bengali Market (Auto-Rickshaw)');
    } else if (mode === 'cab') {
      setVehicleId('DL-3C-AZ-1190');
      setRouteName('Airport Express Highway Shuttle Cab');
    } else if (mode === 'other') {
      setVehicleId('TR-99-CUSTOM');
      setRouteName('Ferry / Tram / Special Commute');
    }
  };

  const handleVehicleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleId) {
      const displayMode = transitMode === 'other' ? (customModeLabel || 'Other Transport') : transitMode.toUpperCase();
      const fullRoute = `[${displayMode}] ${routeName}`;
      await supabaseService.addTransitCheckin(vehicleId, fullRoute);
      setIsCheckedIn(true);
    }
  };

  const handleTransitPanic = async () => {
    const displayMode = transitMode === 'other' ? (customModeLabel || 'Other Transport') : transitMode.toUpperCase();
    await supabaseService.createSOSSession('transit', `${displayMode}: ${vehicleId}`);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hazardDesc) {
      const displayMode = transitMode === 'other' ? (customModeLabel || 'Other Transport') : transitMode.toUpperCase();
      await supabaseService.addSafetyReport({
        category: hazardCategory,
        description: `[${displayMode} ${vehicleId}] ${hazardDesc}`,
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
          Connected reporting & response workflows for buses, trains, metros, auto-rickshaws, cabs, and public transport.
        </p>
      </div>

      {/* Transit Mode Selection Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Select Public Transport Vehicle Type</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Mode 1: Bus */}
          <button
            type="button"
            onClick={() => handleModeChange('bus')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              transitMode === 'bus'
                ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Bus className={`w-6 h-6 ${transitMode === 'bus' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40">Bus</span>
            </div>
            <div className="mt-3">
              <div className="font-bold text-xs text-white">City & DTC Bus</div>
              <div className="text-[10px] text-slate-400 mt-0.5">DTC, Express, Electric</div>
            </div>
          </button>

          {/* Mode 2: Train / Metro */}
          <button
            type="button"
            onClick={() => handleModeChange('train')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              transitMode === 'train'
                ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Train className={`w-6 h-6 ${transitMode === 'train' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40">Metro / Train</span>
            </div>
            <div className="mt-3">
              <div className="font-bold text-xs text-white">Metro & Railways</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Metro, Local Train, Rail</div>
            </div>
          </button>

          {/* Mode 3: Auto-Rickshaw */}
          <button
            type="button"
            onClick={() => handleModeChange('auto')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              transitMode === 'auto'
                ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Car className={`w-6 h-6 ${transitMode === 'auto' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40">Auto / Rickshaw</span>
            </div>
            <div className="mt-3">
              <div className="font-bold text-xs text-white">Auto & E-Rickshaw</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Green Auto, Shared</div>
            </div>
          </button>

          {/* Mode 4: Cab / Taxi */}
          <button
            type="button"
            onClick={() => handleModeChange('cab')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              transitMode === 'cab'
                ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Car className={`w-6 h-6 ${transitMode === 'cab' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40">Cab / Taxi</span>
            </div>
            <div className="mt-3">
              <div className="font-bold text-xs text-white">Cab & Rideshare</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Taxi, Shuttle, Airport</div>
            </div>
          </button>

          {/* Mode 5: Other Public Transport */}
          <button
            type="button"
            onClick={() => handleModeChange('other')}
            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
              transitMode === 'other'
                ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Navigation className={`w-6 h-6 ${transitMode === 'other' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/40">Other Transport</span>
            </div>
            <div className="mt-3">
              <div className="font-bold text-xs text-white">Other Public Commute</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ferry, Tram, Shuttle</div>
            </div>
          </button>
        </div>
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Transit Safety Check-in</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30 uppercase">
                      {transitMode}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Scan onboard QR code or enter {transitMode} registration number.</p>
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
                  <label className="text-slate-400 block mb-1">
                    {transitMode === 'bus' ? 'Bus Registration / Fleet Number:' : transitMode === 'train' ? 'Train / Coach / Metro Number:' : transitMode === 'auto' ? 'Auto-Rickshaw Plate Number:' : transitMode === 'cab' ? 'Cab / Taxi License Plate:' : 'Vehicle Registration Number:'}
                  </label>
                  <input
                    type="text"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Route / Line Details:</label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {transitMode === 'other' && (
                <div>
                  <label className="text-slate-400 block mb-1 text-xs">Custom Transport Type (e.g. River Ferry, Cable Car, Airport Shuttle):</label>
                  <input
                    type="text"
                    placeholder="Specify transport type..."
                    value={customModeLabel}
                    onChange={(e) => setCustomModeLabel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  {isCheckedIn ? 'Update Vehicle Info' : `Simulate ${transitMode.toUpperCase()} Safety Check-in`}
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
                  Broadcasts {transitMode.toUpperCase()} registration ({vehicleId}) and live route GPS breadcrumbs to Police Command & emergency contacts.
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
