'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, Search, Calendar, PhoneCall, AlertCircle, Share2 } from 'lucide-react';
import { nirbhayaStore } from '@/lib/supabase/mock-store';
import { ScamCheck, InterviewCheckin } from '@/lib/supabase/types';

export default function ScamDetectorPage() {
  const [jobText, setJobText] = useState(
    'Earn ₹10,000/day working from home! Mandatory registration fee of ₹1,500 required via Telegram transfer before interview. Interview location: Basement #4, Isolated Industrial Estate.'
  );
  const [interviewAddress, setInterviewAddress] = useState('Plot 82, Industrial Underpass Area, Basement Floor');
  const [analyzing, setAnalyzing] = useState(false);
  const [scamCheckResult, setScamCheckResult] = useState<ScamCheck | null>(null);

  // Timer scheduling state
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [checkins, setCheckins] = useState<InterviewCheckin[]>([]);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);

  useEffect(() => {
    setCheckins(nirbhayaStore.getInterviewCheckins());
    return nirbhayaStore.subscribe(() => {
      setCheckins(nirbhayaStore.getInterviewCheckins());
    });
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await fetch('/api/scam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_text: jobText, interview_address: interviewAddress }),
      });
      const data = await res.json();
      if (data.scam_check) {
        setScamCheckResult(data.scam_check);
      }
    } catch (e) {
      const result = nirbhayaStore.analyzeScam(jobText, interviewAddress);
      setScamCheckResult(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScheduleCheckin = () => {
    if (scamCheckResult) {
      const checkin = nirbhayaStore.addInterviewCheckin(
        scamCheckResult.id,
        new Date().toISOString(),
        durationMinutes
      );
      // Start 15-second simulation timer for demo auto-escalation
      startTimerSimulation(checkin.id);
    }
  };

  const startTimerSimulation = (checkinId: string) => {
    let secondsLeft = 15;
    setActiveTimerSeconds(secondsLeft);
    const interval = setInterval(() => {
      secondsLeft -= 1;
      setActiveTimerSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        setActiveTimerSeconds(null);
        // Missed checkin -> Escalate to SOS!
        nirbhayaStore.updateCheckinStatus(checkinId, 'missed');
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> PHASE 4 SAFETY MODULE
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">Job & Interview Scam Detector</h1>
        <p className="text-xs text-slate-400">
          Detect suspicious job offers, isolated interview addresses, and setup timed safety check-in callbacks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Scam Text Analyzer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Analyze Job Offer / Interview Invite</h2>
              <p className="text-xs text-slate-400">Scan text and address for financial traps or safety risks.</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Job Offer Text / Message Snippet:</label>
              <textarea
                rows={4}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 font-sans"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Interview Location / Address:</label>
              <input
                type="text"
                value={interviewAddress}
                onChange={(e) => setInterviewAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
            >
              <AlertTriangle className="w-4 h-4" />
              {analyzing ? 'Scanning Red Flags & Google Places...' : 'Analyze Job Risk Level'}
            </button>
          </form>

          {/* Analysis Results Display */}
          {scamCheckResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              scamCheckResult.risk_level === 'high'
                ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                : scamCheckResult.risk_level === 'moderate'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-sm flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Risk Rating: {scamCheckResult.risk_level}
                </span>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono">
                  {new Date(scamCheckResult.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-semibold block text-white">Detected Flags & Reasons:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {scamCheckResult.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => alert(`Interview details & location shared with ${nirbhayaStore.getContacts().length} trusted emergency contacts!`)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  Share Interview Details
                </button>

                <button
                  type="button"
                  onClick={handleScheduleCheckin}
                  className="bg-white text-slate-950 hover:bg-slate-100 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow"
                >
                  <Clock className="w-4 h-4 text-rose-600" />
                  Schedule Emergency Safety Check-in Timer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scheduled Check-in Timers & Auto-escalation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Interview Safety Timer</h2>
                <p className="text-xs text-slate-400">If check-in is missed, system escalates to SOS alert.</p>
              </div>
            </div>

            {activeTimerSeconds !== null && (
              <div className="bg-rose-600 text-white font-mono font-black text-sm px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                <Clock className="w-4 h-4" /> 00:{activeTimerSeconds < 10 ? '0' : ''}{activeTimerSeconds}
              </div>
            )}
          </div>

          {/* Active Check-in Timers List */}
          <div className="space-y-3">
            {checkins.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-xl">
                No active interview check-in timers configured. Analyze a job offer to schedule one.
              </div>
            ) : (
              checkins.map((ci) => {
                const isPending = ci.status === 'pending';
                const isMissed = ci.status === 'missed' || ci.status === 'escalated';

                return (
                  <div
                    key={ci.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isMissed
                        ? 'bg-rose-950/80 border-rose-600'
                        : isPending
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-emerald-950/60 border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Interview Safety Check-in</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            isMissed
                              ? 'bg-rose-600 text-white'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {ci.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Scheduled duration: {ci.duration_minutes} minutes
                        </div>
                      </div>

                      {isPending && (
                        <button
                          onClick={() => nirbhayaStore.updateCheckinStatus(ci.id, 'checked_in')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Safe Check-in
                        </button>
                      )}
                    </div>

                    {isMissed && (
                      <div className="bg-rose-900/60 text-rose-200 text-xs p-2 rounded border border-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        MISSED CHECK-IN DETECTED: Auto-escalated to SOS Session & Emergency Contacts Dispatched!
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
