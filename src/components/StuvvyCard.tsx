'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Copy, Check, Wifi, RotateCcw, Star, Phone } from 'lucide-react';
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
  consecutiveMonths?: number;
}

/**
 * Formats a date into ATM Month & Year representation (e.g. "NOV '26")
 */
function formatAtmMonthYear(dateInput?: string | Date): string {
  if (!dateInput) return '11/26';
  const d = parseDateFlexible(dateInput);
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
  subscriberId,
  consecutiveMonths = 1
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
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

  const handleCardClick = () => {
    setIsFlipped(prev => !prev);
  };

  // 12 Stars definitions
  const totalStars = 12;
  const earnedStars = Math.max(1, consecutiveMonths);

  return (
    <div id="stuvvy-card-section" className="w-full flex flex-col items-center justify-center py-2 select-none">
      
      {/* ========================================================================= */}
      {/* 3D PERSPECTIVE WRAPPER (ATM PROPORTIONS 1.586 : 1)                        */}
      {/* ========================================================================= */}
      <div 
        className="w-full max-w-[340px] sm:max-w-[360px] aspect-[1.586/1] relative cursor-pointer group"
        style={{ perspective: '1200px' }}
        onClick={handleCardClick}
        title="Click to flip between Front & Back"
      >
        <div
          className="w-full h-full relative transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >

          {/* ===================================================================== */}
          {/* FRONT SIDE OF STUVVY ATM CARD                                         */}
          {/* ===================================================================== */}
          <div
            className="w-full h-full absolute inset-0 rounded-[20px] p-4 sm:p-4.5 text-zinc-900 overflow-hidden border shadow-md flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 45%, #F3E8FF 100%)',
              borderColor: '#E9D5FF',
              boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Subtle pearl shimmer */}
            <div 
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-40 blur-xl" 
              style={{ background: 'radial-gradient(circle, #DDD6FE 0%, transparent 70%)' }}
            />

            {/* TOP ROW: LOGO, WAVE, STATUS */}
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
                <Wifi className="w-3.5 h-3.5 text-purple-600 rotate-90" />
                <span className="bg-white/90 text-[8.5px] font-black uppercase tracking-wider text-purple-900 px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                  <span>{status === 'Active' ? 'ACTIVE' : status.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {/* MIDDLE ROW: GOLD SMART CHIP & PLAN */}
            <div className="flex items-center justify-between gap-2 relative z-10 my-auto py-1">
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

            {/* CARDHOLDER & VALIDITY ROW */}
            <div className="relative z-10 pt-1 border-t border-purple-100/80 space-y-1">
              <div className="flex items-end justify-between gap-2">
                <div className="flex-1 min-w-0 pr-2 text-left">
                  <div className="font-ostrich text-[8.5px] font-bold text-zinc-400 tracking-widest">
                    CARDHOLDER
                  </div>
                  <div className="text-xs sm:text-sm font-black text-zinc-900 font-heading tracking-wide truncate">
                    {fullName}
                  </div>
                </div>

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

          {/* ===================================================================== */}
          {/* BACK SIDE OF STUVVY ATM CARD (MERGED 12 STARS, NO WALL OF TEXT)        */}
          {/* ===================================================================== */}
          <div
            className="w-full h-full absolute inset-0 rounded-[20px] p-3 sm:p-3.5 text-zinc-900 overflow-hidden border shadow-md flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #FAF5FF 0%, #F5EEFD 50%, #EDE9FE 100%)',
              borderColor: '#DDD6FE',
              boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* 1. TOP MAGNETIC STRIPE */}
            <div className="-mx-4 -mt-3.5 h-7 bg-zinc-950 w-[calc(100%+32px)] flex items-center px-4">
              <div className="h-0.5 w-full bg-zinc-800/80 rounded" />
            </div>

            {/* 2. SIGNATURE STRIP & SECURITY INFO */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex-1 bg-white border border-zinc-300 rounded px-2 py-0.5 flex items-center justify-between shadow-2xs">
                <span className="text-[7.5px] font-mono text-zinc-400 tracking-wider uppercase">AUTH SIGNATURE</span>
                <span className="font-mono text-[9px] font-black text-purple-950 tracking-wider">
                  STV-{last4}
                </span>
              </div>
              <div className="text-[7.5px] font-black font-ostrich tracking-wider text-purple-900 bg-purple-100/90 px-1.5 py-0.5 rounded border border-purple-200">
                KITCHEN PASS
              </div>
            </div>

            {/* 3. MERGED 12-STAR LOYALTY TRACKER (STARS ONLY - NO EXPLANATIONS) */}
            <div className="space-y-1 py-0.5">
              <div className="flex items-center justify-between text-[8px] font-bold text-zinc-600 px-0.5">
                <span className="font-ostrich text-[9.5px] font-black text-purple-950 tracking-widest">
                  STUVVY 12-STAR REWARDS
                </span>
                <span className="text-[8px] font-black text-purple-900 bg-white/80 px-1.5 py-0.2 rounded-full border border-purple-200">
                  {earnedStars} of 12 Stars
                </span>
              </div>

              {/* 12 STARS GRID (6 IN ROW 1, 6 IN ROW 2) */}
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: totalStars }, (_, idx) => {
                  const starNum = idx + 1;
                  const isFilled = starNum <= earnedStars;
                  const isMilestone = starNum === 4 || starNum === 8 || starNum === 12;

                  return (
                    <div
                      key={starNum}
                      className={`flex flex-col items-center justify-center p-0.5 rounded-lg border transition-all ${
                        isFilled
                          ? 'bg-amber-400/20 border-amber-400 shadow-2xs text-amber-950'
                          : isMilestone
                          ? 'bg-white/90 border-purple-300 border-dashed text-purple-900'
                          : 'bg-white/50 border-purple-100 text-zinc-400'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFilled
                            ? 'fill-amber-500 text-amber-600'
                            : isMilestone
                            ? 'text-purple-600 stroke-[1.8]'
                            : 'text-zinc-300 stroke-[1.5]'
                        }`}
                      />
                      <span className="text-[7px] font-black leading-tight mt-0.2 font-mono">
                        {isMilestone ? `${starNum} FREE` : `#${starNum}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. CARD FOOTER: HOTLINE ONLY */}
            <div className="flex items-center justify-between text-[7.5px] text-zinc-500 border-t border-purple-200/80 pt-1">
              <span className="font-medium">Central Kitchen • Coimbatore</span>
              <span className="font-bold text-purple-950 flex items-center gap-0.5">
                <Phone className="w-2.5 h-2.5 text-purple-700" />
                <span>+91 9344795832</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* FLIP TOGGLE BUTTON BELOW CARD */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCardClick}
          className="bg-white hover:bg-purple-50 text-purple-950 border border-purple-200 px-4 py-1.5 rounded-full text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
          <span>{isFlipped ? 'Flip to Front (ATM Details)' : 'Flip to Back (12 Stars)'}</span>
        </button>
      </div>

      <p className="text-[10px] text-zinc-400 font-medium mt-1.5 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-purple-600" />
        <span>Tap card or button to view back side & loyalty stars</span>
      </p>

    </div>
  );
};
