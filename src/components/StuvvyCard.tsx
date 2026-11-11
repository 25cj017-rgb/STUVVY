'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Copy, Check, Wifi } from 'lucide-react';
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
 * Formats a date into ATM Month & Year representation (e.g. "NOV 26" or "11/26")
 */
function formatAtmMonthYear(dateInput?: string | Date): string {
  if (!dateInput) return '11/26';
  const d = parseDateFlexible(dateInput);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const y = String(d.getFullYear() || 2026).slice(-2);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthName = months[d.getMonth()] || 'NOV';
  return `${monthName} '${y}`;
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
  const [copied, setCopied] = useState(false);
  const last4 = mobileNumber ? mobileNumber.replace(/\D/g, '').slice(-4) : '6064';
  const displayId = subscriberId || `STV-2026-${last4}`;

  const validFromStr = formatAtmMonthYear(startDateStr);
  const validThruStr = formatAtmMonthYear(endDateStr);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(displayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="stuvvy-card-section" className="w-full flex flex-col items-center justify-center py-2 select-none">
      
      {/* ========================================================================= */}
      {/* REALISTIC ATM-SIZED COMPACT STUVVY SUBSCRIBER CARD                        */}
      {/* Dimensions: Standard ID-1 Credit Card Aspect Ratio (1.586 : 1)            */}
      {/* ========================================================================= */}
      <div
        className="w-full max-w-[340px] sm:max-w-[350px] aspect-[1.586/1] rounded-[20px] p-4 sm:p-4.5 text-zinc-900 relative overflow-hidden transition-all duration-300 border shadow-md flex flex-col justify-between cursor-default"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 45%, #F3E8FF 100%)',
          borderColor: '#E9D5FF',
          boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Subtle holographic pearl shimmer */}
        <div 
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-40 blur-xl" 
          style={{ background: 'radial-gradient(circle, #DDD6FE 0%, transparent 70%)' }}
        />

        {/* TOP ROW: STUVVY BRAND LOGO, CHIP, CONTACTLESS ICON & STATUS */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-ostrich text-lg font-black tracking-widest text-purple-950 leading-none">
                  STUVVY
                </span>
                <span className="font-ostrich text-[9px] font-black tracking-wider bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded border border-purple-200">
                  PASS
                </span>
              </div>
              <p className="text-[8px] text-zinc-400 font-medium">Authentic Homely Meals</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Contactless Wave Icon */}
            <Wifi className="w-3.5 h-3.5 text-purple-600 rotate-90" />

            {/* Status Pill */}
            <span className="bg-white/90 text-[8.5px] font-black uppercase tracking-wider text-purple-900 px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
              <span>{status === 'Active' ? 'ACTIVE' : status.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* MIDDLE ROW: GOLD SMART CHIP & PLAN BADGE */}
        <div className="flex items-center justify-between gap-2 relative z-10 my-auto py-1">
          {/* Metallic Gold ATM Smart Chip */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 p-0.5 shadow-2xs border border-amber-400/80 flex items-center justify-center">
            <div className="w-full h-full border border-amber-700/30 rounded flex items-center justify-center text-[7px] font-mono font-bold text-amber-950 tracking-wider opacity-80">
              CHIP
            </div>
          </div>

          <div className="text-right">
            <div className="font-ostrich text-[9px] font-bold tracking-wider text-zinc-400">PLAN OPTED</div>
            <div className="text-xs font-black text-purple-950 leading-tight">{planName}</div>
          </div>
        </div>

        {/* CARDHOLDER & VALIDITY ROW (AUTHENTIC ATM CARD LAYOUT) */}
        <div className="relative z-10 pt-1 border-t border-purple-100/80 space-y-1">
          <div className="flex items-end justify-between gap-2">
            
            {/* CARDHOLDER NAME */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-ostrich text-[8.5px] font-bold text-zinc-400 tracking-widest">
                CARDHOLDER
              </div>
              <div className="text-xs sm:text-sm font-black text-zinc-900 font-heading tracking-wide truncate">
                {fullName}
              </div>
            </div>

            {/* VALIDITY DATES */}
            <div className="flex items-center gap-3 shrink-0 text-right">
              <div>
                <div className="font-ostrich text-[8px] font-bold text-zinc-400 tracking-wider">
                  VALID FRM
                </div>
                <div className="font-ostrich text-xs font-black text-purple-950">
                  {validFromStr}
                </div>
              </div>

              <div>
                <div className="font-ostrich text-[8px] font-bold text-zinc-400 tracking-wider">
                  VALID THRU
                </div>
                <div className="font-ostrich text-xs font-black text-purple-950">
                  {validThruStr}
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM MONOSPACE ATM CARD ID */}
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
            <span>STV •••• •••• {last4}</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1 cursor-pointer transition-colors"
              title="Click to copy subscriber ID"
            >
              <span>{displayId}</span>
              {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-purple-600" />}
            </button>
          </div>
        </div>

      </div>

      {/* QUICK HELPER UNDER CARD */}
      <p className="text-[10px] text-zinc-400 font-medium mt-2 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-purple-600" />
        <span>Official digital subscriber card for kitchen verification</span>
      </p>

    </div>
  );
};
