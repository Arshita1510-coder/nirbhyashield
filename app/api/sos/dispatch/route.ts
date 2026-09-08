import { NextResponse } from 'next/server';
import { nirbhayaStore } from '@/lib/supabase/mock-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trigger_type, lat, lng, user_id } = body;

    const session = nirbhayaStore.triggerSOS(trigger_type || 'button', lat || 28.6139, lng || 77.2090);
    const contacts = nirbhayaStore.getContacts();

    const originHost = req.headers.get('host') || 'localhost:3000';
    const trackingUrl = `http://${originHost}/track/${session.tracking_token}`;

    const smsPayloads = contacts.map(contact => ({
      to: contact.phone,
      message: `[EMERGENCY ALERT] NirbhayaShield SOS Triggered! User needs urgent assistance. Track real-time location & live audio preview here: ${trackingUrl}`,
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
