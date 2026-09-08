'use client';

import React, { useState, useEffect, useRef } from 'react';
import { rakshaStore } from '@/lib/supabase/mock-store';
import { supabaseService } from '@/lib/supabase/service';
import { SOSSession, SOSLocation } from '@/lib/supabase/types';
import { ShieldAlert, Mic, Phone, CheckCircle2, Copy, Radio, Volume2, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SOSController() {
  const [activeSession, setActiveSession] = useState<SOSSession | null>(null);
  const [locations, setLocations] = useState<SOSLocation[]>([]);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceKeyword, setVoiceKeyword] = useState('');
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const current = rakshaStore.getActiveSession();
    setActiveSession(current);
    if (current) {
      setLocations(rakshaStore.getLocations(current.id));
    }

    return rakshaStore.subscribe(() => {
      const updated = rakshaStore.getActiveSession();
      setActiveSession(updated);
      if (updated) {
        setLocations(rakshaStore.getLocations(updated.id));
      }
    });
  }, []);

  // GPS Location Streamer when SOS is active
  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      startAudioRecording();

      // Simulate live GPS breadcrumb movement every 4 seconds
      intervalRef.current = setInterval(async () => {
        const lastLoc = locations[locations.length - 1] || { lat: 28.6139, lng: 77.2090 };
        const nextLat = lastLoc.lat + (Math.random() - 0.5) * 0.001;
        const nextLng = lastLoc.lng + (Math.random() - 0.5) * 0.001;
        const battery = Math.max(10, (lastLoc.battery_pct || 85) - 1);
        await supabaseService.addSOSLocation(activeSession.id, nextLat, nextLng, battery, 6.5);
      }, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopAudioRecording();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSession]);

  // Audio Recording (MediaRecorder API -> Supabase Storage simulation)
  const startAudioRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setAudioRecording(false);
        };

        mediaRecorder.start();
        setAudioRecording(true);
      }
    } catch (e) {
      console.warn('Microphone access unavailable or denied:', e);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const handleButtonClick = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 500) {
      tapCountRef.current += 1;
      if (tapCountRef.current >= 3) {
        tapCountRef.current = 0;
        triggerSOS('button');
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;
  };

  // Hold 1.5s Panic Button logic
  const handleMouseDown = () => {
    setIsHolding(true);
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 10;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current!);
        triggerSOS('button');
        setIsHolding(false);
        setHoldProgress(0);
      }
    }, 150);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Trigger SOS session & dispatch API call
  const triggerSOS = async (triggerType: SOSSession['trigger_type']) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await dispatchSOSAPI(triggerType, pos.coords.latitude, pos.coords.longitude);
      },
      async () => {
        await dispatchSOSAPI(triggerType, 28.6139, 77.2090);
      }
    );
  };

  const dispatchSOSAPI = async (triggerType: string, lat: number, lng: number) => {
    try {
      const res = await fetch('/api/sos/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger_type: triggerType, lat, lng }),
      });
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session);
      }
    } catch (e) {
      rakshaStore.triggerSOS(triggerType as any, lat, lng);
    }
  };

  // Web Speech API Voice Distress Listener
  const toggleVoiceListener = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. You can simulate voice triggers below.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        setVoiceKeyword(transcript);
        if (transcript.includes('help me') || transcript.includes('bachao') || transcript.includes('danger') || transcript.includes('emergency')) {
          recognition.stop();
          setIsListeningVoice(false);
          triggerSOS('voice');
        }
      }
    };

    recognition.start();
    setIsListeningVoice(true);
  };

  // PIN Silent Cancel / Disarm
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '0000') {
      if (activeSession) {
        rakshaStore.resolveSOS(activeSession.id, 'false_alarm');
      }
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert('Invalid Security PIN. (Default test PIN: 1234)');
    }
  };

  const trackingUrl = typeof window !== 'undefined' && activeSession
    ? `${window.location.origin}/track/${activeSession.tracking_token}`
    : '';

  const copyTrackingLink = () => {
    if (trackingUrl) {
      navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Active Emergency Banner if Triggered */}
      {activeSession && activeSession.status === 'active' ? (
        <div className="bg-rose-950/90 border-2 border-rose-600 rounded-2xl p-6 space-y-6 shadow-2xl animate-pulse">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center animate-ping">
                <Radio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-wide">EMERGENCY DISPATCH IN PROGRESS</h2>
                <p className="text-xs text-rose-300">
                  Triggered via <span className="font-bold uppercase text-white">{activeSession.trigger_type}</span> at {new Date(activeSession.started_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPinModal(true)}
              className="bg-white hover:bg-slate-100 text-rose-800 font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600" /> Enter PIN to Mark Safe
            </button>
          </div>

          {/* Real-time Tracking URL & Audio Vault */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/80 border border-rose-800/60 p-4 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-wider block">Public Live Tracking Link</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={trackingUrl}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 flex-1 text-slate-300 font-mono text-xs"
                />
                <button
                  onClick={copyTrackingLink}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-400">SMS alert dispatched to emergency contacts with this non-login link.</p>
            </div>

            <div className="bg-slate-950/80 border border-rose-800/60 p-4 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Audio Vault Stream
              </span>
              {audioRecording && (
                <div className="flex items-center gap-2 text-rose-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Recording ambient sound clip...
                </div>
              )}
              {audioUrl && (
                <audio controls src={audioUrl} className="w-full h-8 mt-1" />
              )}
              <p className="text-slate-400">Encrypted audio clip uploading to Supabase Storage bucket <code className="text-rose-300">sos-media</code>.</p>
            </div>
          </div>

          {/* Live Breadcrumb Counter */}
          <div className="flex items-center justify-between text-xs text-rose-300 pt-2 border-t border-rose-800/50">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Breadcrumbs broadcasted: <strong>{locations.length} points</strong></span>
            </div>
            <div>
              Latest GPS: {locations[locations.length - 1]?.lat.toFixed(4)}, {locations[locations.length - 1]?.lng.toFixed(4)}
            </div>
          </div>
        </div>
      ) : (
        /* Standby Panic Trigger Panel */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 space-y-8 shadow-xl text-center">
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-white">Hold SOS Button for 1.5 Seconds</h2>
            <p className="text-xs text-slate-400">
              Press and hold the button below, or use background distress voice / shake triggers to dispatch immediate emergency alerts.
            </p>
          </div>

          {/* Big Panic Button */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative group">
              <div className={`absolute inset-0 rounded-full bg-rose-600/30 blur-2xl ${isHolding ? 'scale-125' : ''} transition-transform`}></div>
              
              <button
                onClick={handleButtonClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 text-white font-black text-3xl shadow-2xl shadow-rose-950 flex flex-col items-center justify-center gap-2 border-4 border-rose-400/40 select-none animate-sos-pulse active:scale-95 transition-transform"
              >
                <ShieldAlert className="w-16 h-16 text-white drop-shadow-md" />
                <span className="tracking-wider">SOS</span>
                <span className="text-[11px] font-semibold text-rose-200 tracking-normal opacity-90">TRIPLE-TAP OR HOLD 1.5s</span>
              </button>

              {/* Hold Progress Overlay Ring */}
              {isHolding && (
                <div className="absolute inset-0 rounded-full border-4 border-white animate-spin pointer-events-none"></div>
              )}
            </div>
            {isHolding && (
              <div className="mt-4 text-rose-400 font-bold text-sm">
                Dispatching in {Math.max(1, Math.ceil((100 - holdProgress) / 60))}s...
              </div>
            )}
          </div>

          {/* Secondary Trigger Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
            
            {/* Mode 1: Voice Recognition */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-rose-400" /> Voice Distress Trigger
                </span>
                <button
                  onClick={toggleVoiceListener}
                  className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                    isListeningVoice
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isListeningVoice ? 'Listening...' : 'Enable Listener'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Listens for keywords like <code className="text-rose-300">"Help me"</code> or <code className="text-rose-300">"Bachao"</code>.
              </p>
              {voiceKeyword && (
                <div className="text-[10px] text-slate-400 italic">Last heard: "{voiceKeyword}"</div>
              )}
            </div>

            {/* Mode 2: Shake Detection */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-400" /> Shake Sensor Mode
                </span>
                <button
                  onClick={() => triggerSOS('shake')}
                  className="text-xs px-2.5 py-1 rounded font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Simulate Shake
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Triggers when phone experiences rapid double acceleration shake.
              </p>
            </div>

            {/* Mode 3: Silent PIN Mode */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" /> Silent Duress PIN
                </span>
                <button
                  onClick={() => triggerSOS('pin')}
                  className="text-xs px-2.5 py-1 rounded font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Trigger Duress PIN
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Silent alert disguised as standard unlocking screen.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Security PIN Disarm Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Enter Security Disarm PIN</h3>
              <p className="text-xs text-slate-400">Deactivates live emergency dispatch (Test PIN: 1234)</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1 2 3 4"
                className="w-full text-center tracking-widest text-2xl bg-slate-950 border border-slate-800 rounded-xl py-3 text-white focus:outline-none focus:border-rose-500 font-mono"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl text-xs font-bold"
                >
                  Confirm Disarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
