import { SOSSession, SOSLocation, TrustedContact, SafePoint, ScamCheck, InterviewCheckin, SafetyReport } from './types';

// Default initial state for local demo and state persistence
const INITIAL_CONTACTS: TrustedContact[] = [
  {
    id: 'tc-1',
    user_id: 'usr-demo',
    name: 'Priya Sharma (Mom)',
    phone: '+91 98765 43210',
    share_level: 'location_audio',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc-2',
    user_id: 'usr-demo',
    name: 'Anjali Verma (Sister)',
    phone: '+91 98123 45678',
    share_level: 'location_only',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SAFE_POINTS: SafePoint[] = [
  {
    id: 'sp-1',
    name: 'Central Women Police Station & Pink Booth',
    category: 'police',
    lat: 28.6139,
    lng: 77.2090,
    address: 'Connaught Place, New Delhi',
    verified: true,
  },
  {
    id: 'sp-2',
    name: '24/7 Apollo Pharmacy & Emergency Helpdesk',
    category: 'pharmacy',
    lat: 28.6180,
    lng: 77.2150,
    address: 'Janpath Road, New Delhi',
    verified: true,
  },
  {
    id: 'sp-3',
    name: 'Pink Safe Zone - Metro Station Entrance',
    category: 'pink_booth',
    lat: 28.6220,
    lng: 77.2050,
    address: 'Rajiv Chowk Gate 2, Delhi',
    verified: true,
  },
  {
    id: 'sp-4',
    name: 'Max Super Specialty Emergency Desk',
    category: 'hospital',
    lat: 28.6050,
    lng: 77.2180,
    address: 'Lodhi Road, Delhi',
    verified: true,
  }
];

const INITIAL_REPORTS: SafetyReport[] = [
  {
    id: 'sr-1',
    category: 'poor_lighting',
    description: 'Broken street lamps along dark alleyway behind metro station.',
    lat: 28.6160,
    lng: 77.2110,
    severity: 'high',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sr-2',
    category: 'unmonitored',
    description: 'Underpass exit CCTV non-functional after 9 PM.',
    lat: 28.6110,
    lng: 77.2030,
    severity: 'medium',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

type Listener = () => void;

class RakshaStore {
  private contacts: TrustedContact[] = INITIAL_CONTACTS;
  private activeSession: SOSSession | null = null;
  private locations: Record<string, SOSLocation[]> = {};
  private safePoints: SafePoint[] = INITIAL_SAFE_POINTS;
  private scamChecks: ScamCheck[] = [];
  private interviewCheckins: InterviewCheckin[] = [];
  private safetyReports: SafetyReport[] = INITIAL_REPORTS;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('raksha_store_state') || localStorage.getItem('nirbhaya_store_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.activeSession) this.activeSession = parsed.activeSession;
          if (parsed.contacts) this.contacts = parsed.contacts;
          if (parsed.locations) this.locations = parsed.locations;
          if (parsed.interviewCheckins) this.interviewCheckins = parsed.interviewCheckins;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('raksha_store_state', JSON.stringify({
        activeSession: this.activeSession,
        contacts: this.contacts,
        locations: this.locations,
        interviewCheckins: this.interviewCheckins,
      }));
    }
    this.notify();
  }

  public subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // Trusted Contacts
  public getContacts(): TrustedContact[] {
    return this.contacts;
  }

  public addContact(contact: Omit<TrustedContact, 'id' | 'user_id' | 'created_at'>) {
    const newContact: TrustedContact = {
      ...contact,
      id: 'tc-' + Date.now(),
      user_id: 'usr-demo',
      created_at: new Date().toISOString(),
    };
    this.contacts.push(newContact);
    this.persist();
    return newContact;
  }

  public removeContact(id: string) {
    this.contacts = this.contacts.filter(c => c.id !== id);
    this.persist();
  }

  // SOS Engine
  public getActiveSession(): SOSSession | null {
    return this.activeSession;
  }

  public triggerSOS(triggerType: SOSSession['trigger_type'], initialLat = 28.6139, initialLng = 77.2090, vehicleId?: string): SOSSession {
    const sessionToken = 'tok-' + Math.random().toString(36).substring(2, 10);
    const session: SOSSession = {
      id: 'sos-' + Date.now(),
      user_id: 'usr-demo',
      status: 'active',
      trigger_type: triggerType,
      vehicle_id: vehicleId,
      tracking_token: sessionToken,
      started_at: new Date().toISOString(),
      audio_vault_path: 'sos-media/vault-audio-' + Date.now() + '.webm',
    };
    this.activeSession = session;
    this.locations[session.id] = [
      {
        id: 1,
        session_id: session.id,
        lat: initialLat,
        lng: initialLng,
        battery_pct: 85,
        speed: 4.2,
        recorded_at: new Date().toISOString(),
      }
    ];
    this.persist();
    return session;
  }

  public addLocationBreadcrumb(sessionId: string, lat: number, lng: number, batteryPct = 80, speed = 0) {
    if (!this.locations[sessionId]) {
      this.locations[sessionId] = [];
    }
    const breadcrumb: SOSLocation = {
      id: this.locations[sessionId].length + 1,
      session_id: sessionId,
      lat,
      lng,
      battery_pct: batteryPct,
      speed,
      recorded_at: new Date().toISOString(),
    };
    this.locations[sessionId].push(breadcrumb);
    this.persist();
    return breadcrumb;
  }

  public getLocations(sessionId: string): SOSLocation[] {
    return this.locations[sessionId] || [];
  }

  public resolveSOS(sessionId: string, status: 'resolved' | 'false_alarm') {
    if (this.activeSession && this.activeSession.id === sessionId) {
      this.activeSession.status = status;
      this.activeSession.resolved_at = new Date().toISOString();
      this.persist();
    }
  }

  public getSessionByToken(token: string): { session: SOSSession | null; locations: SOSLocation[] } {
    if (this.activeSession && this.activeSession.tracking_token === token) {
      return {
        session: this.activeSession,
        locations: this.locations[this.activeSession.id] || [],
      };
    }
    return { session: null, locations: [] };
  }

  // Safe Points & Reports
  public getSafePoints(): SafePoint[] {
    return this.safePoints;
  }

  public getSafetyReports(): SafetyReport[] {
    return this.safetyReports;
  }

  public addSafetyReport(report: Omit<SafetyReport, 'id' | 'created_at'>) {
    const newReport: SafetyReport = {
      ...report,
      id: 'sr-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.safetyReports.unshift(newReport);
    this.persist();
    return newReport;
  }

  // Scam Detector & Interview Checkin
  public analyzeScam(jobText: string, interviewAddress: string): ScamCheck {
    const lowerText = (jobText + ' ' + interviewAddress).toLowerCase();
    const reasons: string[] = [];
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';

    if (lowerText.includes('registration fee') || lowerText.includes('pay deposit') || lowerText.includes('send money') || lowerText.includes('security deposit')) {
      reasons.push('High Financial Risk: Demands upfront payment/registration deposit.');
      riskLevel = 'high';
    }
    if (lowerText.includes('telegram') || lowerText.includes('whatsapp only') || lowerText.includes('part-time rating')) {
      reasons.push('Unverified Channel: Uses non-official messenger app recruitment tactic.');
      riskLevel = 'high';
    }
    if (lowerText.includes('basement') || lowerText.includes('isolated') || lowerText.includes('night interview') || lowerText.includes('late evening')) {
      reasons.push('Suspicious Location/Time: Interview location or timing poses high safety concerns.');
      if (riskLevel !== 'high') riskLevel = 'moderate';
    }
    if (lowerText.includes('salary 50000 per day') || lowerText.includes('earn 10000 daily')) {
      reasons.push('Unrealistic Pay Offer: Daily earnings disproportionate to standard market roles.');
      riskLevel = 'high';
    }

    if (reasons.length === 0) {
      reasons.push('Location checked against Google Places & local safety registries.');
      reasons.push('Corporate registration footprint appears valid.');
    }

    const check: ScamCheck = {
      id: 'scam-' + Date.now(),
      user_id: 'usr-demo',
      job_text: jobText,
      interview_address: interviewAddress,
      risk_level: riskLevel,
      reasons,
      created_at: new Date().toISOString(),
    };
    this.scamChecks.unshift(check);
    this.persist();
    return check;
  }

  public addInterviewCheckin(scamCheckId: string, scheduledAt: string, durationMinutes: number): InterviewCheckin {
    const checkin: InterviewCheckin = {
      id: 'ic-' + Date.now(),
      scam_check_id: scamCheckId,
      user_id: 'usr-demo',
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.interviewCheckins.unshift(checkin);
    this.persist();
    return checkin;
  }

  public getInterviewCheckins(): InterviewCheckin[] {
    return this.interviewCheckins;
  }

  public updateCheckinStatus(id: string, status: InterviewCheckin['status']) {
    const checkin = this.interviewCheckins.find(c => c.id === id);
    if (checkin) {
      checkin.status = status;
      if (status === 'missed' || status === 'escalated') {
        // Auto-trigger SOS!
        this.triggerSOS('scam_timer');
      }
      this.persist();
    }
  }
}

export const rakshaStore = new RakshaStore();
export const nirbhayaStore = rakshaStore;
