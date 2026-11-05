'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Lock, ShieldAlert, Phone, Mail, 
  X, MessageSquare, CheckCircle2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { parseDateFlexible } from '../utils/subscriptionUtils';

export interface CalendarDay {
  id: string;
  dateStr: string; // Format e.g. "Oct 4, 2026"
  dayName: string; // e.g. "Sun"
  dayNumber: number; // e.g. 4
  monthName: string; // e.g. "Oct"
  isDelivery: boolean; // true = Need Food, false = Skip Food
}

export interface SubscriptionCalendarProps {
  totalRangeDays?: number; // Days window to show (e.g., 7, 14, 30)
  isPaid?: boolean; // If paid, calendar is locked
  initialSelectedDays?: CalendarDay[];
  ratePerDay?: number;
  startDate?: string | Date;
  onDaysChange?: (updatedDays: CalendarDay[], activeCount: number) => void;
}

// Map short month name to full month name without year
const FULL_MONTH_NAMES: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
  May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
  Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COL_START_MAP: Record<string, string> = {
  Sun: 'col-start-1',
  Mon: 'col-start-2',
  Tue: 'col-start-3',
  Wed: 'col-start-4',
  Thu: 'col-start-5',
  Fri: 'col-start-6',
  Sat: 'col-start-7',
};

/**
 * Parses user start date string (e.g., "04-11-2026", "2026-11-04", "04/11/2026", "Nov 4, 2026")
 */
export const parseCustomDate = (dateInput?: string | Date): Date => {
  return parseDateFlexible(dateInput);
};

// Utility to generate upcoming dates starting from a specific start date (or default Nov 2, 2026)
export const generateUpcomingDays = (count: number = 7, customStartDate?: string | Date): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const baseStart = parseCustomDate(customStartDate);

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
      isDelivery: true // Default: Need food on all days
    });
  }

  return days;
};

export const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({
  totalRangeDays = 7,
  isPaid = false,
  initialSelectedDays,
  ratePerDay = 98.43,
  startDate,
  onDaysChange
}) => {
  const [days, setDays] = useState<CalendarDay[]>(() => {
    if (initialSelectedDays && initialSelectedDays.length > 0) {
      return initialSelectedDays;
    }
    return generateUpcomingDays(totalRangeDays, startDate);
  });

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Sync state if totalRangeDays or startDate changes and no initial days provided
  useEffect(() => {
    if (!initialSelectedDays || initialSelectedDays.length === 0) {
      const generated = generateUpcomingDays(totalRangeDays, startDate);
      setDays(generated);
      const activeCount = generated.filter(d => d.isDelivery).length;
      if (onDaysChange) {
        onDaysChange(generated, activeCount);
      }
    }
  }, [totalRangeDays, startDate]);

  const activeDaysCount = days.filter(d => d.isDelivery).length;
  const skippedDaysCount = days.filter(d => !d.isDelivery).length;
  const totalPrice = Math.round(activeDaysCount * ratePerDay);

  const primaryMonth = days.length > 0 ? (FULL_MONTH_NAMES[days[0].monthName] || days[0].monthName) : 'Month';

  const handleToggleDay = (id: string) => {
    if (isPaid) {
      // Locked state: Trigger Emergency Admin Modal
      setShowAdminModal(true);
      return;
    }

    const updated = days.map(d => {
      if (d.id === id) {
        return { ...d, isDelivery: !d.isDelivery };
      }
      return d;
    });

    setDays(updated);
    const newActiveCount = updated.filter(d => d.isDelivery).length;
    if (onDaysChange) {
      onDaysChange(updated, newActiveCount);
    }
  };

  const handleQuickSelectAll = (isDelivery: boolean) => {
    if (isPaid) {
      setShowAdminModal(true);
      return;
    }

    const updated = days.map(d => ({ ...d, isDelivery }));
    setDays(updated);
    const newActiveCount = updated.filter(d => d.isDelivery).length;
    if (onDaysChange) {
      onDaysChange(updated, newActiveCount);
    }
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

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-md max-w-md mx-auto space-y-4 font-sans">
      
      {/* Date Picker Header (Without Year) */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border border-zinc-200">
            <CalendarIcon className="w-4 h-4 text-zinc-800" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-zinc-950 font-heading">
                {primaryMonth}
              </h3>
              {isPaid ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  Paid
                </span>
              ) : (
                <span className="text-[9px] font-bold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200">
                  Select Days
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              Tap dates to toggle food delivery
            </p>
          </div>
        </div>

        {/* Quick select buttons */}
        {!isPaid && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickSelectAll(true)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelectAll(false)}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Birthday Style Date Picker Calendar Grid */}
      <div className="bg-zinc-50/70 p-3 rounded-2xl border border-zinc-200/80 space-y-2">
        
        {/* Weekday Header Row (Sun Mon Tue Wed Thu Fri Sat) */}
        <div className="grid grid-cols-7 text-center">
          {WEEKDAYS.map((wk) => (
            <span key={wk} className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              {wk}
            </span>
          ))}
        </div>

        {/* Circular Date Buttons Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {days.map((day, idx) => {
            const colStartClass = idx === 0 ? COL_START_MAP[day.dayName] || '' : '';

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleToggleDay(day.id)}
                className={`${colStartClass} w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex flex-col items-center justify-center relative transition-all cursor-pointer text-xs select-none ${
                  day.isDelivery
                    ? 'bg-zinc-950 text-white font-extrabold shadow-sm ring-2 ring-zinc-950/10 scale-105'
                    : 'bg-zinc-100 text-zinc-400 font-medium hover:bg-zinc-200 hover:text-zinc-600 line-through'
                } ${isPaid ? 'hover:ring-red-400' : 'hover:scale-110'}`}
                title={`${day.dateStr} - ${day.isDelivery ? 'Food Needed' : 'Skipped'}`}
              >
                <span>{day.dayNumber}</span>
                
                {/* Status Dot */}
                <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                  day.isDelivery ? 'bg-white' : 'bg-zinc-300'
                }`} />

                {isPaid && (
                  <Lock className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-white/80" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Pricing Summary aligned with picked days */}
      <div className="bg-zinc-50 border border-zinc-200/90 p-3 rounded-2xl flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-extrabold text-zinc-900">{activeDaysCount} Days Selected</span>
            <span className="text-[11px] text-zinc-400">({skippedDaysCount} skipped)</span>
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

      {/* Locked Schedule & Emergency Admin Notice */}
      {isPaid && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl text-[11px] leading-snug space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Schedule Saved & Paid (Locked)</span>
          </div>
          <p className="text-zinc-700">
            Dates are locked. For emergency changes, contact the{' '}
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="text-[#F97316] font-extrabold underline hover:text-orange-700 cursor-pointer"
            >
              Administrator
            </button>.
          </p>
        </div>
      )}

      {/* EMERGENCY CONTACT ADMINISTRATOR MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 border border-zinc-200 shadow-2xl space-y-5 relative">
            
            {/* Close Button */}
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

            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl text-xs text-zinc-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-950">
                <Lock className="w-4 h-4 text-orange-600" />
                <span>Dates are locked post-payment</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                As per subscription guidelines, dates cannot be self-modified once paid. Please reach out to Administrator for urgent pauses or changes.
              </p>
            </div>

            {/* Admin Hotline & Email Card */}
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

            {/* Quick Emergency Note Form */}
            <form onSubmit={handleSendAdminRequest} className="space-y-3 pt-1 border-t border-zinc-100">
              <label className="block text-xs font-bold text-zinc-800">
                Send Direct Emergency Override Request:
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
};
