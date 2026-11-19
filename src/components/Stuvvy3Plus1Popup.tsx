'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { STUVVY_3_PLUS_1_CONFIG, calculate3Plus1Pricing } from '../config/subscriptionConfig';

interface Stuvvy3Plus1PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimPass: () => void;
  user?: UserProfile | null;
  isGuestUser?: boolean;
}

export const Stuvvy3Plus1Popup: React.FC<Stuvvy3Plus1PopupProps> = ({
  isOpen,
  onClose,
  onClaimPass,
  user,
  isGuestUser = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const pricing = calculate3Plus1Pricing(user);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white text-zinc-950 border border-zinc-200/90 rounded-3xl sm:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* TOP ROW: STUVVY BRAND LOGO, BADGES & PROMINENT X QUIT BUTTON */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <img
              src="/stuvvy-logo-horizontal.png"
              alt="Stuvvy"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="text-[9px] sm:text-[10px] font-editorial font-bold uppercase tracking-astrid bg-zinc-950 text-white px-3 py-1 rounded-full shadow-2xs">
              NEW LAUNCH
            </span>
            <span className="text-[9px] sm:text-[10px] font-editorial font-semibold uppercase tracking-astrid bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200">
              LIMITED PASSES
            </span>
          </div>

          {/* X BUTTON TO QUIT */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black flex items-center justify-center border border-zinc-200 transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
            title="Quit / Close"
            aria-label="Quit / Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* HEADLINE SECTION (ASTRID LUXURY LIGATURE & EDITORIAL TYPOGRAPHY) */}
        <div className="space-y-2 relative z-10 text-left border-b border-zinc-200/80 pb-4">
          <div className="font-editorial text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-astrid-wide">
            INTRODUCING • {STUVVY_3_PLUS_1_CONFIG.headline}
          </div>
          <h2 className="font-astrid text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 uppercase leading-tight">
            {STUVVY_3_PLUS_1_CONFIG.name}
          </h2>
          <p className="font-editorial text-xs sm:text-sm font-semibold tracking-astrid text-zinc-800 leading-snug">
            {STUVVY_3_PLUS_1_CONFIG.tagline}
          </p>
        </div>

        {/* PRICING & BENEFIT CARD (CLEAN WHITE / LIGHT-GRAY WITH ASTRID EDITORIAL TYPOGRAPHY) */}
        <div className="bg-zinc-50/90 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3 relative z-10 text-left">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="text-xs font-editorial font-semibold tracking-wide text-zinc-700">Three-Month Package (90 Days)</span>
              <span className="text-xs font-astrid font-bold text-zinc-950">₹{pricing.packagePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-zinc-700">
              <span className="text-xs font-editorial font-semibold tracking-wide">Fourth Month Benefit (30 Days)</span>
              <span className="text-xs font-editorial font-bold tracking-astrid text-emerald-700 uppercase">100% FREE (₹0)</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] sm:text-[11px] font-editorial font-semibold uppercase tracking-astrid text-zinc-500 block">
                  Total Payable Amount
                </span>
                <span className="font-astrid text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight leading-none">
                  ₹{pricing.finalPayable.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] sm:text-[10px] font-editorial font-bold uppercase tracking-astrid bg-zinc-950 text-white px-2.5 py-1 rounded shadow-2xs">
                  4TH MONTH FREE
                </span>
                <p className="text-[10px] font-editorial text-zinc-500 mt-1 font-semibold">₹{STUVVY_3_PLUS_1_CONFIG.effectiveRatePerDay.toFixed(2)} / day effective rate</p>
              </div>
            </div>
            <p className="text-xs font-editorial font-medium text-zinc-700 pt-2 border-t border-zinc-200 leading-relaxed">
              Pay for 3 months upfront (₹7,999) and enjoy your 4th month completely FREE — zero extra charge! (Total 120 days of meals)
            </p>
          </div>
        </div>

        {/* BULLET HIGHLIGHTS (ASTRID EDITORIAL TYPOGRAPHY & CRISP CHECK ICONS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs font-editorial font-semibold text-zinc-800">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0 stroke-[3]" />
            <span>3 Months Paid + 1 Month FREE</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0 stroke-[3]" />
            <span>Total 120 Days of Chef Meals</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0 stroke-[3]" />
            <span>Priority Delivery Slot Lock</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-zinc-950 shrink-0 stroke-[3]" />
            <span>Pause & Adjust Days Anytime</span>
          </div>
        </div>

        {/* PRIMARY CTA BUTTON (HIGH-CONTRAST BUTTON WITH ASTRID EDITORIAL TYPOGRAPHY) */}
        <div className="space-y-2 relative z-10">
          <button
            type="button"
            onClick={onClaimPass}
            className="w-full py-4 px-6 rounded-2xl bg-zinc-950 hover:bg-black text-white font-editorial font-bold text-xs sm:text-sm tracking-astrid uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] hover:scale-[1.01]"
          >
            <span>{STUVVY_3_PLUS_1_CONFIG.popupCtaText}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <p className="text-[10px] font-editorial text-zinc-500 tracking-wide text-center">
            {isGuestUser || !user?.isVerified
              ? 'New & guest users can instantly log in or register to claim.'
              : 'Claim your 3+1 pass now and enjoy 120 days of fresh homely meals.'}
          </p>
        </div>
      </div>
    </div>
  );
};
