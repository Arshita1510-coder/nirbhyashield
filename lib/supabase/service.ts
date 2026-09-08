import { supabase, isSupabaseConfigured } from './client';
import { nirbhayaStore } from './mock-store';
import { TrustedContact, SOSSession, SOSLocation, SafePoint, ScamCheck, InterviewCheckin, SafetyReport } from './types';

export class SupabaseService {
  
  // 1. Trusted Contacts
  async getContacts(): Promise<TrustedContact[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trusted_contacts').select('*');
      if (!error && data) return data as TrustedContact[];
    }
    return nirbhayaStore.getContacts();
  }

  async addContact(contact: Omit<TrustedContact, 'id' | 'user_id' | 'created_at'>): Promise<TrustedContact> {
    if (isSupabaseConfigured && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const insertObj: any = { name: contact.name, phone: contact.phone, share_level: contact.share_level };
      if (userData?.user?.id) insertObj.user_id = userData.user.id;

      const { data, error } = await supabase.from('trusted_contacts').insert([insertObj]).select().single();
      if (!error && data) return data as TrustedContact;
      if (error) console.error('Supabase addContact error:', error);
    }
    return nirbhayaStore.addContact(contact);
  }

  async removeContact(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('trusted_contacts').delete().eq('id', id);
    }
    nirbhayaStore.removeContact(id);
  }

  // 2. SOS Engine
  async createSOSSession(triggerType: SOSSession['trigger_type'], vehicleId?: string): Promise<SOSSession> {
    if (isSupabaseConfigured && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const insertObj: any = { status: 'active', trigger_type: triggerType, vehicle_id: vehicleId };
      if (userData?.user?.id) insertObj.user_id = userData.user.id;

      const { data, error } = await supabase.from('sos_sessions').insert([insertObj]).select().single();
      if (!error && data) return data as SOSSession;
      if (error) console.error('Supabase createSOSSession error:', error);
    }
    return nirbhayaStore.triggerSOS(triggerType, 28.6139, 77.2090, vehicleId);
  }

  async addSOSLocation(sessionId: string, lat: number, lng: number, batteryPct = 80, speed = 0): Promise<SOSLocation> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('sos_locations').insert([
        {
          session_id: sessionId,
          lat,
          lng,
          battery_pct: batteryPct,
          speed,
        }
      ]).select().single();
      if (!error && data) return data as SOSLocation;
    }
    return nirbhayaStore.addLocationBreadcrumb(sessionId, lat, lng, batteryPct, speed);
  }

  async resolveSOS(sessionId: string, status: 'resolved' | 'false_alarm'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('sos_sessions').update({
        status,
        resolved_at: new Date().toISOString(),
      }).eq('id', sessionId);
    }
    nirbhayaStore.resolveSOS(sessionId, status);
  }

  // 3. Supabase Realtime Subscription Channel
  subscribeToSOSLocations(sessionId: string, callback: (location: SOSLocation) => void) {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`sos-${sessionId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sos_locations', filter: `session_id=eq.${sessionId}` },
          (payload) => callback(payload.new as SOSLocation)
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    return nirbhayaStore.subscribe(() => {
      const locs = nirbhayaStore.getLocations(sessionId);
      if (locs.length > 0) {
        callback(locs[locs.length - 1]);
      }
    });
  }

  // 4. Safe Points & Route Deviations
  async getSafePoints(): Promise<SafePoint[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('safe_points').select('*');
      if (!error && data) return data as SafePoint[];
    }
    return nirbhayaStore.getSafePoints();
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('safety_reports').select('*');
      if (!error && data) return data as SafetyReport[];
    }
    return nirbhayaStore.getSafetyReports();
  }

  // 5. Storage Vault Upload (Audio & Clips)
  async uploadAudioVault(sessionId: string, audioBlob: Blob): Promise<string | null> {
    if (isSupabaseConfigured && supabase) {
      const fileName = `vault-${sessionId}-${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('sos-media')
        .upload(`session-${sessionId}/${fileName}`, audioBlob);
      
      if (!error && data) {
        const { data: urlData } = await supabase.storage
          .from('sos-media')
          .createSignedUrl(data.path, 3600); // 1 hour signed URL
        return urlData?.signedUrl || null;
      }
    }
    return null;
  }
}

export const supabaseService = new SupabaseService();
