import { NextResponse } from 'next/server';
import { nirbhayaStore } from '@/lib/supabase/mock-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { job_text, interview_address } = body;

    if (!job_text && !interview_address) {
      return NextResponse.json({ error: 'Job description or address is required.' }, { status: 400 });
    }

    const result = nirbhayaStore.analyzeScam(job_text || '', interview_address || '');

    return NextResponse.json({
      success: true,
      scam_check: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
