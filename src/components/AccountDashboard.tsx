'use client';

import React, { useState, useEffect } from 'react';
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
  Award, Gift, Star, CalendarRange, Timer, UserCheck, LogIn, Eye, ChevronLeft,
  Mail, ShieldAlert
} from 'lucide-react';

interface AccountDashboardProps {
  activePlan: PlanOption | null;
  onNavigateToPlans: () => void;
  savedCalendar?: CalendarDay[];
  user?: UserProfile;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
  isGuestUser?: boolean;
}

type AccountSubScreen = 'menu' | 'stuvvy-cards' | 'calendar' | 'rewards' | 'schedule' | 'preferences' | 'support';

export const AccountDashboard: React.FC<AccountDashboardProps> = ({ 
  activePlan, 
  onNavigateToPlans,
  savedCalendar,
  user,
  onLogout,
  onOpenLoginModal,
  isGuestUser = false
}) => {
  const [activeScreen, setActiveScreen] = useState<AccountSubScreen>('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Emergency contact modal / request
  const [adminNote, setAdminNote] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Dietary Preferences State
  const [preferences, setPreferences] = useState({
    pureVeg: true,
    southIndian: true,
    lowGi: false,
    lessSpicy: true,
    jainNoGarlic: false
  });

  // Hash change detection (e.g. from navbar "Stuvvy Card" button)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash.includes('stuvvy-card')) {
          setActiveScreen('stuvvy-cards');
        } else if (hash.includes('calendar')) {
          setActiveScreen('calendar');
        } else if (hash.includes('rewards')) {
          setActiveScreen('rewards');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const isVerifiedSubscriber = 
    !isGuestUser && 
    !!user?.fullName && 
    user.fullName.toLowerCase() !== 'guest explorer' && 
    user.fullName.trim() !== '';

  // =========================================================================
  // 1. GUEST EXPLORER VIEW (WHEN USER HAS NOT LOGGED IN OR IS EXPLORING)
  // =========================================================================
  if (!isVerifiedSubscriber) {
    return (
      <div className="py-6 sm:py-8 w-full max-w-7xl mx-auto px-4 sm:px-6 sm:px-8 space-y-6 select-none">
        
        {/* GUEST PROFILE HEADER */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-zinc-100 text-zinc-900 font-black text-2xl flex items-center justify-center border-2 border-zinc-200 shadow-inner shrink-0">
              <Eye className="w-8 h-8 text-zinc-500" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-heading tracking-tight">
                  Guest Explorer
                </h1>
                <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-zinc-200">
                  Preview Mode
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                You are currently browsing Stuvvy as a guest. No active subscription is attached to this session.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            {onOpenLoginModal && (
              <button
                onClick={onOpenLoginModal}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-400" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* 2 CALL-TO-ACTION CARDS FOR GUESTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[28px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-heading text-zinc-950">
                Already Subscribed to Stuvvy?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                If you have registered via our Google Form or admin hotline, log in with your Full Name and Mobile Number to view your active delivery schedule, access your digital Stuvvy Card, and track your Star Rewards.
              </p>
            </div>

            {onOpenLoginModal && (
              <button
                onClick={onOpenLoginModal}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-orange-400" />
                <span>Subscriber Log In</span>
              </button>
            )}
          </div>

          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[28px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black font-heading text-zinc-950">
                Looking to Start a Subscription?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Subscribe to our wholesome Daily, Weekly, or Monthly meal plans in Coimbatore. Enjoy authentic stone-ground recipes with zero preservatives delivered hot to your doorstep.
              </p>
            </div>

            <button
              onClick={onNavigateToPlans}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Explore Subscription Plans</span>
            </button>
          </div>
        </div>

        {/* ADMIN HOTLINE SUPPORT CARD */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-zinc-900">
            <Phone className="w-4 h-4 text-orange-500" />
            <span>Need Help or Custom Group Meals?</span>
          </div>
          <p className="text-xs text-zinc-500">
            Call our Kitchen Admin at <strong className="text-zinc-900">+91 9344795832</strong> or chat via WhatsApp for instant registration assistance.
          </p>
        </div>

      </div>
    );
  }

  // =========================================================================
  // 2. VERIFIED SUBSCRIBER VIEW (SHOWN ONLY WHEN USER IS LOGGED IN)
  // =========================================================================
  const currentUser: UserProfile = user;

  const [activeAddress, setActiveAddress] = useState<string>(
    currentUser.selectedAddress || currentUser.address || (currentUser.addresses && currentUser.addresses[0]) || ''
  );

  // Strictly resolve the exact subscription plan the user opted for from Google Sheets
  const rawPlan = (currentUser.plan || '').trim().toLowerCase();
  
  let optedPlanName = 'Monthly Plan';
  let optedPlanPrice = 2500;
  let optedPlanPeriod = '/ month';
  let optedPlanDefaultDays = 30;

  if (rawPlan.includes('day') || rawPlan.includes('daily')) {
    optedPlanName = 'Daily Plan';
    optedPlanPrice = currentUser.paymentAmount ? parseInt(currentUser.paymentAmount.replace(/\D/g, '')) || 99 : 99;
    optedPlanPeriod = '/ day';
    optedPlanDefaultDays = 1;
  } else if (rawPlan.includes('week')) {
    optedPlanName = 'Weekly Plan';
    optedPlanPrice = currentUser.paymentAmount ? parseInt(currentUser.paymentAmount.replace(/\D/g, '')) || 689 : 689;
    optedPlanPeriod = '/ week';
    optedPlanDefaultDays = 7;
  } else if (rawPlan.includes('month')) {
    optedPlanName = 'Monthly Plan';
    optedPlanPrice = currentUser.paymentAmount ? parseInt(currentUser.paymentAmount.replace(/\D/g, '')) || 2500 : 2500;
    optedPlanPeriod = '/ month';
    optedPlanDefaultDays = 30;
  } else if (activePlan) {
    optedPlanName = activePlan.name;
    optedPlanPrice = activePlan.price;
    optedPlanPeriod = activePlan.period;
    optedPlanDefaultDays = activePlan.defaultDays;
  }

  const currentPlan = {
    id: optedPlanName.toLowerCase().replace(/\s+/g, '-'),
    name: optedPlanName,
    price: optedPlanPrice,
    period: optedPlanPeriod,
    billingText: 'Billed as opted in registration',
    description: `Active ${optedPlanName} for wholesome daily home meals.`,
    defaultDays: optedPlanDefaultDays,
    ratePerDay: optedPlanDefaultDays === 1 ? 99 : 98.43,
  };

  // Calculate Schedule Logic (Start Date, End Date, Remaining Days, Status)
  const schedule = calculateSubscriptionSchedule(
    currentUser.startDate,
    currentUser.purchaseDate,
    optedPlanName
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

  const handleSendAdminSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setAdminNote('');
      setStatusMessage('Support request received! Kitchen admin will reach out shortly.');
      setTimeout(() => setStatusMessage(''), 4000);
    }, 1500);
  };

  // Title dictionary for sub-screen header
  const screenTitles: Record<AccountSubScreen, string> = {
    menu: 'My Account',
    'stuvvy-cards': 'Stuvvy Cards',
    calendar: 'Monthly Delivery Calendar',
    rewards: 'Stuvvy 12-Star Rewards',
    schedule: 'Subscription Schedule',
    preferences: 'Dietary Preferences',
    support: 'Kitchen Admin & Support'
  };

  return (
    <div className="py-6 sm:py-8 w-full max-w-7xl mx-auto px-4 sm:px-6 sm:px-8 space-y-6 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP PROFILE CARD (KEPT AS IT IS)                                       */}
      {/* ========================================================================= */}
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
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-SCREEN NAVIGATION BAR (WHEN USER HAS CLICKED AN OPTION)            */}
      {/* ========================================================================= */}
      {activeScreen !== 'menu' && (
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-zinc-200 shadow-xs">
          <button
            onClick={() => setActiveScreen('menu')}
            className="inline-flex items-center gap-2 text-xs font-black text-purple-900 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-purple-200"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>← Back to My Account</span>
          </button>

          <div className="text-xs font-semibold text-zinc-400">
            My Account &nbsp;/&nbsp; <strong className="text-zinc-950 font-black">{screenTitles[activeScreen]}</strong>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VERTICAL NAVIGATION MENU (MAIN ACCOUNT VIEW)                           */}
      {/* ========================================================================= */}
      {activeScreen === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black font-heading text-zinc-950 uppercase tracking-wider">
              Account Features & Services
            </h2>
            <span className="text-xs font-bold text-zinc-400">
              Select an option to view details
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-4 sm:p-5 shadow-sm divide-y divide-zinc-100">
            
            {/* OPTION 1: STUVVY CARDS */}
            <button
              type="button"
              onClick={() => setActiveScreen('stuvvy-cards')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-ostrich text-2xl font-black text-purple-950 tracking-wider">
                      Stuvvy Cards
                    </span>
                    <span className="text-[9.5px] font-black uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Active Pass
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Official ATM-style digital subscription pass & subscriber cardholder ID
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  View Card
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 2: MONTHLY DELIVERY CALENDAR & TRACKING */}
            <button
              type="button"
              onClick={() => setActiveScreen('calendar')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-emerald-200">
                  <Calendar className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-ostrich text-2xl font-black text-purple-950 tracking-wider">
                      Monthly Delivery Calendar
                    </span>
                    <span className="text-[9.5px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      1st to 30th Tracking
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Full monthly view, delivered food strike-throughs, mid-month handling & month history
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  View Calendar
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 3: STUVVY 12-STAR REWARDS */}
            <button
              type="button"
              onClick={() => setActiveScreen('rewards')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-amber-200">
                  <Star className="w-6 h-6 text-amber-600 fill-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-ostrich text-2xl font-black text-purple-950 tracking-wider">
                      Stuvvy 12-Star Rewards
                    </span>
                    <span className="text-[9.5px] font-black uppercase bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                      4th Month Free Offer
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Subscribe for 3 consecutive months to unlock your 4th Month of food 100% Free
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  View Stars
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 4: SUBSCRIPTION SCHEDULE & MEAL PAUSE */}
            <button
              type="button"
              onClick={() => setActiveScreen('schedule')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-purple-200">
                  <Clock className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-ostrich text-2xl font-black text-purple-950 tracking-wider">
                      Subscription Schedule & Plan
                    </span>
                    <span className="text-[9.5px] font-black uppercase bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200">
                      {schedule.remainingDays} Days Left
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Start & end dates, cycle progress percentage and meal pause control
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  View Schedule
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 5: DIETARY PREFERENCES */}
            <button
              type="button"
              onClick={() => setActiveScreen('preferences')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-orange-200">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-ostrich text-2xl font-black text-purple-950 tracking-wider">
                      Dietary Preferences & Health
                    </span>
                    <span className="text-[9.5px] font-black uppercase bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Included Free
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    100% Pure Veg, South Indian stone-ground spices, Low-GI & mild chili options
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  Customize
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 6: KITCHEN ADMIN & HOTLINE HELP */}
            <button
              type="button"
              onClick={() => setActiveScreen('support')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-blue-200">
                  <Phone className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-ostrich text-2xl font-black text-purple-950 tracking-wider">
                      Kitchen Admin & Hotline Help
                    </span>
                    <span className="text-[9.5px] font-black uppercase bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Direct Support
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Direct phone & WhatsApp hotline with kitchen manager for custom requests
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  Contact
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-SCREEN: STUVVY CARDS                                               */}
      {/* ========================================================================= */}
      {activeScreen === 'stuvvy-cards' && (
        <div id="stuvvy-card-section" className="space-y-4">
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-purple-700" />
                  <span>Digital Stuvvy Subscriber Card</span>
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  Your official compact ATM-style subscriber pass. Valid for your subscription period.
                </p>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-center">
                Member ID Verified
              </span>
            </div>

            {/* ATM-STYLE STUVVY CARD */}
            <StuvvyCard
              fullName={currentUser.fullName}
              mobileNumber={currentUser.mobileNumber}
              planName={optedPlanName}
              startDateStr={schedule.startDateStr}
              endDateStr={schedule.endDateStr}
              status={schedule.status}
              avatarUrl="/user-avatar.jpg"
            />

            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-purple-950 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <span>
                <strong>Subscriber Pass:</strong> This digital pass verifies your daily meal subscription with the Stuvvy central kitchen in Coimbatore.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-SCREEN: MONTHLY DELIVERY CALENDAR & TRACKING                       */}
      {/* ========================================================================= */}
      {activeScreen === 'calendar' && (
        <div className="space-y-4">
          <SubscriptionCalendar
            totalRangeDays={schedule.durationDays}
            ratePerDay={currentPlan.ratePerDay}
            isPaid={true}
            startDate={currentUser.startDate}
            endDate={schedule.endDateStr}
            planName={optedPlanName}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-SCREEN: STUVVY 12-STAR REWARDS                                     */}
      {/* ========================================================================= */}
      {activeScreen === 'rewards' && (
        <div className="space-y-4">
          <StuvvyStarRewards
            consecutiveMonths={currentUser.consecutiveMonths || 1}
            planName={optedPlanName}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SUB-SCREEN: SUBSCRIPTION SCHEDULE & MEAL PAUSE                         */}
      {/* ========================================================================= */}
      {activeScreen === 'schedule' && (
        <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span 
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#F2CAE2]"
                  style={{
                    background: '#F2CAE2',
                    color: '#24044A'
                  }}
                >
                  {isPaused ? 'Subscription Paused' : `${schedule.status.toUpperCase()} & PAID`}
                </span>
                <span className="text-xs font-bold text-zinc-500">Daily Kitchen Priority</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
                {optedPlanName.toUpperCase()} (₹{optedPlanPrice.toLocaleString('en-IN')}{optedPlanPeriod})
              </h2>

              <p className="text-xs text-zinc-500 font-medium mt-1">
                {schedule.statusMessage}
              </p>
            </div>

            <button
              onClick={handleTogglePause}
              className="px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-2xs cursor-pointer border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 self-start sm:self-center"
            >
              {isPaused ? <PlayCircle className="w-4 h-4 text-emerald-600" /> : <PauseCircle className="w-4 h-4 text-purple-700" />}
              <span>{isPaused ? 'Resume Meals' : 'Pause Meals'}</span>
            </button>
          </div>

          {/* 4-METRIC GRID: PURCHASE DATE, START DATE, END DATE, REMAINING DAYS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-100 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
              <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-zinc-500">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Purchase Date</span>
              </div>
              <div className="font-black text-zinc-900 text-base mt-1">{schedule.purchaseDateStr}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Payment Verified</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80">
              <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-800">
                <CalendarRange className="w-3.5 h-3.5 text-purple-700" />
                <span>Delivery Start Date</span>
              </div>
              <div className="font-black text-purple-950 text-base mt-1">{schedule.startDateStr}</div>
              <div className="text-[10px] text-purple-600 mt-0.5">Selected First Meal</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
              <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-zinc-500">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Subscription End Date</span>
              </div>
              <div className="font-black text-zinc-900 text-base mt-1">{schedule.endDateStr}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{schedule.durationDays}-Day Period</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80">
              <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-zinc-500">
                <Timer className="w-3.5 h-3.5 text-purple-600" />
                <span>Remaining Days</span>
              </div>
              <div className="font-black text-zinc-900 text-base mt-1">{schedule.remainingDays} Days</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{schedule.progressPercent}% of cycle active</div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-bold text-zinc-600">
              <span>Cycle Progress ({schedule.elapsedDays} of {schedule.durationDays} days completed)</span>
              <span className="text-zinc-900 font-black">{schedule.progressPercent}%</span>
            </div>
            <div className="w-full rounded-full h-2.5 overflow-hidden bg-zinc-100 border border-zinc-200">
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${schedule.progressPercent}%`,
                  background: 'linear-gradient(90deg, #6A13F5 0%, #A855F7 100%)'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SUB-SCREEN: DIETARY PREFERENCES                                        */}
      {/* ========================================================================= */}
      {activeScreen === 'preferences' && (
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
      )}

      {/* ========================================================================= */}
      {/* 9. SUB-SCREEN: KITCHEN ADMIN & HOTLINE SUPPORT                            */}
      {/* ========================================================================= */}
      {activeScreen === 'support' && (
        <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-heading text-zinc-950">
                Kitchen Admin & Helpline
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Direct contact channels for Coimbatore meal delivery coordination
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Phone Hotline</span>
                  <span className="font-extrabold text-zinc-900 text-sm">+91 9344795832</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href="tel:+919344795832"
                  className="px-3 py-1.5 bg-zinc-950 text-white font-bold rounded-xl text-xs hover:bg-zinc-800 transition-colors"
                >
                  Call
                </a>
                <a
                  href="https://wa.me/919344795832"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Admin Desk Email</span>
                  <span className="font-extrabold text-zinc-900 text-sm">orders@stuvvy.in</span>
                </div>
              </div>
              <a
                href="mailto:orders@stuvvy.in?subject=Subscription%20Assistance"
                className="px-3 py-1.5 bg-zinc-900 text-white font-bold rounded-xl text-xs hover:bg-zinc-800 transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>

          <form onSubmit={handleSendAdminSupport} className="space-y-3 pt-3 border-t border-zinc-100">
            <label className="block text-xs font-bold text-zinc-800">
              Submit Direct Note to Kitchen Admin:
            </label>
            <textarea
              rows={3}
              required
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Please add extra sambar tomorrow, or pause delivery on Friday..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            />

            {requestSent ? (
              <div className="bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Message Received! Admin will call or WhatsApp you shortly.</span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full sm:w-auto px-6 bg-purple-900 hover:bg-purple-950 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Note to Kitchen Admin</span>
              </button>
            )}
          </form>
        </div>
      )}

    </div>
  );
};
