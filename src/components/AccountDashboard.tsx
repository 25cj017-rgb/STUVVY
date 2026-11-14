'use client';

import React, { useState, useEffect } from 'react';
import { PlanOption } from './PricingSection';
import { SubscriptionCalendar, CalendarDay } from './SubscriptionCalendar';
import { UserProfile } from '../types';
import type { DeliveryLogItem } from '../app/api/admin/delivery-logs/route';
import { StuvvyCard } from './StuvvyCard';
import { StuvvyStarRewards } from './StuvvyStarRewards';
import { calculateSubscriptionSchedule, parseDateFlexible } from '../utils/subscriptionUtils';
import { 
  User, Calendar, CreditCard, MapPin, PauseCircle, PlayCircle, 
  RefreshCw, ShieldCheck, CheckCircle2, Clock, ChevronRight, AlertCircle, 
  ArrowLeft, Lock, Phone, Utensils, Sparkles, LogOut, Check, MessageSquare,
  Award, Gift, Star, CalendarRange, Timer, UserCheck, LogIn, Eye, ChevronLeft,
  Mail, ShieldAlert, Package, Truck, AlertTriangle, RotateCcw
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

type AccountSubScreen = 'menu' | 'stuvvy-cards' | 'delivery-logs' | 'calendar-schedule' | 'preferences' | 'support';

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

  // Delivery logs state for verified subscriber
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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

  // Fetch real delivery records for this subscriber + sync with local Admin updates
  // Strictly checks BOTH customer name and mobile number to prevent data collision between shared phone numbers
  useEffect(() => {
    if (!user?.mobileNumber) return;
    const cleanMobile = user.mobileNumber.replace(/\D/g, '').slice(-10);
    const cleanName = encodeURIComponent(user.fullName || '');
    const userNormName = (user.fullName || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    const loadAndMergeLogs = () => {
      setLoadingLogs(true);
      fetch(`/api/admin/delivery-logs?mobile=${cleanMobile}&name=${cleanName}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          const serverLogs: DeliveryLogItem[] = data.success && Array.isArray(data.logs) ? data.logs : [];
          let localLogs: DeliveryLogItem[] = [];
          try {
            const rawLocal = localStorage.getItem('stuvvy_delivery_logs');
            if (rawLocal) {
              const parsed = JSON.parse(rawLocal) as DeliveryLogItem[];
              if (Array.isArray(parsed)) {
                localLogs = parsed.filter(
                  (l) =>
                    (l.customerMobile || '').replace(/\D/g, '').slice(-10) === cleanMobile &&
                    (!userNormName || (l.customerName || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === userNormName)
                );
              }
            }
          } catch {}

          const merged = new Map<string, DeliveryLogItem>();
          for (const l of serverLogs) merged.set(l.id, l);
          for (const l of localLogs) {
            const prev = merged.get(l.id);
            if (!prev || new Date(l.updatedAt).getTime() >= new Date(prev.updatedAt).getTime()) {
              merged.set(l.id, l);
            }
          }
          setDeliveryLogs(Array.from(merged.values()));
        })
        .catch(err => console.error('Error fetching delivery logs:', err))
        .finally(() => setLoadingLogs(false));
    };

    loadAndMergeLogs();
    window.addEventListener('stuvvy-logs-updated', loadAndMergeLogs);
    window.addEventListener('storage', loadAndMergeLogs);
    return () => {
      window.removeEventListener('stuvvy-logs-updated', loadAndMergeLogs);
      window.removeEventListener('storage', loadAndMergeLogs);
    };
  }, [user?.mobileNumber, user?.fullName]);

  // Hash change detection (e.g. from navbar "Stuvvy Card" button)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase();
        if (hash.includes('stuvvy-card') || hash.includes('reward')) {
          setActiveScreen('stuvvy-cards');
        } else if (hash.includes('log') || hash.includes('order')) {
          setActiveScreen('delivery-logs');
        } else if (hash.includes('calendar') || hash.includes('schedule')) {
          setActiveScreen('calendar-schedule');
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
    'stuvvy-cards': 'Stuvvy Card & Loyalty Stars',
    'delivery-logs': 'My Order & Delivery Logs',
    'calendar-schedule': 'Delivery Calendar & Plan Schedule',
    preferences: 'Dietary Preferences',
    support: 'Kitchen Admin & Support'
  };

  // Generate the exact subscribed dates list (only for subscribed dates)
  const subscribedDaysList = React.useMemo(() => {
    const list: Array<{
      dayIndex: number;
      dateObj: Date;
      dateStr: string;
      displayDate: string;
      dayOfWeek: string;
      isPast: boolean;
      isToday: boolean;
      isFuture: boolean;
      matchingLog?: any;
    }> = [];

    const start = parseDateFlexible(currentUser.startDate || new Date());
    const duration = currentPlan.defaultDays || 30;
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    for (let i = 0; i < duration; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const displayDate = `${d.getDate()} ${months[d.getMonth()]} ${yyyy}`;
      const dayOfWeek = days[d.getDay()];

      const matchingLog = deliveryLogs.find(l => l.date === dateKey);

      list.push({
        dayIndex: i + 1,
        dateObj: d,
        dateStr: dateKey,
        displayDate,
        dayOfWeek,
        isPast: dMidnight < todayMidnight,
        isToday: dMidnight === todayMidnight,
        isFuture: dMidnight > todayMidnight,
        matchingLog
      });
    }

    return list;
  }, [currentUser.startDate, currentPlan.defaultDays, deliveryLogs]);

  return (
    <div className="py-6 sm:py-8 w-full max-w-7xl mx-auto px-4 sm:px-6 sm:px-8 space-y-6 select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP PROFILE CARD (CLEAN VERTICAL HIERARCHY, MOBILE RESPONSIVE)         */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-zinc-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-5 min-w-0 flex-1 w-full">
            {/* PROFILE PHOTO / AVATAR WITH INITIALS */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl bg-zinc-950 text-white font-black text-xl sm:text-2xl flex items-center justify-center border-2 sm:border-3 border-orange-500 shadow-xl overflow-hidden">
                <img
                  src="/user-avatar.jpg"
                  alt={currentUser.fullName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center font-black text-xl sm:text-2xl bg-zinc-950 text-white">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 sm:p-1 border-2 border-white shadow-xs">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>

            {/* SUBSCRIBER ESSENTIAL DETAILS (STACKED HIERARCHY) */}
            <div className="space-y-1.5 text-left min-w-0 flex-1 w-full">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200 shadow-2xs inline-block">
                  ✓ {schedule.status} Subscriber
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-900 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-purple-200">
                  {optedPlanName}
                </span>
                {currentUser.paymentAmount && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-2xs">
                    Paid: ₹{currentUser.paymentAmount} ({currentUser.paymentStatus || 'PAID'})
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-zinc-950 font-heading tracking-tight break-words">
                {currentUser.fullName}
              </h1>

              <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold flex-wrap pt-0.5">
                <span>Pass ID: <strong className="text-zinc-900 font-mono font-black">STV-2026-{currentUser.mobileNumber?.slice(-4) || '6064'}</strong></span>
                <span>•</span>
                <span>📞 +91 {currentUser.mobileNumber}</span>
              </div>

              {/* Delivery Address Selector if user has multiple locations */}
              {currentUser.addresses && currentUser.addresses.length > 1 ? (
                <div className="pt-2 space-y-1.5 w-full">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                    <span>Active Delivery Location:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
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
                          className={`text-xs p-2.5 sm:px-3 sm:py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-start sm:items-center gap-2 text-left w-full sm:w-auto ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase shrink-0 mt-0.5 sm:mt-0">Loc {idx + 1}:</span>
                          <span className="break-words line-clamp-2 text-xs flex-1">{locAddr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 font-medium flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="break-words max-w-md">{activeAddress || currentUser.address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 w-full sm:w-auto justify-start sm:justify-end pt-1 sm:pt-0">
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
      {/* 3. VERTICAL NAVIGATION MENU (CLEAN STACKED HEADINGS, NO STRAIGHT-LINE CRAM)*/}
      {/* ========================================================================= */}
      {activeScreen === 'menu' && (
        <div className="space-y-4">
          <div className="space-y-1 px-1 text-left">
            <h2 className="text-xl font-black font-heading text-zinc-950 tracking-tight">
              Account Services & Passes
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Select any option below to view pass details, live delivery logs, and plan settings.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-4 sm:p-5 shadow-sm divide-y divide-zinc-100">
            
            {/* OPTION 1: STUVVY CARDS (SUBSCRIBER PASS & 12 STARS MERGED ON BACK) */}
            <button
              type="button"
              onClick={() => setActiveScreen('stuvvy-cards')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-6 h-6 text-purple-200" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-ostrich text-2xl font-black text-purple-950 tracking-wider leading-none">
                    Stuvvy Cards
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-200">
                      Subscriber Pass & 12 Stars
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      Front & Back flip card with merged loyalty stars
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  View Pass
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 2: MY ORDER & DELIVERY LOGS (NEW REQUIREMENT) */}
            <button
              type="button"
              onClick={() => setActiveScreen('delivery-logs')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-blue-200">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-ostrich text-2xl font-black text-purple-950 tracking-wider leading-none">
                    My Order & Delivery Logs
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                      Subscribed Dates Only
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      Doorstep delivery records, timestamps & live receipts
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 group-hover:text-purple-800">
                  View Logs
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-purple-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white stroke-[2.5]" />
                </div>
              </div>
            </button>

            {/* OPTION 3: DELIVERY CALENDAR & PLAN SCHEDULE */}
            <button
              type="button"
              onClick={() => setActiveScreen('calendar-schedule')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-emerald-200">
                  <Calendar className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-ostrich text-2xl font-black text-purple-950 tracking-wider leading-none">
                    Delivery Calendar & Plan Schedule
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {schedule.remainingDays} Days Active • 1st–30th Tracking
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      Start & end dates, meal pause control & 30-day calendar
                    </span>
                  </div>
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

            {/* OPTION 4: DIETARY PREFERENCES */}
            <button
              type="button"
              onClick={() => setActiveScreen('preferences')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-orange-200">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-ostrich text-2xl font-black text-purple-950 tracking-wider leading-none">
                    Dietary Preferences & Health
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Included Free
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      100% Pure Veg, South Indian spices & mild chili options
                    </span>
                  </div>
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

            {/* OPTION 5: KITCHEN ADMIN & HOTLINE HELP */}
            <button
              type="button"
              onClick={() => setActiveScreen('support')}
              className="w-full py-4 px-3 sm:px-4 flex items-center justify-between text-left hover:bg-purple-50/50 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-blue-200">
                  <Phone className="w-6 h-6 text-blue-700" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-ostrich text-2xl font-black text-purple-950 tracking-wider leading-none">
                    Kitchen Admin & Hotline Help
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      Direct Support
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      Phone & WhatsApp hotline with kitchen manager
                    </span>
                  </div>
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
                  Your official compact subscriber pass. Valid for your subscription period.
                </p>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-center">
                Member ID Verified
              </span>
            </div>

            {/* ATM-STYLE STUVVY CARD (FRONT & BACK WITH 12 MERGED STARS) */}
            <StuvvyCard
              fullName={currentUser.fullName}
              mobileNumber={currentUser.mobileNumber}
              planName={optedPlanName}
              startDateStr={schedule.startDateStr}
              endDateStr={schedule.endDateStr}
              status={schedule.status}
              consecutiveMonths={currentUser.consecutiveMonths || 1}
              avatarUrl="/user-avatar.jpg"
            />

            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-purple-950 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <span>
                <strong>Interactive Subscriber Pass:</strong> Tap the card or flip button to view your back-side 12-Star Loyalty Tracker. This pass verifies your daily meal subscription with the central kitchen.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-SCREEN: SUBSCRIBER ORDER & DELIVERY LOGS (SUBSCRIBED DATES ONLY)     */}
      {/* ========================================================================= */}
      {activeScreen === 'delivery-logs' && (
        <div className="space-y-6">
          {/* TOP SUMMARY CARD */}
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 text-left">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-700" />
                  <span>My Order & Delivery Logs</span>
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Live meal handover receipts and delivery verification for your active {optedPlanName} subscription.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-3 py-1 rounded-full border border-blue-200">
                  Subscribed Dates Only
                </span>
              </div>
            </div>

            {/* 3 METRIC TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="text-[10px] font-black uppercase text-zinc-400">Total Subscribed Meals</div>
                <div className="text-lg font-black text-zinc-900 mt-0.5">{subscribedDaysList.length} Meals</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{schedule.startDateStr} – {schedule.endDateStr}</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="text-[10px] font-black uppercase text-emerald-800">Delivered So Far</div>
                <div className="text-lg font-black text-emerald-950 mt-0.5">
                  {subscribedDaysList.filter(d => d.isPast).length} Delivered
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Zero missed deliveries on record</div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                <div className="text-[10px] font-black uppercase text-purple-800">Upcoming Remaining</div>
                <div className="text-lg font-black text-purple-950 mt-0.5">{schedule.remainingDays} Days</div>
                <div className="text-[10px] text-purple-700 mt-0.5">Scheduled daily in Coimbatore</div>
              </div>
            </div>
          </div>

          {/* SUBSCRIBED DATES LOGS LIST */}
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-left">
              <div>
                <h3 className="text-base font-black font-heading text-zinc-950">
                  Daily Delivery Timeline
                </h3>
                <p className="text-xs text-zinc-500">
                  Showing all {subscribedDaysList.length} days of your subscribed plan.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                Pass: STV-2026-{currentUser.mobileNumber?.slice(-4) || '6064'}
              </span>
            </div>

            <div className="space-y-3">
              {subscribedDaysList.map((item) => {
                const log = item.matchingLog;
                const isDelivered = log?.status === 'delivered' || (item.isPast && !log);
                const isNotDelivered = log?.status === 'not_received';
                const isOutForDelivery = log?.status === 'out_for_delivery';
                const isPausedLog = log?.status === 'paused';

                return (
                  <div
                    key={item.dayIndex}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isNotDelivered
                        ? 'bg-red-50/70 border-red-200'
                        : item.isToday
                        ? 'bg-purple-50/80 border-purple-300 shadow-xs'
                        : isDelivered
                        ? 'bg-zinc-50/90 border-zinc-200/90 hover:bg-zinc-100/70'
                        : 'bg-white border-zinc-200/80'
                    }`}
                  >
                    {/* LEFT: DAY NUMBER, DATE, DISH INFO */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-zinc-200/80 text-zinc-800 px-2 py-0.5 rounded-md">
                          Meal #{item.dayIndex}
                        </span>
                        <span className="text-xs font-bold text-zinc-400">
                          {item.dayOfWeek}
                        </span>
                        {item.isToday && (
                          <span className="text-[9px] font-black uppercase bg-purple-900 text-white px-2 py-0.5 rounded-full animate-pulse">
                            Today
                          </span>
                        )}
                      </div>

                      <div className={`text-sm font-black font-heading ${
                        isDelivered
                          ? 'line-through decoration-zinc-400 font-bold text-zinc-400'
                          : 'text-zinc-950'
                      }`}>
                        {item.displayDate}
                      </div>

                      <div className="text-xs text-zinc-600 flex items-center gap-1.5 font-medium flex-wrap">
                        <Utensils className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Lunch Feast Box (Fresh Stone-Ground Meals)</span>
                        <span>•</span>
                        <span className="truncate max-w-[240px] text-zinc-500">
                          {activeAddress || currentUser.address}
                        </span>
                      </div>

                      {/* RECEIPT NOTE OR ISSUE REASON IF LOGGED */}
                      {log?.recipientNote && (
                        <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block mt-1">
                          ✓ Receipt: {log.recipientNote}
                        </div>
                      )}
                      {log?.issueReason && (
                        <div className="text-[11px] text-red-800 font-bold bg-red-100/80 px-2.5 py-1 rounded-lg border border-red-300 inline-block mt-1">
                          ⚠️ Issue note: {log.issueReason}
                        </div>
                      )}
                    </div>

                    {/* RIGHT: LIVE DELIVERY STATUS PILL */}
                    <div className="shrink-0 self-start sm:self-center">
                      {isNotDelivered ? (
                        <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Not Delivered</span>
                        </div>
                      ) : isOutForDelivery ? (
                        <div className="flex items-center gap-1.5 bg-purple-900 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Out for Delivery</span>
                        </div>
                      ) : isPausedLog ? (
                        <div className="flex items-center gap-1.5 bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-xl text-xs font-black">
                          <span>⛔ Paused / Canceled</span>
                        </div>
                      ) : isDelivered ? (
                        <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered {log?.deliveredAt ? `(${log.deliveredAt})` : '(12:30 PM)'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-zinc-100 text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Scheduled Delivery</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* EMERGENCY CONTACT / KITCHEN ASSISTANCE */}
            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-600">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>Need delivery help or custom timing? Central Kitchen Hotline:</span>
                <strong className="text-zinc-950 font-black">+91 9344795832</strong>
              </div>

              <a
                href="https://wa.me/919344795832"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Kitchen Manager</span>
              </a>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-SCREEN: MERGED DELIVERY CALENDAR & SUBSCRIPTION SCHEDULE           */}
      {/* ========================================================================= */}
      {activeScreen === 'calendar-schedule' && (
        <div className="space-y-6">
          {/* TOP CARD: SUBSCRIPTION SCHEDULE & MEAL PAUSE */}
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

                <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950 flex items-baseline gap-2 flex-wrap">
                  <span>{optedPlanName.toUpperCase()}</span>
                  <span className="text-lg text-emerald-700 font-bold">
                    (₹{currentUser.paymentAmount ? parseInt(currentUser.paymentAmount.replace(/\D/g, '')) || optedPlanPrice : optedPlanPrice} {currentUser.paymentStatus || 'PAID'})
                  </span>
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

          {/* BOTTOM CARD: FULL 30-DAY DELIVERY TRACKING CALENDAR */}
          <SubscriptionCalendar
            totalRangeDays={schedule.durationDays}
            ratePerDay={currentPlan.ratePerDay}
            isPaid={true}
            startDate={currentUser.startDate}
            endDate={schedule.endDateStr}
            planName={optedPlanName}
            deliveredDates={Array.from(
              new Set([
                ...deliveryLogs.filter((l) => l.status === 'delivered').map((l) => l.date),
                ...(currentUser.orderStatus?.toLowerCase().includes('delivered') && currentUser.startDate
                  ? [(() => {
                      const d = parseDateFlexible(currentUser.startDate);
                      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })()]
                  : [])
              ])
            )}
            notDeliveredDates={Array.from(
              new Set(deliveryLogs.filter((l) => l.status === 'not_received').map((l) => l.date))
            )}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-SCREEN: DIETARY PREFERENCES                                        */}
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
