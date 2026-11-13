'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, Plus, Minus, Star, Sparkles, UtensilsCrossed, Lock, Phone, UserCheck, ArrowRight, ShoppingBag, Calendar, CheckCircle2, Clock, CalendarDays
} from 'lucide-react';
import { MenuItem, DayOfWeek, MealTime, UserProfile, CartItem } from '../types';
import { calculateSubscriptionSchedule, isDateWithinSubscription, formatDisplayDate } from '../utils/subscriptionUtils';

interface CenteredFrameMenuProps {
  items: MenuItem[];
  cart: CartItem[];
  user: UserProfile;
  onAddToCart: (item: MenuItem, day: DayOfWeek) => void;
  onRemoveFromCart: (itemId: string, day: DayOfWeek) => void;
  onSelectItemDetails: (item: MenuItem) => void;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  selectedMealTime?: MealTime;
  onSelectMealTime?: (mealTime: MealTime) => void;
  onOpenSubscriptions?: () => void;
  showWeekBar?: boolean;
  isGuestUser?: boolean;
  onOpenAdminContact?: () => void;
  onOpenCart?: () => void;
  onProceedToCheckout?: () => void;
  onOpenLoginModal?: () => void;
}

const DAY_OF_WEEK_NAMES: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RollingDayInfo {
  date: Date;
  dateStr: string;
  dayOfWeek: DayOfWeek;
  fullDayName: string;
  dayNumber: number;
  monthName: string;
  offsetDays: number;
  weekNumber: number; // 1 to 4
  isToday: boolean;
  isWithinRollingWindow: boolean;
  isWithinSubscription: boolean;
  isLocked: boolean;
  lockType?: 'guest_limit' | 'outside_sub_start' | 'outside_sub_end' | 'freshness_window';
  unlockDateStr?: string;
}

export const CenteredFrameMenu: React.FC<CenteredFrameMenuProps> = ({
  items,
  cart,
  user,
  onAddToCart,
  onRemoveFromCart,
  onSelectItemDetails,
  selectedDay,
  onSelectDay,
  onOpenSubscriptions,
  showWeekBar = true,
  isGuestUser = false,
  onOpenAdminContact,
  onOpenCart,
  onProceedToCheckout,
  onOpenLoginModal,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = Today
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');

  const schedule = useMemo(() => {
    return calculateSubscriptionSchedule(user.startDate, user.purchaseDate, user.plan);
  }, [user.startDate, user.purchaseDate, user.plan]);

  const isVerifiedSubscriber = !isGuestUser && !!user.isVerified && user.fullName !== 'Guest Explorer';

  // Compute accurate calendar covering the entire month (1st to last day of current month)
  // Calendar days and dates strictly match the real calendar and NEVER shift!
  const rollingDays: RollingDayInfo[] = useMemo(() => {
    const list: RollingDayInfo[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate accurate calendar for all days of the current month (1st to last day)
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum, 0, 0, 0);
      const dowIndex = d.getDay();
      const dayOfWeek = DAY_OF_WEEK_NAMES[dowIndex];
      const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      const offset = dayNum - now.getDate();

      // Standard calendar week numbering:
      // Days 1-7: Week 1
      // Days 8-14: Week 2
      // Days 15-21: Week 3
      // Days 22-30: Week 4
      let weekNumber = 1;
      if (dayNum >= 1 && dayNum <= 7) weekNumber = 1;
      else if (dayNum >= 8 && dayNum <= 14) weekNumber = 2;
      else if (dayNum >= 15 && dayNum <= 21) weekNumber = 3;
      else weekNumber = 4;

      let isWithinSub = false;
      const isLocked = false;
      const lockType: RollingDayInfo['lockType'] = undefined;

      if (isVerifiedSubscriber) {
        isWithinSub = isDateWithinSubscription(d, schedule.startDate, schedule.endDate);
      }

      const unlockDate = new Date(d.getTime() - 3 * 24 * 60 * 60 * 1000);

      list.push({
        date: d,
        dateStr: `${months[d.getMonth()]} ${d.getDate()}`,
        dayOfWeek,
        fullDayName: fullDays[dowIndex],
        dayNumber: d.getDate(),
        monthName: months[d.getMonth()],
        offsetDays: offset,
        weekNumber,
        isToday,
        isWithinRollingWindow: offset >= 0 && offset <= 3,
        isWithinSubscription: isWithinSub,
        isLocked,
        lockType,
        unlockDateStr: formatDisplayDate(unlockDate)
      });
    }

    return list;
  }, [isVerifiedSubscriber, schedule.startDate, schedule.endDate]);

  // Filtered rolling days if a specific week tab is selected
  const displayedDays = useMemo(() => {
    if (selectedWeekFilter === 'all') return rollingDays;
    return rollingDays.filter(d => d.weekNumber === selectedWeekFilter);
  }, [rollingDays, selectedWeekFilter]);

  // Current active day info (defaults to Today)
  const activeDayInfo = rollingDays.find(d => d.offsetDays === selectedDayOffset) || rollingDays.find(d => d.isToday) || rollingDays[0];
  const activeDayOfWeek = activeDayInfo.dayOfWeek;

  const totalCartItems = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalCartPrice = cart.reduce(
    (acc, c) => acc + (c.pricingOption === 'subsidized' ? c.item.subsidizedPrice : c.item.standardPrice) * c.quantity,
    0
  );

  // MATCH EXACT DISHES FOR THE SELECTED DATE ACROSS ALL 4 WEEKS OF THE MONTH
  const currentItems = useMemo(() => {
    const targetDate = activeDayInfo.date;
    const dayNum = targetDate.getDate();
    const dow = activeDayInfo.dayOfWeek;

    // 1. Direct match by date prefix (e.g. nov9-, nov16-, nov23-, nov30-)
    const datePrefix = `nov${dayNum}-`;
    const exactDateItems = items.filter(i => i.id.startsWith(datePrefix));
    if (exactDateItems.length > 0) {
      return exactDateItems;
    }

    // 2. Fallback to day of week from Week 1 (nov9-15) for dates before Nov 9 (e.g. Nov 5-8):
    const week1Fallback = items.filter(i => {
      const isWeek1 = i.id.startsWith('nov9-') || i.id.startsWith('nov10-') || 
                      i.id.startsWith('nov11-') || i.id.startsWith('nov12-') || 
                      i.id.startsWith('nov13-') || i.id.startsWith('nov14-') || 
                      i.id.startsWith('nov15-');
      return isWeek1 && i.days.includes(dow);
    });

    if (week1Fallback.length > 0) {
      return week1Fallback;
    }

    return items.filter(i => i.days.includes(dow));
  }, [items, activeDayInfo.date, activeDayInfo.dayOfWeek]);

  // When a verified subscriber logs in, automatically select their start date ONCE
  const hasAutoSelectedStartRef = React.useRef(false);
  React.useEffect(() => {
    if (!isVerifiedSubscriber) {
      hasAutoSelectedStartRef.current = false;
      return;
    }
    if (hasAutoSelectedStartRef.current) return;

    if (isVerifiedSubscriber && schedule.startDate) {
      const startMidnight = new Date(
        schedule.startDate.getFullYear(),
        schedule.startDate.getMonth(),
        schedule.startDate.getDate()
      ).getTime();

      const match = rollingDays.find(d => {
        const dMidnight = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()).getTime();
        return dMidnight === startMidnight;
      });

      if (match) {
        hasAutoSelectedStartRef.current = true;
        setSelectedDayOffset(match.offsetDays);
        onSelectDay(match.dayOfWeek);
      }
    }
  }, [isVerifiedSubscriber, schedule.startDate, rollingDays, onSelectDay]);

  const handleSelectOffset = (offset: number) => {
    setSelectedDayOffset(offset);
    const dayObj = rollingDays.find(d => d.offsetDays === offset);
    if (dayObj) {
      onSelectDay(dayObj.dayOfWeek);
    }
  };

  const handleJumpToWeek = (weekNum: 1 | 2 | 3 | 4) => {
    setSelectedWeekFilter(weekNum);
    const targetDay = rollingDays.find(d => d.weekNumber === weekNum);
    if (targetDay) {
      handleSelectOffset(targetDay.offsetDays);
    }
  };

  return (
    <div className="w-full min-h-screen text-zinc-950 relative flex flex-col font-sans select-none">
      
      {/* STUVVY CUSTOM BACKGROUND IMAGE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/stuvvy-bg-img.jpeg?v=2"
          alt="Stuvvy Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/40" />
      </div>

      {/* MAIN SINGLE MENU CONTAINER (FULL FIT MAX-W-7XL) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 sm:px-8 py-6 sm:py-8 pb-32 sm:pb-36 flex-1 flex flex-col gap-6">
        
        {/* FULL 4-WEEK MONTH CALENDAR SELECTOR BAR */}
        {showWeekBar && (
          <div className="space-y-3">
            {/* TOP BAR: DATE DISPLAY & SUBSCRIBER STATUS */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-[11px] font-extrabold text-zinc-700 bg-white/95 px-3.5 py-1.5 rounded-full border border-zinc-200/90 shadow-2xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  Viewing: <strong className="text-zinc-950 font-black">{activeDayInfo.fullDayName}, {activeDayInfo.dateStr}</strong>
                </span>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Week {activeDayInfo.weekNumber}
                </span>
                {activeDayInfo.isToday && (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-1">
                    Today
                  </span>
                )}
              </div>

              <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {isVerifiedSubscriber ? `✓ ${user.plan?.toUpperCase() || 'SUBSCRIBER'} (Unlocked: ${schedule.startDateStr} – ${schedule.endDateStr})` : 'Guest Preview Mode'}
              </div>
            </div>

            {/* 4-WEEK TABS SELECTOR (WEEK 1, WEEK 2, WEEK 3, WEEK 4 - CLEAN WITHOUT DATES) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedWeekFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekFilter === 'all'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                All Weeks
              </button>

              <button
                onClick={() => handleJumpToWeek(1)}
                className={`px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekFilter === 1
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                Week 1
              </button>

              <button
                onClick={() => handleJumpToWeek(2)}
                className={`px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekFilter === 2
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                Week 2
              </button>

              <button
                onClick={() => handleJumpToWeek(3)}
                className={`px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekFilter === 3
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                Week 3
              </button>

              <button
                onClick={() => handleJumpToWeek(4)}
                className={`px-3.5 py-1.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedWeekFilter === 4
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                Week 4
              </button>
            </div>

            {/* HORIZONTAL DATE PILLS BAR FOR THE MONTH */}
            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl p-2 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-thin">
              {displayedDays.map((dayItem) => {
                const isSelected = selectedDayOffset === dayItem.offsetDays;

                return (
                  <button
                    key={dayItem.offsetDays}
                    onClick={() => handleSelectOffset(dayItem.offsetDays)}
                    className={`min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center gap-1 cursor-pointer whitespace-nowrap relative shrink-0 ${
                      isSelected
                        ? 'bg-zinc-950 text-white shadow-md scale-[1.02]'
                        : dayItem.isLocked
                        ? 'text-zinc-400 hover:text-zinc-700 bg-zinc-50 border border-zinc-200/60'
                        : dayItem.isWithinSubscription
                        ? 'text-purple-950 bg-purple-50/70 border border-purple-200 hover:bg-purple-100'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 bg-white border border-zinc-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {dayItem.isToday ? 'Today' : dayItem.dayOfWeek}
                      </span>
                      {dayItem.isLocked ? (
                        <Lock className="w-3 h-3 text-amber-500" />
                      ) : dayItem.isWithinSubscription ? (
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                      )}
                    </div>

                    <span className="text-xs font-black">{dayItem.dateStr}</span>

                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : dayItem.isLocked
                        ? 'bg-zinc-200/70 text-zinc-500'
                        : dayItem.isWithinSubscription
                        ? 'bg-purple-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {dayItem.isLocked ? 'Locked' : dayItem.isWithinSubscription ? 'Subscribed' : 'Available'}
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
              <h1 className="font-ostrich text-4xl sm:text-5xl font-black text-zinc-950 tracking-wider">
                {activeDayOfWeek === 'Sun' ? 'Sunday Royal Non-Veg Feast' : `${activeDayInfo.fullDayName} Home Meal Menu`}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              {activeDayInfo.dateStr} • Week {activeDayInfo.weekNumber} Schedule • Prepared fresh daily in our certified kitchen.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl p-3 shadow-xs shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
              🍲
            </div>
            <div className="text-right">
              <div className="text-[10px] font-extrabold uppercase text-zinc-400">Meals Today</div>
              <div className="text-sm font-black text-zinc-950">
                {activeDayInfo.isLocked ? 'Locked' : `${currentItems.length} Dishes`}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPLETE MENU ITEMS GRID FOR THE SELECTED DAY                             */}
        {/* ========================================================================= */}
        {currentItems.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-[28px] p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-800 mx-auto flex items-center justify-center text-3xl font-black border border-zinc-200">
              🍲
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black font-heading text-zinc-950">
                Menu Being Prepared
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Our kitchen chefs are updating the recipe schedule for this day. Check back shortly!
              </p>
            </div>
          </div>
        ) : (
          /* THE ONE SINGLE COMPLETE MENU GRID FOR THE SELECTED DAY */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item) => {
              const inCart = cart.find(c => c.item.id === item.id && c.selectedDays.includes(activeDayOfWeek));
              const quantity = inCart ? inCart.quantity : 0;

              // Meal time badge
              const isBf = item.mealTimes.includes('breakfast');
              const isLn = item.mealTimes.includes('lunch');
              const isDn = item.mealTimes.includes('dinner');

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
                    {/* Meal Time Tag */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200">
                        {isBf ? '🌅 Breakfast' : isLn ? '🍛 Lunch' : isDn ? '🌙 Dinner' : 'Daily Meal'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h4 
                        onClick={() => onSelectItemDetails(item)}
                        className="font-black text-sm sm:text-base text-zinc-950 hover:text-orange-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
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

      {/* FLOATING CART BAR ON BOTTOM IF CART HAS ITEMS (ABOVE MOBILE BOTTOM NAV) */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-20 md:bottom-6 inset-x-4 max-w-xl mx-auto z-40 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-bold">
                {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in Tray
              </div>
              <div className="text-sm sm:text-base font-black text-white">
                ₹{totalCartPrice}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                View Tray
              </button>
            )}

            {onProceedToCheckout && (
              <button
                onClick={onProceedToCheckout}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2.5 px-4 sm:px-5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
