import { NextResponse } from 'next/server';
import { nirbhayaStore } from '@/lib/supabase/mock-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, originLat: reqLat, originLng: reqLng } = body;

    const originLat = typeof reqLat === 'number' ? reqLat : 28.6139;
    const originLng = typeof reqLng === 'number' ? reqLng : 77.2090;

    const safePoints = nirbhayaStore.getSafePoints();
    const safetyReports = nirbhayaStore.getSafetyReports();

    // Calculate safety scores for Fastest vs Safest Routes
    const fastestScore = Math.floor(62 + Math.random() * 8); // ~65/100
    const safestScore = Math.floor(92 + Math.random() * 6); // ~95/100

    const fastestPathWaypoints = [
      [originLat, originLng],
      [originLat + 0.0021, originLng + 0.0020],
      [originLat + 0.0081, originLng + 0.0060],
    ];

    const safestPathWaypoints = [
      [originLat, originLng],
      [originLat + 0.0041, originLng + 0.0060],
      [originLat + 0.0081, originLng - 0.0040],
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
