'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, ShieldCheck, AlertTriangle, MapPin, Zap, CheckCircle2, Radio, Info } from 'lucide-react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { SafePoint, SafetyReport } from '@/lib/supabase/types';

const SafeRouteMap = dynamic(() => import('@/components/maps/SafeRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500 text-xs">
      Calculating Safe Geometry & PostGIS Points...
    </div>
  ),
});

export default function SafeRoutesPage() {
  const [origin, setOrigin] = useState('Connaught Place Metro Station Gate 2');
  const [destination, setDestination] = useState('Janpath Market & Lodhi Colony');
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('safest');
  const [safePoints, setSafePoints] = useState<SafePoint[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Route Deviation Monitor Simulator State
  const [isNavigating, setIsNavigating] = useState(false);
  const [deviationAlert, setDeviationAlert] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/safe-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });
      const data = await res.json();
      if (data.routes) {
        setRoutes(data.routes);
        setSafePoints(data.safe_points);
        setSafetyReports(data.safety_reports);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateRouteDeviation = () => {
    setIsNavigating(true);
    setDeviationAlert(false);

    // After 3 seconds, simulate 150m deviation off safe path
    setTimeout(() => {
      setDeviationAlert(true);
      nirbhayaStore.triggerSOS('route_deviation');
    }, 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" /> TRACK CARD #22
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Safe Route Recommendation System</h1>
          <p className="text-xs text-slate-400">
            PostGIS spatial queries evaluate street lighting index, police pink-booths, crowd density, and hazard reports.
          </p>
        </div>

        <button
          onClick={simulateRouteDeviation}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
            isNavigating
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          {isNavigating ? 'Simulating Live Navigation...' : 'Test Route Deviation Monitor'}
        </button>
      </div>

      {/* Route Deviation Trigger Warning Alert */}
      {deviationAlert && (
        <div className="bg-rose-950/90 border-2 border-rose-600 rounded-xl p-4 text-xs space-y-2 text-rose-200 animate-bounce">
          <div className="flex items-center gap-2 font-black text-rose-400 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> ROUTE DEVIATION THRESHOLD EXCEEDED (&gt;120m off safe path)
          </div>
          <p>
            PostGIS spatial geometry query detected user strayed into an isolated low-lighting zone. Automated emergency SOS session triggered!
          </p>
        </div>
      )}

      {/* Main Grid: Map & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Origin/Dest & Route Comparisons */}
        <div className="space-y-4">
          
          {/* Search Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Plan Route</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Origin:</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="bg-transparent w-full focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination:</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-transparent w-full focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={fetchRoutes}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg font-semibold text-xs transition-colors mt-2"
              >
                Recalculate Routes
              </button>
            </div>
          </div>

          {/* Route Options List */}
          <div className="space-y-3">
            {routes.map((route) => {
              const isSafest = route.id === 'safest';
              const isSelected = route.id === selectedRouteId;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isSafest
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/40'
                        : 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-950/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isSafest ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {route.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {route.duration_mins} mins ({route.distance_km} km) • {route.lighting_index}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-black ${isSafest ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {route.safety_score}/100
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Safety Score</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Crowd: <strong className="text-slate-200">{route.crowd_density}</strong></span>
                    <span>Safe Desks: <strong className="text-slate-200">{route.nearby_safe_points_count} nearby</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Leaflet Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> PostGIS Spatial Safe Points & Lighting Heatmap
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Recommended Safe Route</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fastest Route</span>
            </div>
          </div>

          <div className="h-[460px] rounded-xl overflow-hidden border border-slate-800">
            <SafeRouteMap
              routes={routes}
              selectedRouteId={selectedRouteId}
              safePoints={safePoints}
              safetyReports={safetyReports}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
