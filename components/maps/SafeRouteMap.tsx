'use client';

import React, { useEffect } from 'react';
import { SafePoint, SafetyReport } from '@/lib/supabase/types';

interface RouteOption {
  id: string;
  name: string;
  safety_score: number;
  duration_mins: number;
  distance_km: number;
  lighting_index: string;
  crowd_density: string;
  waypoints: number[][];
}

interface Props {
  routes: RouteOption[];
  selectedRouteId: string;
  safePoints: SafePoint[];
  safetyReports: SafetyReport[];
}

export default function SafeRouteMap({ routes, selectedRouteId, safePoints, safetyReports }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = require('leaflet');

    const map = L.map('safe-route-map-container').setView([28.6139, 77.2090], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Plot Safe Points (Police, Pink Booths, Pharmacies)
    safePoints.forEach((sp) => {
      const iconHtml = sp.category === 'police' ? '👮' : sp.category === 'pink_booth' ? '🌸' : '🏥';
      const customIcon = L.divIcon({
        className: 'sp-icon',
        html: `<div style="background:#0f172a;border:2px solid #10b981;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:16px;">${iconHtml}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([sp.lat, sp.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${sp.name}</b><br/>${sp.address}<br/><span style="color:#10b981;">✓ Verified Safe Desk</span>`);
    });

    // Plot Safety Hazard Reports (Poor Lighting, Unmonitored underpass)
    safetyReports.forEach((sr) => {
      const hazardIcon = L.divIcon({
        className: 'sr-icon',
        html: `<div style="background:#881337;border:2px solid #f43f5e;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;">⚠️</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker([sr.lat, sr.lng], { icon: hazardIcon })
        .addTo(map)
        .bindPopup(`<b>Hazard Report (${sr.category})</b><br/>${sr.description}`);
    });

    // Draw Routes
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const isSafeRoute = route.id === 'safest';
      const strokeColor = isSafeRoute ? '#10b981' : '#f59e0b';
      const weight = isSelected ? 6 : 3;
      const opacity = isSelected ? 0.9 : 0.4;

      L.polyline(route.waypoints, {
        color: strokeColor,
        weight,
        opacity,
        dashArray: isSafeRoute ? undefined : '6, 6',
      }).addTo(map);

      // Start/End Markers
      const origin = route.waypoints[0];
      const dest = route.waypoints[route.waypoints.length - 1];

      L.circleMarker(origin, { radius: 8, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 1 }).addTo(map);
      L.circleMarker(dest, { radius: 8, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [routes, selectedRouteId, safePoints, safetyReports]);

  return <div id="safe-route-map-container" className="w-full h-full min-h-[420px]"></div>;
}
