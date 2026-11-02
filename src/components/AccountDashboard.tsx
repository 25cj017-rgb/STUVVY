'use client';

import React, { useState } from 'react';
import { PlanOption } from './PricingSection';
import { SubscriptionCalendar, CalendarDay } from './SubscriptionCalendar';
import { UserProfile } from '../types';
import { 
  User, Calendar, CreditCard, MapPin, PauseCircle, PlayCircle, 
  RefreshCw, ShieldCheck, CheckCircle2, Clock, ChevronRight, AlertCircle, 
  ArrowLeft, Lock, Phone, Utensils, Sparkles, LogOut, Check, Bike, MessageSquare
} from 'lucide-react';

interface AccountDashboardProps {
  activePlan: PlanOption | null;
  onNavigateToPlans: () => void;
  savedCalendar?: CalendarDay[];
  user?: UserProfile;
  onLogout?: () => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({ 
  activePlan, 
  onNavigateToPlans,
  savedCalendar,
  user,
  onLogout
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Dietary Preferences State
  const [preferences, setPreferences] = useState({
    pureVeg: true,
    southIndian: true,
    lowGi: false,
    lessSpicy: true,
    jainNoGarlic: false
  });

  const currentUser = user && user.fullName ? user : {
    id: user?.id || 'usr_guest',
    fullName: user?.fullName || 'Guest Explorer',
    mobileNumber: user?.mobileNumber || '',
    dob: user?.dob || '',
    isVerified: !!user?.isVerified,
    beneficiaryStatus: 'Standard',
    dietaryPreferences: ['Pure Veg', 'South Indian Traditional'],
    allergyInfo: ['None'],
    address: user?.address || 'Address pending login'
  };

  const currentPlan = activePlan || {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 689,
    period: '/ week',
    billingText: 'Billed weekly',
    description: 'Active subscription for daily home meal delivery.',
    defaultDays: 7,
    ratePerDay: 98.43,
    features: []
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    setStatusMessage(isPaused ? 'Subscription resumed! Meals will arrive as scheduled.' : 'Subscription paused for upcoming delivery.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-[32px] border border-zinc-200/90 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white font-black text-xl flex items-center justify-center border-2 border-orange-500/80 shadow-md shrink-0">
            {currentUser.fullName ? currentUser.fullName.slice(0, 2).toUpperCase() : 'SR'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 font-heading tracking-tight">
                {currentUser.fullName}
              </h1>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Subscriber
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              📞 +91 {currentUser.mobileNumber} • {currentUser.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={onNavigateToPlans}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Change Plan
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors cursor-pointer"
              title="Log Out / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* LIVE ORDER TRACKING STATUS */}
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Today's Delivery Status • Order #STV-2026-882
              </div>
              <div className="text-base font-black text-zinc-950 font-heading">
                Chef Preparing Homely Meal (Hot & Fresh)
              </div>
            </div>
          </div>

          <div className="text-xs font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 self-start sm:self-auto">
            Est. Arrival: 12:45 PM
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {[
            { step: '1', title: 'Confirmed', done: true },
            { step: '2', title: 'Cooking', done: true, active: true },
            { step: '3', title: 'Eco Packed', done: false },
            { step: '4', title: 'Delivered', done: false },
          ].map((s, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className={`h-2 rounded-full ${
                s.done ? 'bg-orange-500' : s.active ? 'bg-orange-300 animate-pulse' : 'bg-zinc-200'
              }`} />
              <div className={`text-[11px] font-black ${s.done || s.active ? 'text-zinc-950' : 'text-zinc-400'}`}>
                {s.title}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-50 border border-zinc-200/70 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center text-xs font-black">
              M
            </div>
            <div>
              <span className="font-extrabold text-zinc-900">Delivery Partner Murugan</span>
              <span className="text-zinc-500 text-[11px] ml-1.5 block sm:inline">• For delivery questions, contact Administrator</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="tel:+919344795832" 
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Call Admin</span>
            </a>
            <a 
              href="https://wa.me/919344795832" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Active Subscription Banner */}
      <div className="bg-zinc-950 text-white rounded-[32px] p-6 sm:p-8 border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isPaused ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-400 text-zinc-950'
              }`}>
                {isPaused ? 'Subscription Paused' : 'Subscription Active & Paid'}
              </span>
              <span className="text-xs text-zinc-400 font-medium">Auto-renewing</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
              {currentPlan.name} (₹{currentPlan.price.toLocaleString('en-IN')}{currentPlan.period})
            </h2>

            <p className="text-xs text-zinc-400 font-medium mt-1">
              Next scheduled delivery: <strong className="text-white">Tomorrow, 12:30 PM (Lunch)</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleTogglePause}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                isPaused
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              }`}
            >
              {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
              <span>{isPaused ? 'Resume Plan' : 'Pause Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SAVED & PAID CALENDAR (LOCKED MODE) */}
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-zinc-950">
            <Lock className="w-4 h-4 text-orange-500" />
            <span>Saved Meal Calendar (Post-Payment Locked Schedule)</span>
          </div>

          <span className="text-[11px] text-zinc-400 font-medium">Emergency Changes via Admin</span>
        </div>

        <SubscriptionCalendar
          totalRangeDays={savedCalendar ? savedCalendar.length : (currentPlan.defaultDays || 7)}
          ratePerDay={currentPlan.ratePerDay || 98.43}
          isPaid={true}
          initialSelectedDays={savedCalendar}
        />
      </div>

      {/* DIETARY PREFERENCES CONTROLS */}
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Utensils className="w-4 h-4 text-orange-600" />
            <h3 className="text-base font-black font-heading text-zinc-950">
              Dietary Preferences & Health Customizations
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-black border border-emerald-200">
            Included Free
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { key: 'pureVeg', title: '100% Pure Vegetarian', desc: 'No eggs, strictly vegetarian kitchen utensils' },
            { key: 'southIndian', title: 'Traditional South Indian Flavor', desc: 'Authentic stone-ground sambar & rasam powders' },
            { key: 'lowGi', title: 'Low-GI / Diabetic Friendly', desc: 'Millets and unpolished brown rice substitutes' },
            { key: 'lessSpicy', title: 'Mild Spice Level', desc: 'Gentle on digestion, minimal black pepper/chili' },
          ].map((pref) => {
            const isChecked = (preferences as any)[pref.key];

            return (
              <div 
                key={pref.key}
                onClick={() => setPreferences(prev => ({ ...prev, [pref.key]: !isChecked }))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                  isChecked ? 'bg-orange-50/40 border-orange-300' : 'bg-zinc-50 border-zinc-200/80 hover:bg-zinc-100'
                }`}
              >
                <div>
                  <div className="font-extrabold text-zinc-900">{pref.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{pref.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ml-2 ${
                  isChecked ? 'bg-orange-500 text-white' : 'border border-zinc-300 bg-white'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
