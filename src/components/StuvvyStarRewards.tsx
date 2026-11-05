'use client';

import React from 'react';
import { Star, Gift, Sparkles, Award, ShieldCheck, Flame, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

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
  // If user is on a Monthly plan, each month awards 4 stars (Month 1 = 4 stars, Month 2 = 8 stars, Month 3 = 12 stars)
  const isMonthly = planName.toLowerCase().includes('month');
  const safeConsecutive = Math.max(1, consecutiveMonths);

  // Compute filled stars (1 to 12)
  const starsEarned = Math.min(
    12,
    totalOrdersOrWeeks
      ? totalOrdersOrWeeks
      : isMonthly
      ? safeConsecutive * 4
      : 2
  );

  // 3 Consecutive Months Offer Progress
  const monthlyOfferTarget = 3;
  const currentMonthProgress = Math.min(monthlyOfferTarget, safeConsecutive);
  const isRewardUnlocked = currentMonthProgress >= 3;
  const progressPercent = Math.min(100, Math.round((currentMonthProgress / monthlyOfferTarget) * 100));

  const milestones = [
    {
      starNum: 4,
      title: 'Milestone 1 (Star 4)',
      reward: 'Free Festive Dessert & Juice Platter',
      unlocked: starsEarned >= 4
    },
    {
      starNum: 8,
      title: 'Milestone 2 (Star 8)',
      reward: 'Sunday Royal Feast Upgrade (Family Thali)',
      unlocked: starsEarned >= 8
    },
    {
      starNum: 12,
      title: 'Grand Milestone (Star 12)',
      reward: '🎉 FREE FOOD FOR 30 DAYS! (Full 1-Month Plan)',
      unlocked: starsEarned >= 12
    }
  ];

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. SPECIAL MONTHLY SUBSCRIBER OFFER (HERO BANNER)        */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 sm:p-8 shadow-xl border border-orange-400/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-orange-950/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-yellow-100 border border-white/20">
              <Gift className="w-3.5 h-3.5 text-yellow-300" />
              <span>Special Customer Attraction Offer</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-tight">
              Subscribe for 3 Consecutive Months & Get{' '}
              <span className="text-yellow-300 underline decoration-yellow-300 underline-offset-4">
                FREE FOOD FOR 30 DAYS!
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
              Maintain your Monthly Subscription without interruption. The completion of your 3rd consecutive month automatically unlocks{' '}
              <strong className="text-white font-extrabold">30 days of 100% free home meals</strong> delivered to your doorstep.
            </p>
          </div>

          {/* PROGRESS BADGE */}
          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-3xl p-5 shrink-0 text-center space-y-3 min-w-[200px]">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-orange-200">
              Your Offer Journey
            </div>
            <div className="text-3xl font-black font-heading text-white flex items-center justify-center gap-1">
              <span>Month</span>
              <span className="text-yellow-300">{currentMonthProgress}</span>
              <span className="text-white/60">/</span>
              <span>{monthlyOfferTarget}</span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-yellow-300 h-2.5 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="text-[11px] font-black text-yellow-200 flex items-center justify-center gap-1">
              {isRewardUnlocked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>30 Days Free Food Unlocked!</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{monthlyOfferTarget - currentMonthProgress} more month{monthlyOfferTarget - currentMonthProgress > 1 ? 's' : ''} to unlock free food</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3 MONTH VISUAL STEPS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/20 relative z-10 text-xs">
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
              currentMonthProgress >= 1 ? 'bg-yellow-300 text-zinc-950 shadow-md' : 'bg-white/20 text-white'
            }`}>
              {currentMonthProgress >= 1 ? '✓' : '1'}
            </div>
            <div>
              <div className="font-black text-white">Month 1: Initiated</div>
              <div className="text-[10px] text-orange-100">Active subscriber</div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
              currentMonthProgress >= 2 ? 'bg-yellow-300 text-zinc-950 shadow-md' : 'bg-white/20 text-white'
            }`}>
              {currentMonthProgress >= 2 ? '✓' : '2'}
            </div>
            <div>
              <div className="font-black text-white">Month 2: Next Renewal</div>
              <div className="text-[10px] text-orange-100">Keep consecutive streak</div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/15 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
              currentMonthProgress >= 3 ? 'bg-emerald-400 text-zinc-950 shadow-md' : 'bg-white/20 text-white'
            }`}>
              {currentMonthProgress >= 3 ? '✓' : '🎁'}
            </div>
            <div>
              <div className="font-black text-white">Month 3: Reward Unlocked!</div>
              <div className="text-[10px] text-yellow-300 font-extrabold">30 DAYS FREE FOOD</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STUVVY 1-TO-12-STAR REWARDS SYSTEM                    */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-black font-heading text-zinc-950 tracking-tight">
                Stuvvy Star Rewards
              </h3>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Collect 1 to 12 stars across your journey to unlock delicious surprises and free food.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full self-start sm:self-center">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-xs font-black text-amber-900">
              {starsEarned} of 12 Stars Collected
            </span>
          </div>
        </div>

        {/* 12-STAR PROGRESS GRID */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const starIndex = i + 1;
            const isFilled = starIndex <= starsEarned;
            const isMilestone = starIndex === 4 || starIndex === 8 || starIndex === 12;

            return (
              <div
                key={starIndex}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  isFilled
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-zinc-50 border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-300'
                }`}
                title={
                  isMilestone
                    ? `Milestone Star ${starIndex}: ${starIndex === 12 ? '30 Days Free Food' : 'Gift Reward'}`
                    : `Star ${starIndex}`
                }
              >
                {/* Milestone Crown / Gift Pill */}
                {isMilestone && (
                  <span className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase ${
                    isFilled ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {starIndex === 12 ? '30D FREE' : `M${starIndex / 4}`}
                  </span>
                )}

                <Star
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                    isFilled ? 'fill-white text-white drop-shadow-sm' : 'text-zinc-300'
                  }`}
                />

                <span className={`text-[10px] font-black mt-1 ${isFilled ? 'text-zinc-950' : 'text-zinc-400'}`}>
                  #{starIndex}
                </span>
              </div>
            );
          })}
        </div>

        {/* MILESTONE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {milestones.map((m) => (
            <div
              key={m.starNum}
              className={`p-4 rounded-2xl border transition-all ${
                m.unlocked
                  ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                  : 'bg-zinc-50 border-zinc-200/80 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  m.unlocked ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {m.title}
                </span>
                {m.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs font-black text-zinc-900 leading-snug">{m.reward}</div>
            </div>
          ))}
        </div>

        {/* NOTES SECTION BELOW STARS */}
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 text-xs text-zinc-600 space-y-2">
          <div className="font-black text-zinc-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Stuvvy Star Rewards Information & Rules</span>
          </div>

          <ul className="space-y-1.5 text-[11px] leading-relaxed list-disc list-inside text-zinc-600 font-medium">
            <li>
              <strong>How Stars Are Earned:</strong> Subscribers receive <strong>4 stars</strong> for every active monthly subscription period, or <strong>1 star</strong> for every week of active meal delivery.
            </li>
            <li>
              <strong>Star 4 Reward:</strong> Unlocks a complimentary artisanal dessert, organic fruit salad, and freshly squeezed cold-pressed juice with your next meal.
            </li>
            <li>
              <strong>Star 8 Reward:</strong> Unlocks an exclusive Sunday Royal Non-Veg / Veg Biryani Feast upgrade at zero surcharge.
            </li>
            <li>
              <strong>Star 12 Reward:</strong> Unlocks our grand loyalty prize—<strong>30 Days of 100% Free Food</strong> upon completing 3 consecutive monthly subscriptions!
            </li>
            <li>
              <strong>Consecutive Rule:</strong> Star streaks are maintained by renewing before your subscription end date. Pauses approved by the Admin will not break your loyalty streak.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

