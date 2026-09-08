'use client';

import React, { useEffect } from 'react';
import { SafePoint, SafetyReport, SafetyHotspot } from '@/lib/supabase/types';

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
  hotspots?: SafetyHotspot[];
}

export default function SafeRouteMap({ routes, selectedRouteId, safePoints, safetyReports, hotspots = [] }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = require('leaflet');

    const map = L.map('safe-route-map-container').setView([28.6139, 77.2090], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Plot Safety Hotspots (Sunsaan Risky Areas vs High Crowd Safe Zones)
    hotspots.forEach((hs) => {
      const isRisky = hs.type === 'risky_sunsaan';
      const circleColor = isRisky ? '#ef4444' : '#10b981';
      const fillColor = isRisky ? '#f43f5e' : '#10b981';
      const fillOpacity = isRisky ? 0.28 : 0.20;

      // Draw Radius Circle
      L.circle([hs.lat, hs.lng], {
        color: circleColor,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        weight: isRisky ? 2 : 2,
        dashArray: isRisky ? '5, 5' : undefined,
        radius: hs.radius_meters || 200,
      }).addTo(map);

      // Center Icon Badge
      const badgeIconHtml = isRisky ? '🚨' : '🛡️';
      const badgeBorder = isRisky ? '#f43f5e' : '#10b981';
      const badgeBg = isRisky ? '#881337' : '#064e3b';

      const customBadge = L.divIcon({
        className: 'hs-icon',
        html: `<div style="background:${badgeBg};border:2px solid ${badgeBorder};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.5);">${badgeIconHtml}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupHeaderBg = isRisky ? '#ffe4e6' : '#dcfce7';
      const popupHeaderBorder = isRisky ? '#e11d48' : '#16a34a';
      const popupHeaderTextColor = isRisky ? '#9f1239' : '#15803d';
      const badgeTitle = isRisky ? '🚨 RISKY HOTSPOT (SUNSAAN AREA)' : '✅ SAFE ZONE (HIGH CROWD & WELL LIT)';

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; width: 230px; padding: 2px;">
          <div style="background:${popupHeaderBg}; border-left: 4px solid ${popupHeaderBorder}; padding: 6px 8px; border-radius: 6px; margin-bottom: 6px;">
            <span style="color:${popupHeaderTextColor}; font-weight: 800; font-size: 11px;">${badgeTitle}</span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">${hs.name}</div>
          <div style="color: #475569; margin-bottom: 6px; line-height: 1.3; font-size: 11px;">${hs.description}</div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px;">
            <div><strong style="color: #334155;">👥 Footfall / Crowd:</strong> <span style="font-weight: 600; color: ${isRisky ? '#be123c' : '#15803d'};">${hs.crowd_level}</span></div>
            <div><strong style="color: #334155;">💡 Street Lighting:</strong> <span style="font-weight: 600; color: ${isRisky ? '#be123c' : '#15803d'};">${hs.lighting_level}</span></div>
            ${hs.risk_reason ? `<div style="color: #be123c; font-style: italic; margin-top: 4px; background: #fff1f2; padding: 4px; border-radius: 4px;">⚠️ ${hs.risk_reason}</div>` : ''}
          </div>
        </div>
      `;

      L.marker([hs.lat, hs.lng], { icon: customBadge })
        .addTo(map)
        .bindPopup(popupContent);
    });

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
  }, [routes, selectedRouteId, safePoints, safetyReports, hotspots]);

  return <div id="safe-route-map-container" className="w-full h-full min-h-[420px]"></div>;
}
