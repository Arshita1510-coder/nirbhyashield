'use client';

import React, { useEffect } from 'react';
import { SOSLocation } from '@/lib/supabase/types';

interface Props {
  locations: SOSLocation[];
}

export default function LiveTrackingMap({ locations }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = require('leaflet');

    const defaultCenter = locations.length > 0
      ? [locations[locations.length - 1].lat, locations[locations.length - 1].lng]
      : [28.6139, 77.2090];

    const map = L.map('live-map-container').setView(defaultCenter, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Draw path line between breadcrumbs
    if (locations.length > 0) {
      const pathCoords = locations.map(l => [l.lat, l.lng]);
      L.polyline(pathCoords, { color: '#ff1744', weight: 4, opacity: 0.8 }).addTo(map);

      // Latest position marker with emergency icon
      const latest = locations[locations.length - 1];
      const victimIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `<div style="background-color:#ff1744;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 15px #ff1744;" class="animate-ping"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([latest.lat, latest.lng], { icon: victimIcon })
        .addTo(map)
        .bindPopup(`<b>Victim Live Location</b><br/>Speed: ${latest.speed} km/h<br/>Battery: ${latest.battery_pct}%`)
        .openPopup();
    }

    return () => {
      map.remove();
    };
  }, [locations]);

  return <div id="live-map-container" className="w-full h-full min-h-[350px]"></div>;
}
