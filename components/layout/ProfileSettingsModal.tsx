'use client';

import React, { useState } from 'react';
import { User, Shield, Key, Bell, Volume2, Save, X, CheckCircle2, Lock, Radio, Smartphone, Mic, HeartPulse, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'security' | 'vault' | 'notifications';
}

export default function ProfileSettingsModal({ isOpen, onClose, initialTab = 'profile' }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'vault' | 'notifications'>(initialTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('Arshita Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('arshita.sharma@rakshashield.org');
  const [medicalNotes, setMedicalNotes] = useState('Blood Group: O+ | No known drug allergies');
  const [homeAddress, setHomeAddress] = useState('Connaught Place, New Delhi');

  // Security States
  const [safePin, setSafePin] = useState('1234');
  const [duressPin, setDuressPin] = useState('0000');
  const [voiceKeyword, setVoiceKeyword] = useState('Raksha Help');
  const [shakeSensitivity, setShakeSensitivity] = useState('high');

  // Vault & Dispatch States
  const [audioBufferMins, setAudioBufferMins] = useState('3');
  const [rlsTokenExpiryHours, setRlsTokenExpiryHours] = useState('24');
  const [autoSmsDispatch, setAutoSmsDispatch] = useState(true);

  // Notification States
  const [alarmVolume, setAlarmVolume] = useState(80);
  const [vibrationAlert, setVibrationAlert] = useState(true);
  const [routeDeviationAlerts, setRouteDeviationAlerts] = useState(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-rose-950/20 text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Profile & Safety Preferences</h2>
              <p className="text-[11px] text-slate-400">Manage user profile, silent duress PINs, and emergency dispatch settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[420px]">
          
          {/* Navigation Tabs (Left Sidebar) */}
          <div className="bg-slate-950/40 border-r border-slate-800 p-3 space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4 text-rose-400" /> User Profile
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4 text-amber-400" /> Duress & PIN
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'vault'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" /> Audio & Vault
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4 text-cyan-400" /> Alerts & Siren
            </button>
          </div>

          {/* Form Body (Right Main Panel) */}
          <form onSubmit={handleSave} className="md:col-span-3 p-6 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4 text-xs">
              
              {/* TAB 1: USER PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-base flex items-center justify-center border border-rose-500/40">
                      AS
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{fullName}</div>
                      <div className="text-[11px] text-slate-400">{email}</div>
                      <span className="inline-block mt-1 text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-semibold">
                        ● Guardian Account Verified
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Primary Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Medical & Emergency Notes
                    </label>
                    <input
                      type="text"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Blood group, allergies, emergency info..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" /> Default Home Location
                    </label>
                    <input
                      type="text"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DURESS & PIN SAFETY */}
              {activeTab === 'security' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-[11px] text-amber-200 space-y-1">
                    <strong className="text-amber-400 flex items-center gap-1 font-bold">
                      <Lock className="w-3.5 h-3.5" /> Duress False PIN Safety Feature
                    </strong>
                    <p>
                      If forced by an aggressor to disable an active SOS alert, enter your Silent Duress PIN (<code className="text-amber-300 font-bold">{duressPin}</code>). The UI will pretend to cancel the alarm, but silent GPS dispatch will continue in secret!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Normal Safe Cancellation PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={safePin}
                        onChange={(e) => setSafePin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500 text-center text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-amber-400 font-bold">Silent Duress Panic PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={duressPin}
                        onChange={(e) => setDuressPin(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-amber-300 font-mono tracking-widest focus:outline-none focus:border-amber-500 text-center text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-rose-400" /> Custom Hands-Free Voice Trigger Keyword
                    </label>
                    <input
                      type="text"
                      value={voiceKeyword}
                      onChange={(e) => setVoiceKeyword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Saying "{voiceKeyword}" near phone triggers immediate emergency dispatch.</span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Phone Shake Panic Sensitivity
                    </label>
                    <select
                      value={shakeSensitivity}
                      onChange={(e) => setShakeSensitivity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="high">High Sensitivity (3 Quick Shakes)</option>
                      <option value="medium">Medium Sensitivity (5 Shakes)</option>
                      <option value="low">Low Sensitivity (Vigorous Shaking)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIO & MEDIA VAULT */}
              {activeTab === 'vault' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-[11px] text-emerald-200">
                    <strong className="text-emerald-400 flex items-center gap-1 font-bold">
                      <Shield className="w-3.5 h-3.5" /> Supabase Storage & Encrypted Vault
                    </strong>
                    <p className="mt-1 text-slate-300">
                      Ambient microphone audio recorded during panic triggers is buffered securely to Supabase Media Vault. Access is locked with tokenized RLS signatures.
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Ambient Audio Stream Duration per Chunk</label>
                    <select
                      value={audioBufferMins}
                      onChange={(e) => setAudioBufferMins(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1">1 Minute Continuous Chunks</option>
                      <option value="3">3 Minutes Continuous Chunks (Recommended)</option>
                      <option value="5">5 Minutes Continuous Chunks</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Emergency Tracking Token RLS Validity</label>
                    <select
                      value={rlsTokenExpiryHours}
                      onChange={(e) => setRlsTokenExpiryHours(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="12">12 Hours Token Expiry</option>
                      <option value="24">24 Hours Token Expiry (Default)</option>
                      <option value="48">48 Hours Token Expiry</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <div className="font-bold text-white">Automated Emergency SMS Dispatch</div>
                      <div className="text-[10px] text-slate-400">Instantly SMS tracking link to all verified contacts when panic is triggered</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSmsDispatch}
                      onChange={(e) => setAutoSmsDispatch(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: ALERTS & NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-rose-400" /> Loud Emergency Alarm Siren Volume</span>
                      <span className="font-mono text-rose-400 font-bold">{alarmVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={alarmVolume}
                      onChange={(e) => setAlarmVolume(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <div className="font-bold text-white">Haptic Vibration Countdown</div>
                      <div className="text-[10px] text-slate-400">Vibrate phone continuously during 3-second SOS cancellation window</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vibrationAlert}
                      onChange={(e) => setVibrationAlert(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div>
                      <div className="font-bold text-white">Route Deviation Monitor Push Alerts</div>
                      <div className="text-[10px] text-slate-400">Alert user if walking &gt;120m off safe illuminated path</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={routeDeviationAlerts}
                      onChange={(e) => setRouteDeviationAlerts(e.target.checked)}
                      className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer / Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved Preferences!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Preferences
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
