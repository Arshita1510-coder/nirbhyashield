'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Bell, Bus, CheckCircle2, ChevronDown, Home, Navigation, Radio, ShieldAlert, ShieldCheck } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/sos', label: 'SOS Alert Engine', icon: ShieldAlert },
  { href: '/routes', label: 'Safe Routes', icon: Navigation },
  { href: '/transit', label: 'Transit Safety', icon: Bus },
  { href: '/scam-detector', label: 'Scam & Interview', icon: AlertTriangle },
];

const notifications = [
  { icon: ShieldAlert, title: 'New SOS Alert', time: '2 minutes ago', tone: 'text-rose-400' },
  { icon: Navigation, title: 'Route Deviation', time: '5 minutes ago', tone: 'text-amber-400' },
  { icon: CheckCircle2, title: 'Incident Resolved', time: '10 minutes ago', tone: 'text-emerald-400' },
];

const adminWorkspaceLinks = [
  { href: '/responder', label: 'Responder Hub', detail: 'Live safety response', icon: ShieldCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const closeMenus = () => { setIsNotificationsOpen(false); setIsUserMenuOpen(false); };

  const navLinks = (compact = false) => navItems.map((item) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link key={item.href} href={item.href} onClick={closeMenus}
        className={`flex items-center gap-1.5 rounded-lg whitespace-nowrap transition-colors ${compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-2.5 py-2 text-xs'} ${isActive ? 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30 font-semibold' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100 font-medium'}`}>
        <Icon className={compact ? 'h-3.5 w-3.5 shrink-0' : 'h-4 w-4 shrink-0'} />
        <span>{item.label}</span>
      </Link>
    );
  });

  return (
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

          <nav aria-label="Primary navigation" className="hidden 2xl:flex min-w-0 flex-1 items-center justify-center gap-0.5">{navLinks()}</nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="relative">
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

            <div className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /><span className="hidden md:inline">Realtime Connected</span><span className="md:hidden">Online</span></div>

            <div className="relative border-l border-slate-800 pl-1.5 sm:pl-2">
              <button type="button" aria-expanded={isUserMenuOpen} onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotificationsOpen(false); }} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300 ring-1 ring-inset ring-rose-500/30">AU</span>
                <span className="hidden leading-tight sm:block"><span className="block text-xs font-semibold text-slate-200">Admin User</span><span className="block text-[10px] text-slate-500">Safety Administrator</span></span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUserMenuOpen && <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 p-1.5 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-2 border-b border-slate-800 px-2.5 py-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300">AU</span>
                  <span><span className="block text-xs font-semibold text-slate-100">Admin User</span><span className="block text-[10px] text-slate-500">Safety Administrator</span></span>
                </div>
                <div className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Admin workspace</div>
                {adminWorkspaceLinks.map(({ href, label, detail, icon: Icon }) => <Link key={label} href={href} onClick={closeMenus} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-rose-400" /><span><span className="block text-xs font-medium">{label}</span><span className="block text-[10px] text-slate-500">{detail}</span></span>
                </Link>)}
              </div>}
            </div>
          </div>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="2xl:hidden flex gap-0.5 overflow-x-auto border-t border-slate-800/70 px-2 py-1.5 [scrollbar-width:none] sm:px-4">{navLinks(true)}</nav>
    </header>
  );
}
