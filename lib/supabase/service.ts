import { supabase, isSupabaseConfigured } from './client';
import { rakshaStore } from './mock-store';
import { TrustedContact, SOSSession, SOSLocation, SafePoint, TransitCheckin, ScamCheck, InterviewCheckin, SafetyReport } from './types';

export class SupabaseService {
  
  // 1. Trusted Contacts
  async getContacts(): Promise<TrustedContact[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trusted_contacts').select('*');
      if (!error && data) return data as TrustedContact[];
    }
    return rakshaStore.getContacts();
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
    return rakshaStore.addContact(contact);
  }

  async removeContact(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('trusted_contacts').delete().eq('id', id);
    }
    rakshaStore.removeContact(id);
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
    return rakshaStore.triggerSOS(triggerType, 28.6139, 77.2090, vehicleId);
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
    return rakshaStore.addLocationBreadcrumb(sessionId, lat, lng, batteryPct, speed);
  }

  async resolveSOS(sessionId: string, status: 'resolved' | 'false_alarm'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('sos_sessions').update({
        status,
        resolved_at: new Date().toISOString(),
      }).eq('id', sessionId);
    }
    rakshaStore.resolveSOS(sessionId, status);
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

    return rakshaStore.subscribe(() => {
      const locs = rakshaStore.getLocations(sessionId);
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
    return rakshaStore.getSafePoints();
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('safety_reports').select('*');
      if (!error && data) return data as SafetyReport[];
    }
    return rakshaStore.getSafetyReports();
  }

  // 6. Transit Check-in & Safety Reports
  async addTransitCheckin(vehicleId: string, routeName: string): Promise<TransitCheckin> {
    if (isSupabaseConfigured && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const insertObj: any = { vehicle_id: vehicleId, route_name: routeName, status: 'active' };
      if (userData?.user?.id) insertObj.user_id = userData.user.id;

      const { data, error } = await supabase.from('transit_checkins').insert([insertObj]).select().single();
      if (!error && data) return data as TransitCheckin;
      if (error) console.error('Supabase addTransitCheckin error:', error);
    }
    return {
      id: 'tc-' + Date.now(),
      user_id: 'usr-demo',
      vehicle_id: vehicleId,
      route_name: routeName,
      status: 'active',
      checked_in_at: new Date().toISOString(),
    };
  }

  async addSafetyReport(report: Omit<SafetyReport, 'id' | 'created_at'>): Promise<SafetyReport> {
    if (isSupabaseConfigured && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const insertObj: any = { ...report };
      if (userData?.user?.id) insertObj.user_id = userData.user.id;

      const { data, error } = await supabase.from('safety_reports').insert([insertObj]).select().single();
      if (!error && data) return data as SafetyReport;
      if (error) console.error('Supabase addSafetyReport error:', error);
    }
    return rakshaStore.addSafetyReport(report);
  }
}

export const supabaseService = new SupabaseService();
