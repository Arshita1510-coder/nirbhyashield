export type ShareLevel = 'location_only' | 'location_audio';
export type SOSStatus = 'active' | 'resolved' | 'false_alarm';
export type SOSTrigger = 'button' | 'shake' | 'voice' | 'pin' | 'route_deviation' | 'transit' | 'scam_timer';
export type RiskLevel = 'low' | 'moderate' | 'high';
export type CheckinStatus = 'pending' | 'checked_in' | 'missed' | 'escalated';

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  share_level: ShareLevel;
  created_at: string;
}

export interface SOSSession {
  id: string;
  user_id: string;
  status: SOSStatus;
  trigger_type: SOSTrigger;
  vehicle_id?: string;
  tracking_token: string;
  audio_vault_path?: string;
  started_at: string;
  resolved_at?: string;
}

export interface SOSLocation {
  id: number;
  session_id: string;
  lat: number;
  lng: number;
  battery_pct: number;
  speed: number;
  recorded_at: string;
}

export interface SafePoint {
  id: string;
  name: string;
  category: 'police' | 'pink_booth' | 'hospital' | 'pharmacy' | 'illuminated_zone';
  lat: number;
  lng: number;
  address: string;
  distance_meters?: number;
  verified: boolean;
}

export interface TransitCheckin {
  id: string;
  user_id: string;
  vehicle_id: string;
  route_name: string;
  status: 'active' | 'completed' | 'alert';
  checked_in_at: string;
}

export interface ScamCheck {
  id: string;
  user_id?: string;
  job_text: string;
  interview_address: string;
  risk_level: RiskLevel;
  reasons: string[];
  created_at: string;
}

export interface InterviewCheckin {
  id: string;
  scam_check_id?: string;
  user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: CheckinStatus;
  created_at: string;
}

export interface SafetyReport {
  id: string;
  category: 'poor_lighting' | 'harassment' | 'isolated' | 'suspicious_activity' | 'unmonitored';
  description: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface SafetyHotspot {
  id: string;
  name: string;
  type: 'risky_sunsaan' | 'safe_crowded';
  lat: number;
  lng: number;
  radius_meters: number;
  crowd_level: string;
  lighting_level: string;
  description: string;
  risk_reason?: string;
}

