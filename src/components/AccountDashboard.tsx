'use client';

import React, { useState } from 'react';
import { PlanOption } from './PricingSection';
import { SubscriptionCalendar, CalendarDay } from './SubscriptionCalendar';
import { UserProfile } from '../types';
import { StuvvyCard } from './StuvvyCard';
import { StuvvyStarRewards } from './StuvvyStarRewards';
import { calculateSubscriptionSchedule } from '../utils/subscriptionUtils';
import { 
  User, Calendar, CreditCard, MapPin, PauseCircle, PlayCircle, 
  RefreshCw, ShieldCheck, CheckCircle2, Clock, ChevronRight, AlertCircle, 
  ArrowLeft, Lock, Phone, Utensils, Sparkles, LogOut, Check, MessageSquare,
  Award, Gift, Star, CalendarRange, Timer
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

  const currentUser: UserProfile = user && user.fullName ? user : {
    id: user?.id || 'usr_guest',
    fullName: user?.fullName || 'Yamuna J N',
    mobileNumber: user?.mobileNumber || '9626531680',
    dob: user?.dob || '',
    isVerified: !!user?.isVerified,
    beneficiaryStatus: 'Standard',
    dietaryPreferences: ['Pure Veg', 'South Indian Traditional'],
    allergyInfo: ['None'],
    address: user?.address || 'Saravanampatti, Coimbatore, Tamil Nadu 641035',
    addresses: user?.addresses,
    selectedAddress: user?.selectedAddress,
    startDate: user?.startDate || '11/1/2026',
    purchaseDate: user?.purchaseDate || '10/29/2026 22:03:21',
    plan: user?.plan || 'Monthly'
  };

  const [activeAddress, setActiveAddress] = useState<string>(
    currentUser.selectedAddress || currentUser.address || (currentUser.addresses && currentUser.addresses[0]) || ''
  );

  const currentPlan = activePlan || {
    id: currentUser.plan?.toLowerCase() || 'monthly',
    name: currentUser.plan ? `${currentUser.plan.toUpperCase()} PLAN` : 'Monthly Plan',
    price: currentUser.plan?.toLowerCase().includes('week') ? 689 : (currentUser.plan?.toLowerCase().includes('day') ? 99 : 2500),
    period: currentUser.plan?.toLowerCase().includes('week') ? '/ week' : (currentUser.plan?.toLowerCase().includes('day') ? '/ day' : '/ month'),
    billingText: 'Billed periodically',
    description: 'Active subscription for wholesome daily home meals.',
    defaultDays: currentUser.plan?.toLowerCase().includes('week') ? 7 : (currentUser.plan?.toLowerCase().includes('day') ? 1 : 30),
    ratePerDay: 98.43,
    features: []
  };

  // Calculate Schedule Logic (Start Date, End Date, Remaining Days, Status)
  const schedule = calculateSubscriptionSchedule(
    currentUser.startDate,
    currentUser.purchaseDate,
    currentUser.plan || currentPlan.name
  );

  // Extract Initials (e.g. "Yamuna J N" -> "Y J N")
  const initials = currentUser.fullName
    ? currentUser.fullName
        .trim()
        .split(/\s+/)
        .map(w => w[0]?.toUpperCase())
        .filter(Boolean)
        .join(' ')
    : 'Y';

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    setStatusMessage(isPaused ? 'Subscription resumed! Meals will arrive as scheduled.' : 'Subscription paused for upcoming delivery.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 select-none">
      
      {/* ======================================================== */}
      {/* 1. USER PROFILE CARD (PHOTO, NAME, STATUS, LOCATION)    */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-zinc-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* PROFILE PHOTO / AVATAR WITH INITIALS */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-zinc-950 text-white font-black text-2xl flex items-center justify-center border-3 border-orange-500 shadow-xl overflow-hidden">
                <img
                  src="/user-avatar.jpg"
                  alt={currentUser.fullName}
                  onError={(e) => {
                    // Fallback to initials if avatar fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center font-black text-2xl bg-zinc-950 text-white">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* SUBSCRIBER ESSENTIAL DETAILS */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-heading tracking-tight">
                  {currentUser.fullName}
                </h1>
                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  ✓ {schedule.status} Subscriber
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold flex-wrap">
                <span>Initials: <strong className="text-zinc-900 font-black">{initials}</strong></span>
                <span>•</span>
                <span>📞 +91 {currentUser.mobileNumber}</span>
              </div>

              {/* Delivery Address Selector if user has multiple locations */}
              {currentUser.addresses && currentUser.addresses.length > 1 ? (
                <div className="pt-1.5 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600" />
                    <span>Select Active Delivery Location:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.addresses.map((locAddr, idx) => {
                      const isSelected = activeAddress.trim() === locAddr.trim();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveAddress(locAddr);
                            setStatusMessage(`Delivery location switched to Location ${idx + 1}`);
                            setTimeout(() => setStatusMessage(''), 3000);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase">Loc {idx + 1}:</span>
                          <span className="max-w-[220px] truncate">{locAddr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 font-medium flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate max-w-md">{activeAddress || currentUser.address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              onClick={onNavigateToPlans}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs"
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
      </div>

      {statusMessage && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUBSCRIPTION DATES & SCHEDULE BREAKDOWN               */}
      {/* ======================================================== */}
      <div className="bg-zinc-950 text-white rounded-[32px] p-6 sm:p-8 border border-zinc-900 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full ${
                isPaused ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-400 text-zinc-950'
              }`}>
                {isPaused ? 'Subscription Paused' : `${schedule.status.toUpperCase()} & PAID`}
              </span>
              <span className="text-xs text-zinc-400 font-medium">Daily Kitchen Priority</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
              {currentUser.plan?.toUpperCase() || currentPlan.name} (₹{currentPlan.price.toLocaleString('en-IN')}{currentPlan.period})
            </h2>

            <p className="text-xs text-zinc-400 font-medium mt-1">
              {schedule.statusMessage}
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
              <span>{isPaused ? 'Resume Meals' : 'Pause Meals'}</span>
            </button>
          </div>
        </div>

        {/* 4-METRIC GRID: PURCHASE DATE, START DATE, END DATE, REMAINING DAYS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80 relative z-10 text-xs">
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Purchase Date</span>
            </div>
            <div className="font-black text-white text-base mt-1">{schedule.purchaseDateStr}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Payment Verified</div>
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-orange-400" />
              <span>Delivery Start Date</span>
            </div>
            <div className="font-black text-orange-400 text-base mt-1">{schedule.startDateStr}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Selected First Meal</div>
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Subscription End Date</span>
            </div>
            <div className="font-black text-white text-base mt-1">{schedule.endDateStr}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{schedule.durationDays}-Day Period</div>
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Remaining Days</span>
            </div>
            <div className="font-black text-emerald-400 text-base mt-1">{schedule.remainingDays} Days</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{schedule.progressPercent}% of cycle active</div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1.5 pt-1 relative z-10">
          <div className="flex justify-between text-[11px] font-bold text-zinc-400">
            <span>Cycle Progress ({schedule.elapsedDays} of {schedule.durationDays} days completed)</span>
            <span className="text-white font-black">{schedule.progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-emerald-400 h-2 rounded-full transition-all duration-700"
              style={{ width: `${schedule.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DOWNLOAD YOUR STUVVY SUBSCRIBER CARD                  */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black font-heading text-zinc-950 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <span>Digital Stuvvy Subscriber Card</span>
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Your official digital subscription pass with QR code verification.
            </p>
          </div>
        </div>

        <StuvvyCard
          fullName={currentUser.fullName}
          mobileNumber={currentUser.mobileNumber}
          planName={currentUser.plan ? `${currentUser.plan} Plan` : currentPlan.name}
          startDateStr={schedule.startDateStr}
          endDateStr={schedule.endDateStr}
          status={schedule.status}
          location={activeAddress || currentUser.address || 'Saravanampatti, Coimbatore'}
          avatarUrl="/user-avatar.jpg"
        />
      </div>

      {/* ======================================================== */}
      {/* 4. STUVVY STAR REWARDS & SPECIAL MONTHLY OFFER (12 STARS) */}
      {/* ======================================================== */}
      <StuvvyStarRewards
        consecutiveMonths={currentUser.consecutiveMonths || 1}
        planName={currentUser.plan || currentPlan.name}
      />

      {/* ======================================================== */}
      {/* 5. SAVED & PAID CALENDAR (POST-PAYMENT SCHEDULE)         */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-zinc-950">
            <Lock className="w-4 h-4 text-orange-500" />
            <span>Saved Meal Delivery Schedule</span>
          </div>

          <span className="text-[11px] text-zinc-400 font-medium">Valid {schedule.startDateStr} – {schedule.endDateStr}</span>
        </div>

        <SubscriptionCalendar
          totalRangeDays={savedCalendar ? savedCalendar.length : (currentPlan.defaultDays || 7)}
          ratePerDay={currentPlan.ratePerDay || 98.43}
          isPaid={true}
          startDate={currentUser.startDate}
          initialSelectedDays={savedCalendar}
        />
      </div>

      {/* ======================================================== */}
      {/* 6. DIETARY PREFERENCES & HEALTH CUSTOMIZATIONS          */}
      {/* ======================================================== */}
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
