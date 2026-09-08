import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trigger_type, lat, lng, user_id } = body;

    const session = await supabaseService.createSOSSession(trigger_type || 'button');
    await supabaseService.addSOSLocation(session.id, lat || 28.6139, lng || 77.2090, 90, 0);
    const contacts = await supabaseService.getContacts();

    const originHost = req.headers.get('host') || 'localhost:3000';
    const trackingUrl = `http://${originHost}/track/${session.tracking_token}`;

    const smsPayloads = contacts.map(contact => ({
      to: contact.phone,
      message: `[EMERGENCY ALERT] RakshaShield SOS Triggered! User needs urgent assistance. Track real-time location & live audio preview here: ${trackingUrl}`,
    }));

    return NextResponse.json({
      success: true,
      session,
      tracking_url: trackingUrl,
      dispatched_contacts_count: contacts.length,
      sms_previews: smsPayloads,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
