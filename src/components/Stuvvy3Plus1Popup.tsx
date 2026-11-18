'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
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
  const isUpgradingMonthly = pricing.isEligibleUpgrade;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-black text-white border border-zinc-800 rounded-3xl sm:rounded-[32px] p-5 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Subtle monochrome ambient gradient */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

        {/* TOP ROW: BADGE & CLOSE BUTTON */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-white text-black px-2.5 py-0.5 rounded-full border border-zinc-200">
              NEW LAUNCH
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-800">
              LIMITED MEAL PASSES
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Close popup"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* HEADLINE SECTION (PURE BLACK & WHITE) */}
        <div className="space-y-2 relative z-10 text-left">
          <div className="font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            {STUVVY_3_PLUS_1_CONFIG.headline}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight text-white uppercase leading-none">
            {STUVVY_3_PLUS_1_CONFIG.name}
          </h2>
          <p className="text-sm sm:text-base font-extrabold text-zinc-200 leading-snug">
            {STUVVY_3_PLUS_1_CONFIG.tagline}
          </p>
        </div>

        {/* PRICING & BENEFIT CARD */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 relative z-10 text-left">
          {isUpgradingMonthly ? (
            /* SPECIAL UPGRADE BREAKDOWN FOR EXISTING MONTHLY SUBSCRIBERS */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-400 font-medium">3-Month Package Price</span>
                <span className="text-xs font-mono font-bold text-zinc-200">₹{pricing.packagePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-300">
                <span className="text-xs font-medium">Already Paid – Monthly Subscription</span>
                <span className="text-xs font-mono font-bold text-white">-₹{pricing.monthlyCredit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-300">
                <span className="text-xs font-medium">Special Upgrade Offer</span>
                <span className="text-xs font-mono font-bold text-white">-₹{pricing.upgradeDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                    Remaining Amount to Pay
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                    ₹{pricing.finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase bg-white text-black px-2 py-0.5 rounded font-mono">
                    4TH MONTH FREE
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">120 Days of Homely Meals</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium pt-1 border-t border-zinc-900 leading-relaxed">
                {pricing.message}
              </p>
            </div>
          ) : (
            /* STANDARD PRICING FOR GUEST / NEW CUSTOMERS */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs text-zinc-400 font-medium">Three-Month Package (90 Days)</span>
                <span className="text-xs font-mono font-bold text-zinc-200">₹{pricing.packagePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-300">
                <span className="text-xs font-medium">Fourth Month Benefit (30 Days)</span>
                <span className="text-xs font-mono font-bold text-white uppercase">100% FREE (₹0)</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                    Total Payable Amount
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                    ₹{pricing.finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase bg-white text-black px-2 py-0.5 rounded font-mono">
                    4 MONTHS TOTAL
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">₹62.50 / day effective rate</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium pt-1 border-t border-zinc-900 leading-relaxed">
                Pay for 3 months upfront. Your entire 4th month is on us — zero extra charge!
              </p>
            </div>
          )}
        </div>

        {/* BULLET HIGHLIGHTS (BLACK & WHITE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />
            <span>3 Months Paid + 1 Month FREE</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />
            <span>Total 120 Days of Chef Meals</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />
            <span>Priority Delivery Slot Lock</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />
            <span>Pause & Adjust Days Anytime</span>
          </div>
        </div>

        {/* PRIMARY CTA BUTTON (BLACK & WHITE HIGH-CONTRAST) */}
        <div className="space-y-2 relative z-10">
          <button
            type="button"
            onClick={onClaimPass}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>{STUVVY_3_PLUS_1_CONFIG.popupCtaText}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <p className="text-[10px] text-zinc-500 font-mono text-center">
            {isGuestUser || !user?.isVerified
              ? 'New & guest users can instantly log in or register to claim.'
              : 'Direct upgrade will adjust your active monthly subscription.'}
          </p>
        </div>
      </div>
    </div>
  );
};
