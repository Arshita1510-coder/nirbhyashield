'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Bell, Bus, CheckCircle2, ChevronDown, Home, Navigation, ShieldAlert, ShieldCheck, Settings, LogOut } from 'lucide-react';
import ProfileSettingsModal from './ProfileSettingsModal';

const navItems = [
  { href: '/', label: 'Overview', icon: Home, badge: 'HUB' },
  { href: '/sos', label: 'SOS Alert Engine', icon: ShieldAlert, badge: 'LIVE' },
  { href: '/routes', label: 'Safe Routes', icon: Navigation, badge: 'GPS' },
  { href: '/transit', label: 'Transit Safety', icon: Bus, badge: 'AUTO' },
  { href: '/scam-detector', label: 'Scam & Interview', icon: AlertTriangle, badge: 'AI' },
];

const notifications = [
  { icon: ShieldAlert, title: 'New SOS Alert', time: '2 minutes ago', tone: 'text-rose-400' },
  { icon: Navigation, title: 'Route Deviation', time: '5 minutes ago', tone: 'text-amber-400' },
  { icon: CheckCircle2, title: 'Incident Resolved', time: '10 minutes ago', tone: 'text-emerald-400' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Refs for click-outside auto-close
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'profile' | 'security' | 'vault' | 'notifications'>('profile');

  // Auto-close dropdowns when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeMenus = () => { setIsNotificationsOpen(false); setIsUserMenuOpen(false); };

  const openSettingsModal = (tab: 'profile' | 'security' | 'vault' | 'notifications') => {
    setModalTab(tab);
    setIsSettingsOpen(true);
    closeMenus();
  };

  const navLinks = (compact = false) => navItems.map((item) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeMenus}
        className={`flex items-center gap-2 rounded-xl whitespace-nowrap transition-all ${
          compact ? 'px-3 py-1.5 text-xs font-semibold' : 'px-3.5 py-2 text-xs font-bold'
        } ${
          isActive
            ? 'bg-rose-500/15 text-rose-200 border border-rose-500/40 shadow-md shadow-rose-950/40 font-bold scale-[1.02]'
            : 'bg-slate-900/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800/90 hover:text-white hover:border-slate-700'
        }`}
      >
        <div className={`p-1 rounded-lg ${isActive ? 'bg-rose-500/25 text-rose-300' : 'bg-slate-800/60 text-slate-400'}`}>
          <Icon className={compact ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'} />
        </div>
        <span>{item.label}</span>
        {item.badge && !compact && (
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
            isActive ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  });

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="w-full px-3 sm:px-5 lg:px-6">
          <div className="flex min-h-[72px] items-center gap-3">
            <Link href="/" onClick={closeMenus} className="group flex shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 shadow-lg shadow-rose-900/40 transition-transform group-hover:scale-105"><ShieldAlert className="h-5 w-5 text-white" /></div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5 font-bold text-white"><span className="text-base">RakshaShield</span><span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">v2.0</span></div>
                <p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-500">Command Center</p>
              </div>
            </Link>

            <nav aria-label="Primary navigation" className="hidden lg:flex min-w-0 flex-1 items-center justify-center gap-1.5">{navLinks()}</nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="relative" ref={notificationsRef}>
                <button type="button" aria-label="Notifications" aria-expanded={isNotificationsOpen} onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsUserMenuOpen(false); }} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                  <Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-slate-950" />
                </button>
                {isNotificationsOpen && <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-slate-700/80 bg-slate-900 p-2 shadow-2xl shadow-black/40">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Notifications</div>
                  {notifications.map(({ icon: Icon, title, time, tone }) => <button key={title} type="button" onClick={() => setIsNotificationsOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-800">
                    <Icon className={`h-4 w-4 shrink-0 ${tone}`} /><span className="min-w-0"><span className="block text-xs font-medium text-slate-200">{title}</span><span className="block text-[10px] text-slate-500">{time}</span></span>
                  </button>)}
                </div>}
              </div>

              {/* USER PROFILE & SETTINGS DROPDOWN (TOP RIGHT) */}
              <div className="relative border-l border-slate-800 pl-1.5 sm:pl-2" ref={userMenuRef}>
                <button
                  type="button"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotificationsOpen(false); }}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-all hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700"
                >
                  <div className="relative">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-xs font-black text-white shadow-md shadow-rose-950/50 ring-1 ring-inset ring-rose-400/40">
                      AS
                    </span>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                  </div>

                  <span className="hidden leading-tight sm:block">
                    <span className="block text-xs font-bold text-slate-100">Arshita Sharma</span>
                    <span className="block text-[10px] font-semibold text-rose-400">Primary Guardian</span>
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 p-2 shadow-2xl shadow-black/60 animate-in fade-in duration-150">
                    
                    {/* User Profile Card Header */}
                    <div className="flex items-center gap-3 border-b border-slate-800 p-2.5 bg-slate-950/60 rounded-xl mb-1.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-xs font-extrabold text-white shadow-md">
                        AS
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-white truncate">Arshita Sharma</span>
                        <span className="block text-[10px] text-slate-400 truncate">arshita.sharma@rakshashield.org</span>
                      </div>
                    </div>

                    {/* 1. Profile Settings */}
                    <button
                      onClick={() => openSettingsModal('profile')}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-300 transition-all hover:bg-slate-800 hover:text-white text-left"
                    >
                      <Settings className="h-4 w-4 shrink-0 text-rose-400" />
                      <div>
                        <span className="block text-xs font-semibold">Profile Settings</span>
                        <span className="block text-[10px] text-slate-500">Duress PINs, voice & contacts</span>
                      </div>
                    </button>

                    {/* 2. Responder Page */}
                    <Link
                      href="/responder"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                      <div>
                        <span className="block text-xs font-semibold">Responder Page</span>
                        <span className="block text-[10px] text-slate-500">Live monitoring & emergency logs</span>
                      </div>
                    </Link>

                    {/* 3. Log Out */}
                    <div className="mt-1 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          alert('Session Locked. Re-authenticate via Supabase Auth.');
                          closeMenus();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-rose-400 transition-all hover:bg-rose-950/60 hover:text-rose-300 text-left"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold">Log Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="lg:hidden flex gap-1.5 overflow-x-auto border-t border-slate-800/70 px-3 py-2 [scrollbar-width:none] sm:px-4">{navLinks(true)}</nav>
      </header>

      {/* Render Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
}
