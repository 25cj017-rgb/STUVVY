'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Lock, ShieldAlert, Phone, Mail, 
  X, MessageSquare, CheckCircle2, ChevronLeft, ChevronRight, 
  Clock, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { parseDateFlexible, formatDisplayDate } from '../utils/subscriptionUtils';

export interface CalendarDay {
  id: string;
  dateStr: string; // Format e.g. "Oct 4, 2026"
  dayName: string; // e.g. "Sun"
  dayNumber: number; // e.g. 4
  monthName: string; // e.g. "Oct"
  isDelivery: boolean; // true = Need Food, false = Skip Food
}

export interface SubscriptionCalendarProps {
  totalRangeDays?: number; // Days window to show for pre-purchase (e.g., 7, 14, 30)
  isPaid?: boolean; // If paid, activates full monthly delivery tracking view
  initialSelectedDays?: CalendarDay[];
  ratePerDay?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  planName?: string;
  onDaysChange?: (updatedDays: CalendarDay[], activeCount: number) => void;
}

export const parseCustomDate = (dateInput?: string | Date): Date => {
  return parseDateFlexible(dateInput);
};

export const generateUpcomingDays = (count: number = 7, customStartDate?: string | Date): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const baseStart = parseDateFlexible(customStartDate);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < count; i++) {
    const d = new Date(baseStart);
    d.setDate(baseStart.getDate() + i);
    
    const dayName = dayNames[d.getDay()];
    const monthName = monthNames[d.getMonth()];
    const dayNumber = d.getDate();
    const dateStr = `${monthName} ${dayNumber}, ${d.getFullYear()}`;
    const id = `day-${d.getFullYear()}-${d.getMonth() + 1}-${dayNumber}`;

    days.push({
      id,
      dateStr,
      dayName,
      dayNumber,
      monthName,
      isDelivery: true
    });
  }

  return days;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Available months for month dropdown
const DROPDOWN_MONTHS = [
  { monthIndex: 8, year: 2026, label: 'September 2026' },
  { monthIndex: 9, year: 2026, label: 'October 2026' },
  { monthIndex: 10, year: 2026, label: 'November 2026' },
  { monthIndex: 11, year: 2026, label: 'December 2026' },
  { monthIndex: 0, year: 2027, label: 'January 2027' },
  { monthIndex: 1, year: 2027, label: 'February 2027' }
];

export const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({
  totalRangeDays = 30,
  isPaid = false,
  initialSelectedDays,
  ratePerDay = 98.43,
  startDate,
  endDate,
  planName = 'Monthly Plan',
  onDaysChange
}) => {
  // Current reference today is November 5, 2026 (matching the Stuvvy cycle)
  const today = useMemo(() => new Date(2026, 10, 5, 0, 0, 0), []);

  // Parse customer's subscription start date
  const parsedStartDate = useMemo(() => {
    if (!startDate) return new Date(2026, 10, 1, 0, 0, 0);
    const d = parseDateFlexible(startDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  }, [startDate]);

  // Parse or compute customer's subscription end date
  const parsedEndDate = useMemo(() => {
    if (endDate) {
      const d = parseDateFlexible(endDate);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    }
    // Default duration based on totalRangeDays or plan
    const days = totalRangeDays > 0 ? totalRangeDays : 30;
    const computed = new Date(parsedStartDate.getTime());
    computed.setDate(parsedStartDate.getDate() + (days - 1));
    computed.setHours(23, 59, 59);
    return computed;
  }, [endDate, parsedStartDate, totalRangeDays]);

  // Month navigation state (defaulting to the start date's month, or November 2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return parsedStartDate ? parsedStartDate.getMonth() : 10;
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return parsedStartDate ? parsedStartDate.getFullYear() : 2026;
  });

  // Selected date for detailed inspection below the calendar
  const [inspectedDay, setInspectedDay] = useState<number>(() => {
    // Default inspection to today if viewing today's month, or 1st of month
    if (selectedMonth === today.getMonth() && selectedYear === today.getFullYear()) {
      return today.getDate();
    }
    return 1;
  });

  // Emergency Admin Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Pre-purchase interactive toggling days (when isPaid is false)
  const [interactiveDays, setInteractiveDays] = useState<CalendarDay[]>(() => {
    if (initialSelectedDays && initialSelectedDays.length > 0) return initialSelectedDays;
    const days: CalendarDay[] = [];
    const base = new Date(parsedStartDate);
    for (let i = 0; i < totalRangeDays; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dayName = WEEKDAYS[d.getDay()];
      const monthName = MONTH_NAMES[d.getMonth()].slice(0, 3);
      days.push({
        id: `day-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        dateStr: `${monthName} ${d.getDate()}, ${d.getFullYear()}`,
        dayName,
        dayNumber: d.getDate(),
        monthName,
        isDelivery: true
      });
    }
    return days;
  });

  // When viewing a different month, reset inspected day if needed
  useEffect(() => {
    if (selectedMonth === today.getMonth() && selectedYear === today.getFullYear()) {
      setInspectedDay(today.getDate());
    } else {
      setInspectedDay(1);
    }
  }, [selectedMonth, selectedYear, today]);

  // Handle month dropdown change
  const handleMonthDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [mStr, yStr] = e.target.value.split('-');
    setSelectedMonth(parseInt(mStr, 10));
    setSelectedYear(parseInt(yStr, 10));
  };

  // Previous month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Next month navigation
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // =========================================================================
  // MONTH CALENDAR GRID CALCULATION (1st TO LAST DAY OF SELECTED MONTH)
  // =========================================================================
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const firstDayWeekday = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
  }, [selectedYear, selectedMonth]);

  // Compute status for all days in selected month
  const monthDaysData = useMemo(() => {
    const list = [];
    const startMidnight = new Date(parsedStartDate.getFullYear(), parsedStartDate.getMonth(), parsedStartDate.getDate(), 0, 0, 0);
    const endMidnight = new Date(parsedEndDate.getFullYear(), parsedEndDate.getMonth(), parsedEndDate.getDate(), 23, 59, 59);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const currentDayDate = new Date(selectedYear, selectedMonth, dayNum, 0, 0, 0);
      const isBeforeStart = currentDayDate.getTime() < startMidnight.getTime();
      const isAfterEnd = currentDayDate.getTime() > endMidnight.getTime();
      const isActivePlan = !isBeforeStart && !isAfterEnd;

      // Delivery tracking criteria:
      // If within active subscription and day <= today: DELIVERED (Strike-through mark!)
      // If within active subscription and day > today: UPCOMING (Normal bold styling)
      // If before start: BEFORE SUBSCRIPTION (Muted, normal text)
      // If after end: OUTSIDE SUBSCRIPTION (Muted, normal text)
      const isDelivered = isActivePlan && currentDayDate.getTime() <= todayMidnight.getTime();
      const isUpcoming = isActivePlan && currentDayDate.getTime() > todayMidnight.getTime();
      const isToday = currentDayDate.getTime() === todayMidnight.getTime();

      let statusType: 'delivered' | 'upcoming' | 'before_sub' | 'after_sub' = 'after_sub';
      if (isDelivered) statusType = 'delivered';
      else if (isUpcoming) statusType = 'upcoming';
      else if (isBeforeStart) statusType = 'before_sub';

      list.push({
        dayNumber: dayNum,
        dayWeekday: WEEKDAYS[currentDayDate.getDay()],
        date: currentDayDate,
        dateStr: `${dayNum} ${MONTH_NAMES[selectedMonth].slice(0, 3)} ${selectedYear}`,
        fullDateStr: `${WEEKDAYS[currentDayDate.getDay()]}, ${dayNum} ${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
        statusType,
        isDelivered,
        isUpcoming,
        isBeforeStart,
        isAfterEnd,
        isToday,
        isActivePlan
      });
    }

    return list;
  }, [selectedYear, selectedMonth, daysInMonth, parsedStartDate, parsedEndDate, today]);

  // Aggregate monthly counts
  const deliveredCount = useMemo(() => {
    return monthDaysData.filter(d => d.isDelivered).length;
  }, [monthDaysData]);

  const upcomingCount = useMemo(() => {
    return monthDaysData.filter(d => d.isUpcoming).length;
  }, [monthDaysData]);

  const activeInMonthCount = useMemo(() => {
    return monthDaysData.filter(d => d.isActivePlan).length;
  }, [monthDaysData]);

  // Inspected Day Object
  const currentInspectedObj = useMemo(() => {
    return monthDaysData.find(d => d.dayNumber === inspectedDay) || monthDaysData[0];
  }, [monthDaysData, inspectedDay]);

  // Pre-purchase day toggle
  const handleToggleInteractiveDay = (id: string) => {
    const updated = interactiveDays.map(d => d.id === id ? { ...d, isDelivery: !d.isDelivery } : d);
    setInteractiveDays(updated);
    const count = updated.filter(d => d.isDelivery).length;
    if (onDaysChange) onDaysChange(updated, count);
  };

  const handleSendAdminRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setShowAdminModal(false);
      setAdminNote('');
    }, 2000);
  };

  // =========================================================================
  // RENDER: FULL MONTHLY DELIVERY TRACKING (WHEN isPaid === true)
  // =========================================================================
  if (isPaid) {
    return (
      <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-zinc-200/90 shadow-sm max-w-2xl mx-auto space-y-5 select-none font-sans">
        
        {/* CALENDAR HEADER & MONTH DROPDOWN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center shadow-xs">
                <CalendarIcon className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <h3 className="text-lg font-black font-heading text-zinc-950 tracking-tight flex items-center gap-2">
                  <span>{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Live Tracking
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Complete 1st to {daysInMonth}th monthly schedule & delivery history
                </p>
              </div>
            </div>
          </div>

          {/* MONTH DROPDOWN & ARROW CONTROLS */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer border border-zinc-200"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* MONTH SELECTION DROPDOWN */}
            <div className="relative">
              <select
                value={`${selectedMonth}-${selectedYear}`}
                onChange={handleMonthDropdownChange}
                className="appearance-none bg-zinc-100 hover:bg-zinc-200 font-extrabold text-xs text-zinc-900 py-2 pl-3.5 pr-8 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-2xs"
              >
                {DROPDOWN_MONTHS.map((item) => (
                  <option key={`${item.monthIndex}-${item.year}`} value={`${item.monthIndex}-${item.year}`}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-600">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer border border-zinc-200"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MONTH SUMMARY CHIPS (DELIVERED, UPCOMING, TOTAL) */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">Delivered</span>
            <span className="text-base font-black text-emerald-950 font-heading">
              {deliveredCount} Days
            </span>
          </div>

          <div className="bg-purple-50/80 border border-purple-200/80 p-2.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">Upcoming</span>
            <span className="text-base font-black text-purple-950 font-heading">
              {upcomingCount} Days
            </span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 p-2.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">Month Plan</span>
            <span className="text-base font-black text-zinc-900 font-heading">
              {activeInMonthCount} / {daysInMonth} Days
            </span>
          </div>
        </div>

        {/* CALENDAR GRID (ALL DATES OF THE MONTH FROM 1st TO LAST DAY) */}
        <div className="bg-zinc-50/70 p-3 sm:p-4 rounded-3xl border border-zinc-200/80 space-y-2">
          
          {/* WEEKDAYS HEADER: SUN MON TUE WED THU FRI SAT */}
          <div className="grid grid-cols-7 text-center pb-1">
            {WEEKDAYS.map((wk) => (
              <span key={wk} className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                {wk}
              </span>
            ))}
          </div>

          {/* DAYS GRID */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {monthDaysData.map((dayItem) => {
              const isSelected = inspectedDay === dayItem.dayNumber;
              
              // Handle first day offset
              const colStartStyle = dayItem.dayNumber === 1 
                ? { gridColumnStart: firstDayWeekday + 1 } 
                : undefined;

              return (
                <button
                  key={dayItem.dayNumber}
                  type="button"
                  style={colStartStyle}
                  onClick={() => setInspectedDay(dayItem.dayNumber)}
                  className={`w-9 h-10 sm:w-11 sm:h-12 mx-auto rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer text-xs select-none ${
                    isSelected ? 'ring-2 ring-purple-600 scale-105 z-10' : ''
                  } ${
                    dayItem.isDelivered
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs hover:bg-emerald-100'
                      : dayItem.isUpcoming
                      ? 'bg-purple-900 text-white font-black shadow-xs hover:bg-purple-800'
                      : dayItem.isBeforeStart
                      ? 'bg-white/60 text-zinc-400 border border-dashed border-zinc-200 hover:bg-zinc-100'
                      : 'bg-zinc-100/60 text-zinc-300 border border-transparent'
                  }`}
                  title={`${dayItem.fullDateStr} - ${
                    dayItem.isDelivered 
                      ? 'Food Delivered' 
                      : dayItem.isUpcoming 
                      ? 'Upcoming Active Delivery' 
                      : dayItem.isBeforeStart 
                      ? 'Before Subscription Started' 
                      : 'Outside Plan'
                  }`}
                >
                  {/* DATE NUMBER WITH STRIKE-THROUGH ON DELIVERED DAYS */}
                  <span className={`text-xs sm:text-sm ${
                    dayItem.isDelivered 
                      ? 'line-through decoration-zinc-400 font-bold text-zinc-400' 
                      : dayItem.isUpcoming
                      ? 'font-black text-white'
                      : 'font-medium'
                  }`}>
                    {dayItem.dayNumber}
                  </span>

                  {/* STATUS INDICATOR DOT / ICON */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {dayItem.isDelivered && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                    {dayItem.isUpcoming && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                    )}
                    {dayItem.isToday && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[7px] font-black px-1 rounded-full uppercase">
                        Today
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CLEAR VISUAL LEGEND */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] line-through font-bold text-zinc-400">
              04
            </span>
            <span className="text-[11px] font-bold text-zinc-700">Delivered (Strikethrough)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-purple-900 text-white flex items-center justify-center text-[10px] font-black">
              15
            </span>
            <span className="text-[11px] font-bold text-zinc-700">Upcoming Delivery</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-white border border-dashed border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400 font-medium">
              01
            </span>
            <span className="text-[11px] font-bold text-zinc-500">Before Sub (Mid-Month)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[8px] font-black uppercase">
              Today
            </span>
            <span className="text-[11px] font-bold text-zinc-700">Current Date</span>
          </div>
        </div>

        {/* INSPECTED DAY DETAIL CARD */}
        {currentInspectedObj && (
          <div className="p-4 rounded-2xl border bg-white space-y-2 border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-950 font-heading">
                {currentInspectedObj.fullDateStr}
              </span>

              {currentInspectedObj.isDelivered ? (
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Delivered Successfully</span>
                </span>
              ) : currentInspectedObj.isUpcoming ? (
                <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-700" />
                  <span>Scheduled Delivery</span>
                </span>
              ) : currentInspectedObj.isBeforeStart ? (
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full border border-zinc-200">
                  Pre-Subscription Day
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-400 px-2.5 py-0.5 rounded-full">
                  Outside Active Plan
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              {currentInspectedObj.isDelivered ? (
                <span>
                  Wholesome South Indian lunch pack prepared fresh with stone-ground spices was delivered to your location.
                </span>
              ) : currentInspectedObj.isUpcoming ? (
                <span>
                  Active subscription meal scheduled. Kitchen prepares hot stone-ground lunch for doorstep delivery by 12:30 PM.
                </span>
              ) : currentInspectedObj.isBeforeStart ? (
                <span>
                  Customer subscribed mid-month. Your food delivery plan officially begins on {formatDisplayDate(parsedStartDate)}.
                </span>
              ) : (
                <span>
                  Your active subscription cycle ends on {formatDisplayDate(parsedEndDate)}. Contact administrator to renew.
                </span>
              )}
            </p>

            {/* Emergency Change Link */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Need emergency date pause or change?</span>
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="font-extrabold text-orange-600 hover:text-orange-700 underline cursor-pointer"
              >
                Contact Administrator
              </button>
            </div>
          </div>
        )}

        {/* EMERGENCY CONTACT ADMINISTRATOR MODAL */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 border border-zinc-200 shadow-2xl space-y-5 relative">
              <button
                onClick={() => setShowAdminModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    Emergency Support
                  </span>
                  <h3 className="text-xl font-extrabold text-zinc-950 font-heading mt-0.5">
                    Contact Administrator
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block">Administrator Hotline</span>
                      <span className="font-extrabold text-zinc-900">+91 9344795832</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href="tel:+919344795832"
                      className="px-3 py-1.5 bg-zinc-950 text-white font-bold rounded-xl text-[11px] hover:bg-zinc-800 transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href="https://wa.me/919344795832"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block">Admin Email Desk</span>
                      <span className="font-extrabold text-zinc-900">orders@stuvvy.in</span>
                    </div>
                  </div>
                  <a
                    href="mailto:orders@stuvvy.in?subject=Emergency%20Subscription%20Date%20Change"
                    className="px-3 py-1.5 bg-zinc-900 text-white font-bold rounded-xl text-[11px] hover:bg-zinc-800 transition-colors"
                  >
                    Send Email
                  </a>
                </div>
              </div>

              <form onSubmit={handleSendAdminRequest} className="space-y-3 pt-1 border-t border-zinc-100">
                <label className="block text-xs font-bold text-zinc-800">
                  Send Direct Emergency Request:
                </label>
                <textarea
                  rows={2}
                  required
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Reason for emergency date change..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />

                {requestSent ? (
                  <div className="bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Request Sent to Admin! We will call back shortly.</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Submit Emergency Request to Admin</span>
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // RENDER: PRE-PURCHASE INTERACTIVE DAY PICKER (WHEN isPaid === false)
  // =========================================================================
  const activeCount = interactiveDays.filter(d => d.isDelivery).length;
  const skippedCount = interactiveDays.filter(d => !d.isDelivery).length;
  const totalPrice = Math.round(activeCount * ratePerDay);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-md max-w-md mx-auto space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-200">
            <CalendarIcon className="w-4 h-4 text-zinc-800" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-zinc-950 font-heading">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>
              <span className="text-[9px] font-bold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200">
                Select Days
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              Tap dates to toggle food delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const updated = interactiveDays.map(d => ({ ...d, isDelivery: true }));
              setInteractiveDays(updated);
              if (onDaysChange) onDaysChange(updated, updated.length);
            }}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => {
              const updated = interactiveDays.map(d => ({ ...d, isDelivery: false }));
              setInteractiveDays(updated);
              if (onDaysChange) onDaysChange(updated, 0);
            }}
            className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-bold cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-zinc-50/70 p-3 rounded-2xl border border-zinc-200/80 space-y-2">
        <div className="grid grid-cols-7 text-center">
          {WEEKDAYS.map((wk) => (
            <span key={wk} className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              {wk}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {interactiveDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleToggleInteractiveDay(day.id)}
              className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all cursor-pointer text-xs select-none ${
                day.isDelivery
                  ? 'bg-zinc-950 text-white font-extrabold shadow-sm ring-2 ring-zinc-950/10 scale-105'
                  : 'bg-zinc-100 text-zinc-400 font-medium hover:bg-zinc-200 line-through'
              }`}
            >
              <span>{day.dayNumber}</span>
              <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                day.isDelivery ? 'bg-white' : 'bg-zinc-300'
              }`} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-200/90 p-3 rounded-2xl flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-extrabold text-zinc-900">{activeCount} Days Selected</span>
            <span className="text-[11px] text-zinc-400">({skippedCount} skipped)</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">
            Rate: ₹{ratePerDay.toFixed(2)} / active day
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Total Price</span>
          <span className="text-base font-black text-zinc-950 font-heading">
            ₹{totalPrice.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
