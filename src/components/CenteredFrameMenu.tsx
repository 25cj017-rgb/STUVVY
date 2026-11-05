'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, Plus, Minus, Star, Sparkles, Sun, Moon, Coffee, Heart, UtensilsCrossed, Lock, Phone, UserCheck, ArrowRight, ShoppingBag, Calendar, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { MenuItem, DayOfWeek, MealTime, UserProfile, CartItem } from '../types';
import { MOCK_MENU_ITEMS } from '../data/mockData';
import { calculateSubscriptionSchedule, isDateWithinSubscription, formatDisplayDate } from '../utils/subscriptionUtils';

interface CenteredFrameMenuProps {
  items: MenuItem[];
  user: UserProfile;
  cart: CartItem[];
  onAddToCart: (item: MenuItem, day: DayOfWeek) => void;
  onRemoveFromCart: (itemId: string, day: DayOfWeek) => void;
  onSelectItemDetails: (item: MenuItem) => void;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  selectedMealTime: MealTime;
  onSelectMealTime: (mealTime: MealTime) => void;
  onOpenSubscriptions?: () => void;
  showWeekBar?: boolean;
  isGuestUser?: boolean;
  onOpenLoginModal?: () => void;
  onOpenAdminContact?: () => void;
  onOpenCart?: () => void;
  onProceedToCheckout?: () => void;
}

const DAY_OF_WEEK_NAMES: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface RollingDayInfo {
  date: Date;
  dateStr: string;        // e.g. "Nov 5"
  dayOfWeek: DayOfWeek;   // 'Thu'
  fullDayName: string;    // 'Thursday'
  dayNumber: number;      // 5
  monthName: string;      // 'Nov'
  offsetDays: number;     // 0 = Today, 1 = Tomorrow, 2, 3, 4, 5, 6
  isToday: boolean;
  isWithinRollingWindow: boolean; // offsetDays <= 3
  isWithinSubscription: boolean;  // within subscriber active window
  isLocked: boolean;
  lockType?: 'guest_limit' | 'freshness_window' | 'outside_sub_start' | 'outside_sub_end';
  unlockDateStr?: string;
}

export const CenteredFrameMenu: React.FC<CenteredFrameMenuProps> = ({
  items,
  user,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectItemDetails,
  selectedDay,
  onSelectDay,
  selectedMealTime,
  onSelectMealTime,
  onOpenSubscriptions,
  showWeekBar = true,
  isGuestUser = false,
  onOpenLoginModal,
  onOpenAdminContact,
  onOpenCart,
  onProceedToCheckout,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('lunch');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = Today

  const schedule = useMemo(() => {
    return calculateSubscriptionSchedule(user?.startDate, user?.purchaseDate, user?.plan);
  }, [user?.startDate, user?.purchaseDate, user?.plan]);

  // Compute Rolling 7-Day Calendar Starting from Today
  const rollingDays: RollingDayInfo[] = useMemo(() => {
    const list: RollingDayInfo[] = [];
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 0, 0, 0);
      const dowIndex = d.getDay();
      const dayOfWeek = DAY_OF_WEEK_NAMES[dowIndex];
      const isToday = offset === 0;
      const isWithinRollingWindow = offset <= 3; // Today + next 3 days are available

      let isWithinSub = true;
      let isLocked = false;
      let lockType: RollingDayInfo['lockType'] = undefined;

      if (isGuestUser) {
        if (!isWithinRollingWindow) {
          isLocked = true;
          lockType = 'guest_limit';
        }
      } else {
        // Subscriber rules:
        // 1. Must be within subscription period
        isWithinSub = isDateWithinSubscription(d, schedule.startDate, schedule.endDate);

        const dMidnight = d.getTime();
        const startMidnight = new Date(schedule.startDate.getFullYear(), schedule.startDate.getMonth(), schedule.startDate.getDate()).getTime();
        const endMidnight = new Date(schedule.endDate.getFullYear(), schedule.endDate.getMonth(), schedule.endDate.getDate()).getTime();

        if (dMidnight < startMidnight) {
          isLocked = true;
          lockType = 'outside_sub_start';
        } else if (dMidnight > endMidnight) {
          isLocked = true;
          lockType = 'outside_sub_end';
        } else if (!isWithinRollingWindow) {
          // Menus beyond next 3 days remain locked until available
          isLocked = true;
          lockType = 'freshness_window';
        }
      }

      // Calculate unlock date for rolling window lock
      const unlockDate = new Date(d.getTime() - 3 * 24 * 60 * 60 * 1000);

      list.push({
        date: d,
        dateStr: `${months[d.getMonth()]} ${d.getDate()}`,
        dayOfWeek,
        fullDayName: fullDays[dowIndex],
        dayNumber: d.getDate(),
        monthName: months[d.getMonth()],
        offsetDays: offset,
        isToday,
        isWithinRollingWindow,
        isWithinSubscription: isWithinSub,
        isLocked,
        lockType,
        unlockDateStr: formatDisplayDate(unlockDate)
      });
    }

    return list;
  }, [isGuestUser, schedule.startDate, schedule.endDate]);

  // Current active day info
  const activeDayInfo = rollingDays[selectedDayOffset] || rollingDays[0];
  const activeDayOfWeek = activeDayInfo.dayOfWeek;

  const totalCartItems = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalCartPrice = cart.reduce(
    (acc, c) => acc + (c.pricingOption === 'subsidized' ? c.item.subsidizedPrice : c.item.standardPrice) * c.quantity,
    0
  );

  const categories = [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '🍛' },
    { id: 'dinner', name: 'Dinner', icon: '🌙' },
  ];

  // Map category to meal items & filter by active day of week
  const getCategoryItems = (catId: string) => {
    // SUNDAY RULE: Only Lunch is served on Sundays
    if (activeDayOfWeek === 'Sun' && catId !== 'lunch') {
      return [];
    }

    let catFiltered = items;
    if (catId === 'breakfast') {
      catFiltered = items.filter(i => i.mealTimes.includes('breakfast'));
    } else if (catId === 'lunch') {
      catFiltered = items.filter(i => i.mealTimes.includes('lunch'));
    } else if (catId === 'dinner') {
      catFiltered = items.filter(i => i.mealTimes.includes('dinner'));
    }
    
    return catFiltered.filter(i => i.days.includes(activeDayOfWeek));
  };

  const currentItems = getCategoryItems(activeCategory);

  const getCategoryTitle = (catId: string) => {
    if (catId === 'breakfast') return 'Traditional South Indian Breakfast';
    if (catId === 'lunch') {
      return activeDayOfWeek === 'Sun' ? 'Sunday Royal Non-Veg Feast' : 'Authentic South Indian Homely Lunch';
    }
    if (catId === 'dinner') return 'Light & Wholesome Night Dinner';
    return 'Stuvvy Daily Specials';
  };

  const handleSelectOffset = (offset: number) => {
    setSelectedDayOffset(offset);
    const dayObj = rollingDays[offset];
    if (dayObj) {
      onSelectDay(dayObj.dayOfWeek);
      if (dayObj.dayOfWeek === 'Sun' && activeCategory !== 'lunch') {
        setActiveCategory('lunch');
        onSelectMealTime('lunch');
      }
    }
  };

  return (
    <div className="w-screen min-h-screen bg-zinc-50/60 text-zinc-950 relative flex flex-col font-sans overflow-x-hidden select-none">
      
      {/* ======================================================== */}
      {/* SYNCHRONIZED HAND-DRAWN SKETCH BACKGROUND IMAGE          */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-start opacity-20 sm:opacity-30 -translate-x-10 sm:-translate-x-16 scale-100">
        <img
          src="/landing_page.png"
          alt="Stuvvy Home Food Background Sketch"
          className="w-full h-full object-contain max-h-screen mix-blend-multiply"
        />
      </div>

      {/* Subtle top ambient gradient to keep text readable */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-white/60 via-transparent to-white/80" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-36 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT FLOATING SIDEBAR CATEGORY MENU CARD                 */}
        {/* ======================================================== */}
        <div className="w-full lg:w-64 bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-xl rounded-[24px] sm:rounded-[28px] p-2 sm:p-3 shrink-0">
          <div className="grid grid-cols-3 lg:flex lg:flex-col gap-1.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'breakfast' || cat.id === 'lunch' || cat.id === 'dinner') {
                      onSelectMealTime(cat.id as MealTime);
                    }
                  }}
                  className={`w-full px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center lg:justify-between cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-md'
                      : 'text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>

                  {isActive && (
                    <ChevronRight className="hidden lg:block w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* SUBSCRIBER STATUS MINI PILL */}
          <div className="hidden lg:block mt-4 pt-3 border-t border-zinc-100 px-2 text-[11px] text-zinc-500 font-medium space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-zinc-400">Schedule</span>
              <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Rolling 4-Day Window
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Menus open 3 days in advance to ensure farm-fresh local cooking.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT MAIN MENU SECTION                                  */}
        {/* ======================================================== */}
        <div className="flex-1 w-full space-y-6">
          
          {/* DYNAMIC ROLLING 7-DAY CALENDAR SELECTOR BAR */}
          {showWeekBar && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] font-extrabold text-zinc-700 bg-white/95 px-3.5 py-1.5 rounded-full border border-zinc-200/90 shadow-2xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>
                    Viewing: <strong className="text-zinc-950 font-black">{activeDayInfo.fullDayName}, {activeDayInfo.dateStr}</strong>
                  </span>
                  {activeDayInfo.isToday && (
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-1">
                      Today
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-white/80 px-3 py-1 rounded-full border border-zinc-200">
                  {isGuestUser ? 'Guest Mode (4 Days Available)' : `${user.plan?.toUpperCase() || 'SUBSCRIBER'} CALENDAR`}
                </div>
              </div>

              {/* 7-DAY ROLLING BUTTONS ROW */}
              <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl p-2 shadow-xs flex items-center justify-between gap-1.5 overflow-x-auto">
                {rollingDays.map((dayItem) => {
                  const isSelected = selectedDayOffset === dayItem.offsetDays;

                  return (
                    <button
                      key={dayItem.offsetDays}
                      onClick={() => handleSelectOffset(dayItem.offsetDays)}
                      className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center gap-1 cursor-pointer whitespace-nowrap relative ${
                        isSelected
                          ? 'bg-zinc-950 text-white shadow-md scale-[1.02]'
                          : dayItem.isLocked
                          ? 'text-zinc-400 hover:text-zinc-700 bg-zinc-50 border border-zinc-200/60'
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 bg-white border border-zinc-200/80'
                      }`}
                    >
                      {/* Top status indicator: Lock vs Green Dot */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {dayItem.isToday ? 'Today' : dayItem.dayOfWeek}
                        </span>
                        {dayItem.isLocked ? (
                          <Lock className="w-3 h-3 text-amber-500" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                        )}
                      </div>

                      <span className="text-xs font-black">{dayItem.dateStr}</span>

                      {/* Small badge */}
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : dayItem.isLocked
                          ? 'bg-zinc-200/70 text-zinc-500'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {dayItem.isLocked ? 'Locked' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* HEADER SECTION WITH TITLE & STAMP BADGE */}
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 font-heading tracking-tight">
                  {getCategoryTitle(activeCategory)}
                </h1>
                <span className="text-zinc-400 font-serif italic text-lg sm:text-xl font-bold">
                  \ | /
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                Wholesome · Stone-Ground · Daily Kitchen for <strong className="text-zinc-900 font-black">{
                  activeDayInfo.fullDayName
                }, {activeDayInfo.dateStr}</strong>
              </p>
            </div>

            {/* CIRCULAR STAMP BADGE */}
            <div className="hidden sm:flex shrink-0 w-24 h-24 rounded-full border-2 border-zinc-800/80 items-center justify-center p-2 text-center rotate-6 hover:rotate-0 transition-transform">
              <span className="text-[10px] font-serif italic font-bold text-zinc-800 leading-tight">
                Fresh Meals<br />Rotating Daily<br />Zero Preservatives ♡
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* LOCKED DAY VIEW (4-DAY FRESHNESS OR SUBSCRIPTION LOCK)    */}
          {/* ======================================================== */}
          {activeDayInfo.isLocked ? (
            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-zinc-950 text-white mx-auto flex items-center justify-center text-2xl font-black shadow-md">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
                  {activeDayInfo.lockType === 'guest_limit'
                    ? 'Guest Preview Window • Days 5+ Locked'
                    : activeDayInfo.lockType === 'outside_sub_start'
                    ? 'Subscription Not Yet Started'
                    : activeDayInfo.lockType === 'outside_sub_end'
                    ? 'Subscription Cycle Ended'
                    : 'Rolling 4-Day Freshness Window'}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
                  {activeDayInfo.fullDayName}, {activeDayInfo.dateStr} Menu is Locked
                </h2>

                <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                  {activeDayInfo.lockType === 'guest_limit' ? (
                    <>
                      As a Guest Explorer, you have preview access to Today and the next 3 days. To unlock the full ongoing daily menu schedule, subscribe to a Stuvvy meal plan!
                    </>
                  ) : activeDayInfo.lockType === 'outside_sub_start' ? (
                    <>
                      Your meal subscription is scheduled to start on <strong className="text-zinc-950 font-bold">{schedule.startDateStr}</strong>. Deliveries and meal customization will activate automatically on your start date.
                    </>
                  ) : activeDayInfo.lockType === 'outside_sub_end' ? (
                    <>
                      Your current subscription ended on <strong className="text-zinc-950 font-bold">{schedule.endDateStr}</strong>. Please renew your plan to continue receiving home deliveries for this date.
                    </>
                  ) : (
                    <>
                      To ensure meal ingredients are sourced 100% farm-fresh and seasonal, menus open on a rolling 4-day window. This menu will unlock on <strong className="text-zinc-950 font-black">{activeDayInfo.unlockDateStr}</strong>!
                    </>
                  )}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {isGuestUser ? (
                  <>
                    {onOpenSubscriptions && (
                      <button
                        onClick={onOpenSubscriptions}
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Subscribe to Unlock All Menus</span>
                      </button>
                    )}

                    {onOpenLoginModal && (
                      <button
                        onClick={onOpenLoginModal}
                        className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Subscriber Log In</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleSelectOffset(0)}
                      className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back to Today&apos;s Menu</span>
                    </button>

                    {onOpenAdminContact && (
                      <button
                        onClick={onOpenAdminContact}
                        className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-extrabold text-xs py-3.5 px-6 rounded-2xl border border-zinc-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contact Kitchen Admin</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* ADMIN HOTLINE SUPPORT BOX */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 max-w-md mx-auto text-xs text-zinc-600 flex items-center justify-center gap-3">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>Kitchen Hotline: <strong>+91 9344795832</strong></span>
                <span>•</span>
                <a href="https://wa.me/919344795832" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
                  WhatsApp Support
                </a>
              </div>
            </div>
          ) : currentItems.length === 0 ? (
            /* EMPTY / SUNDAY NO DINNER VIEW */
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-[28px] p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-800 mx-auto flex items-center justify-center text-3xl font-black border border-zinc-200">
                🍗
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black font-heading text-zinc-950">
                  No {activeCategory.toUpperCase()} Service on Sundays
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Sundays are exclusively reserved for our grand Sunday Royal Feast at Lunch!
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveCategory('lunch');
                  onSelectMealTime('lunch');
                }}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                View Sunday Lunch Feast
              </button>
            </div>
          ) : (
            /* AVAILABLE DISHES GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentItems.map((item) => {
                const inCart = cart.find(c => c.item.id === item.id && c.selectedDays.includes(activeDayOfWeek));
                const quantity = inCart ? inCart.quantity : 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[28px] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex gap-4 items-start relative group"
                  >
                    <div 
                      onClick={() => onSelectItemDetails(item)}
                      className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 cursor-pointer border border-zinc-100 relative"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.isVeg && (
                        <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-sm border border-emerald-600 bg-white/90 p-0.5 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          onClick={() => onSelectItemDetails(item)}
                          className="font-black text-sm sm:text-base text-zinc-950 hover:text-orange-600 transition-colors cursor-pointer truncate"
                        >
                          {item.name}
                        </h4>
                      </div>

                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 pt-1">
                        <span>{item.portionSize}</span>
                        <span>•</span>
                        <span>{item.nutritionalInfo.calories} kcal</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-base font-black text-zinc-950 font-heading">
                            ₹{item.standardPrice}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold ml-1">/ meal</span>
                        </div>

                        {/* Add to Cart Controls */}
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2 bg-zinc-950 text-white rounded-xl p-1 shadow-xs">
                            <button
                              onClick={() => onRemoveFromCart(item.id, activeDayOfWeek)}
                              className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black px-1">{quantity}</span>
                            <button
                              onClick={() => onAddToCart(item, activeDayOfWeek)}
                              className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(item, activeDayOfWeek)}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer hover:scale-105"
                          >
                            <Plus className="w-3.5 h-3.5 text-orange-400" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FLOATING CART BAR ON BOTTOM IF CART HAS ITEMS */}
      {totalCartItems > 0 && onOpenCart && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
          <div className="bg-zinc-950 text-white p-4 rounded-3xl shadow-2xl border border-zinc-800 flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-orange-400">
                  {totalCartItems} Item{totalCartItems > 1 ? 's' : ''} Selected
                </div>
                <div className="text-sm font-black text-white">₹{totalCartPrice.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs px-5 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Order</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
