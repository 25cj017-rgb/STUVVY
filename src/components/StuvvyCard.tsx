'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { parseDateFlexible } from '../utils/subscriptionUtils';

interface StuvvyCardProps {
  fullName: string;
  mobileNumber: string;
  planName: string;
  startDateStr: string;
  endDateStr: string;
  status: 'Active' | 'Upcoming' | 'Expired';
  location?: string;
  avatarUrl?: string;
  subscriberId?: string;
}

/**
 * Formats a date into ATM Month & Year representation (e.g. "NOV 2026")
 */
function formatAtmMonthYear(dateInput?: string | Date): string {
  if (!dateInput) return 'NOV 2026';
  const d = parseDateFlexible(dateInput);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthName = months[d.getMonth()] || 'NOV';
  const year = d.getFullYear() || 2026;
  return `${monthName} ${year}`;
}

export const StuvvyCard: React.FC<StuvvyCardProps> = ({
  fullName,
  mobileNumber,
  planName,
  startDateStr,
  endDateStr,
  status,
  subscriberId
}) => {
  const last4 = mobileNumber ? mobileNumber.replace(/\D/g, '').slice(-4) : '6064';
  const displayId = subscriberId || `STV-2026-${last4}`;

  const validFromMonthYear = formatAtmMonthYear(startDateStr);
  const validThruMonthYear = formatAtmMonthYear(endDateStr);

  return (
    <div id="stuvvy-card-section" className="w-full flex justify-center select-none py-2">
      {/* ========================================================================= */}
      {/* SLEEK LIGHT-COLORED ATM-STYLE COMPACT STUVVY SUBSCRIBER CARD              */}
      {/* ========================================================================= */}
      <div
        className="w-full max-w-[420px] rounded-2xl p-5 sm:p-6 text-zinc-900 relative overflow-hidden transition-all duration-300 border shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 55%, #F3E8FF 100%)',
          borderColor: '#E9D5FF',
          boxShadow: '0 12px 30px -8px rgba(124, 58, 237, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Subtle holographic pearl sheen */}
        <div 
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none opacity-40 blur-2xl" 
          style={{ background: 'radial-gradient(circle, #DDD6FE 0%, transparent 70%)' }}
        />

        {/* TOP ROW: STUVVY BRAND LOGO & STATUS */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center font-black text-lg shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black font-heading tracking-tight text-purple-950">
                  STUVVY
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                  PASS
                </span>
              </div>
              <p className="text-[9.5px] text-zinc-500 font-medium">South Indian Homely Meals</p>
            </div>
          </div>

          {/* STATUS BADGE */}
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-purple-800 border border-purple-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            <span>{status === 'Active' ? 'ACTIVE' : status.toUpperCase()}</span>
          </div>
        </div>

        {/* MIDDLE: METALLIC ATM CHIP & PLAN NAME */}
        <div className="my-5 flex items-center justify-between gap-4 relative z-10">
          {/* Metallic Silver-Gold ATM Smart Chip */}
          <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 p-0.5 shadow-xs border border-amber-300/80">
            <div className="w-full h-full border border-amber-600/30 rounded flex items-center justify-center text-[8px] font-mono font-bold text-amber-900 tracking-wider opacity-75">
              CHIP
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Plan</div>
            <div className="text-xs font-black text-purple-950">{planName}</div>
          </div>
        </div>

        {/* CARDHOLDER NAME */}
        <div className="relative z-10 mb-3.5">
          <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Cardholder</div>
          <div className="text-base font-black text-zinc-900 font-heading tracking-wide truncate mt-0.5">
            {fullName}
          </div>
        </div>

        {/* ATM DATES ROW: VALID FRM & VALID THRU (MONTH AND YEAR) */}
        <div className="flex items-center justify-between border-t border-purple-100 pt-3 relative z-10 text-xs">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              VALID FRM
            </div>
            <div className="text-xs font-black text-purple-900 mt-0.5">
              {validFromMonthYear}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              VALID THRU
            </div>
            <div className="text-xs font-black text-purple-900 mt-0.5">
              {validThruMonthYear}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: ATM PASS ID */}
        <div className="mt-3 pt-2.5 border-t border-purple-100/80 flex items-center justify-between text-[10px] font-mono text-zinc-500 relative z-10">
          <span>STV •••• •••• {last4}</span>
          <span className="font-bold text-purple-700 tracking-wider">{displayId}</span>
        </div>
      </div>
    </div>
  );
};
