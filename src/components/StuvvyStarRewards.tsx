'use client';

import React from 'react';
import { Star, Gift, Sparkles } from 'lucide-react';

interface StuvvyStarRewardsProps {
  consecutiveMonths?: number;
  planName?: string;
  totalOrdersOrWeeks?: number;
}

export const StuvvyStarRewards: React.FC<StuvvyStarRewardsProps> = ({
  consecutiveMonths = 1,
  planName = 'Monthly Plan',
  totalOrdersOrWeeks
}) => {
  const safeConsecutive = Math.max(1, consecutiveMonths);
  const isMonthly = (planName || '').toLowerCase().includes('month');

  // Compute filled stars (1 to 12)
  const starsEarned = Math.min(
    12,
    totalOrdersOrWeeks
      ? totalOrdersOrWeeks
      : isMonthly
      ? safeConsecutive
      : 1
  );

  return (
    <div className="w-full max-w-xl mx-auto select-none">
      {/* ========================================================================= */}
      {/* COMPACT & MINIMAL 12-STAR REWARDS (LIGHT COLOR, SMALL STARS, NO LONG TEXT) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-xs space-y-3.5">
        
        {/* HEADER: TITLE & PROGRESS PILL */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-black font-heading text-zinc-900 tracking-tight">
              Stuvvy 12-Star Rewards
            </h4>
          </div>

          <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full text-[10px] font-black text-purple-900 border border-purple-200">
            <Star className="w-3 h-3 fill-purple-600 text-purple-600" />
            <span>{starsEarned} of 12 Stars</span>
          </div>
        </div>

        {/* 12 SMALL COMPACT STARS GRID */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const starIndex = i + 1;
            const isFilled = starIndex <= starsEarned;
            const isMilestone = starIndex === 4 || starIndex === 8 || starIndex === 12;

            return (
              <div
                key={starIndex}
                className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${
                  isFilled
                    ? 'bg-purple-900 text-white shadow-xs scale-105'
                    : 'bg-zinc-50 border border-dashed border-zinc-200 text-zinc-400'
                }`}
                title={`Star ${starIndex}${isMilestone ? ' (Free Month Reward)' : ''}`}
              >
                {/* Tiny Free Food Badge */}
                {isMilestone && (
                  <span className={`absolute -top-1.5 px-1 py-0.2 rounded-full text-[6.5px] font-black uppercase tracking-wider ${
                    isFilled ? 'bg-orange-500 text-white' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {starIndex === 4 ? '4th FREE' : starIndex === 8 ? '8th FREE' : '12th FREE'}
                  </span>
                )}

                <Star
                  className={`w-4 h-4 transition-all ${
                    isFilled ? 'fill-white text-white' : 'text-zinc-300'
                  }`}
                />

                <span className={`text-[8.5px] font-black mt-0.5 ${isFilled ? 'text-purple-200' : 'text-zinc-400'}`}>
                  #{starIndex}
                </span>
              </div>
            );
          })}
        </div>

        {/* CONCISE 1-LINE BENEFIT NOTE (NO LONG EXPLANATIONS) */}
        <div className="bg-purple-50/70 rounded-xl p-2.5 border border-purple-100 flex items-center gap-2 text-[11px] text-purple-950">
          <Gift className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>4th Month Free Benefit:</strong> Complete 3 consecutive months to unlock your 4th month of meals 100% free!
          </span>
        </div>

      </div>
    </div>
  );
};
