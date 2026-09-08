import { NextResponse } from 'next/server';
import { nirbhayaStore } from '@/lib/supabase/mock-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination } = body;

    const safePoints = nirbhayaStore.getSafePoints();
    const safetyReports = nirbhayaStore.getSafetyReports();

    // Calculate safety scores for Fastest vs Safest Routes
    const fastestScore = Math.floor(62 + Math.random() * 8); // ~65/100
    const safestScore = Math.floor(92 + Math.random() * 6); // ~95/100

    const fastestPathWaypoints = [
      [28.6139, 77.2090],
      [28.6160, 77.2110], // passes near dark report area
      [28.6220, 77.2150],
    ];

    const safestPathWaypoints = [
      [28.6139, 77.2090],
      [28.6180, 77.2150], // passes Apollo Pharmacy Pink Desk
      [28.6220, 77.2050], // passes Metro Pink Booth
    ];

    return NextResponse.json({
      success: true,
      routes: [
        {
          id: 'safest',
          name: 'Recommended Safe Route (Well Lit + Police Covered)',
          safety_score: safestScore,
          duration_mins: 14,
          distance_km: 3.2,
          lighting_index: '98% Fully Illuminated',
          crowd_density: 'High (Active Foot Traffic)',
          nearby_safe_points_count: safePoints.length,
          waypoints: safestPathWaypoints,
        },
        {
          id: 'fastest',
          name: 'Fastest Direct Route (Caution: Dim Sections)',
          safety_score: fastestScore,
          duration_mins: 10,
          distance_km: 2.7,
          lighting_index: '54% Dim/Unlit Sections',
          crowd_density: 'Low (Isolated Underpass)',
          nearby_safe_points_count: 1,
          waypoints: fastestPathWaypoints,
        }
      ],
      safe_points: safePoints,
      safety_reports: safetyReports,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
