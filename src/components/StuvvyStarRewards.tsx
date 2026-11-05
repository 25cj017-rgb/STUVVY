'use client';

import React from 'react';
import { Star, Gift, Sparkles, Award, ShieldCheck, Flame, ChevronRight, CheckCircle2, Clock, Crown, Zap } from 'lucide-react';

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
  // If user is on a Monthly plan, each month awards 1 star towards the 12-month loyalty cycle
  const safeConsecutive = Math.max(1, consecutiveMonths);

  // Compute filled stars (1 to 12)
  // For monthly subscribers: 1 consecutive month = Star 1 active. When they hit 3 months, Star 4 (4th Month Free) is unlocked!
  const isMonthly = (planName || '').toLowerCase().includes('month');
  const starsEarned = Math.min(
    12,
    totalOrdersOrWeeks
      ? totalOrdersOrWeeks
      : isMonthly
      ? safeConsecutive
      : 1
  );

  // 3 Consecutive Months Rule: 4th Month Food is 100% Free!
  const targetMonths = 3;
  const currentStreak = Math.min(targetMonths, safeConsecutive);
  const isFourthMonthUnlocked = safeConsecutive >= 3;
  const progressPercent = Math.min(100, Math.round((currentStreak / targetMonths) * 100));

  const milestones = [
    {
      starNum: 4,
      title: 'Star 4 Milestone',
      badge: '4th MO FREE FOOD',
      reward: '🎉 4th Month Food is 100% FREE! (Full 30-Day Plan at zero cost)',
      unlocked: starsEarned >= 4 || isFourthMonthUnlocked,
      condition: 'Unlocked after subscribing for 3 consecutive months'
    },
    {
      starNum: 8,
      title: 'Star 8 Milestone',
      badge: '8th MO FREE FOOD',
      reward: '👑 8th Month Food is 100% FREE! (Repeat 3-month consecutive streak)',
      unlocked: starsEarned >= 8,
      condition: 'Unlocked after 6 consecutive monthly subscriptions'
    },
    {
      starNum: 12,
      title: 'Star 12 Grand Loyalty',
      badge: '12th MO FREE FOOD',
      reward: '🌟 12th Month Food is 100% FREE + Stuvvy Gold Beneficiary Pass',
      unlocked: starsEarned >= 12,
      condition: 'Full 1-Year Loyalty Champion Milestone'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. SPECIAL OFFER BANNER: ELECTRIC PURPLE, DEEP VIOLET & SOFT PINK         */}
      {/* ========================================================================= */}
      <div 
        className="relative overflow-hidden rounded-[32px] text-white p-6 sm:p-8 shadow-2xl border"
        style={{
          background: 'linear-gradient(135deg, #18042C 0%, #2E1065 50%, #3B0764 100%)',
          borderColor: 'rgba(168, 85, 247, 0.4)',
          boxShadow: '0 20px 50px -15px rgba(46, 16, 101, 0.6), inset 0 1px 0 rgba(244, 114, 182, 0.3)'
        }}
      >
        {/* Ambient electric purple & soft pink glowing orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-[#A855F7]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-[#F472B6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            {/* Soft pink pill tag with electric purple glow */}
            <div className="inline-flex items-center gap-2 bg-[#F472B6]/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider text-[#FBCFE8] border border-[#F472B6]/40 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#F472B6]" />
              <span>Special Customer Retention Offer</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight leading-tight text-white">
              Subscribe for 3 Consecutive Months & Get the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#FBCFE8] to-[#A855F7] underline decoration-[#F472B6] underline-offset-4">
                4th Month Food 100% FREE!
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-purple-200/90 font-medium leading-relaxed">
              Maintain your active monthly subscription for 3 consecutive months. Upon completing Month 3, your <strong className="text-white font-extrabold">4th Month (30 Days) of wholesome home food is completely free</strong> delivered right to your door.
            </p>
          </div>

          {/* PROGRESS BADGE IN DEEP VIOLET WITH SOFT PINK ACCENTS */}
          <div 
            className="rounded-3xl p-5 shrink-0 text-center space-y-3 min-w-[220px] border"
            style={{
              background: 'rgba(24, 4, 44, 0.85)',
              borderColor: 'rgba(244, 114, 182, 0.35)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBCFE8]">
              Your Consecutive Streak
            </div>
            
            <div className="text-3xl font-black font-heading text-white flex items-center justify-center gap-1.5">
              <span className="text-sm text-purple-300 font-bold uppercase tracking-wider">Month</span>
              <span className="text-[#F472B6] text-4xl">{currentStreak}</span>
              <span className="text-purple-400/60 font-light">/</span>
              <span className="text-purple-200">{targetMonths}</span>
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-full bg-purple-950/80 rounded-full h-3 overflow-hidden p-0.5 border border-purple-800/40">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-md"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #A855F7 0%, #F472B6 100%)'
                }}
              />
            </div>

            <div className="text-[11px] font-black text-[#FBCFE8] flex items-center justify-center gap-1.5">
              {isFourthMonthUnlocked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">🎉 4th Month Free Food Unlocked!</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#F472B6]" />
                  <span>{targetMonths - currentStreak} more month{targetMonths - currentStreak > 1 ? 's' : ''} to unlock 4th Month Free</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4-MONTH CONSECUTIVE JOURNEY ROADMAP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-purple-500/20 relative z-10 text-xs">
          {/* Month 1 */}
          <div className={`rounded-2xl p-3.5 border transition-all ${
            currentStreak >= 1 
              ? 'bg-[#2E1065]/80 border-[#A855F7] shadow-lg' 
              : 'bg-[#18042C]/60 border-purple-900/40 opacity-70'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                currentStreak >= 1 ? 'bg-[#A855F7] text-white shadow-sm' : 'bg-purple-900/60 text-purple-300'
              }`}>
                {currentStreak >= 1 ? '✓' : '1'}
              </div>
              <span className="font-black text-white text-[11px]">Month 1</span>
            </div>
            <div className="text-[10px] text-purple-200">Subscribed & Active</div>
          </div>

          {/* Month 2 */}
          <div className={`rounded-2xl p-3.5 border transition-all ${
            currentStreak >= 2 
              ? 'bg-[#2E1065]/80 border-[#A855F7] shadow-lg' 
              : 'bg-[#18042C]/60 border-purple-900/40 opacity-70'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                currentStreak >= 2 ? 'bg-[#A855F7] text-white shadow-sm' : 'bg-purple-900/60 text-purple-300'
              }`}>
                {currentStreak >= 2 ? '✓' : '2'}
              </div>
              <span className="font-black text-white text-[11px]">Month 2</span>
            </div>
            <div className="text-[10px] text-purple-200">2nd Consecutive Month</div>
          </div>

          {/* Month 3 */}
          <div className={`rounded-2xl p-3.5 border transition-all ${
            currentStreak >= 3 
              ? 'bg-[#2E1065]/80 border-[#A855F7] shadow-lg' 
              : 'bg-[#18042C]/60 border-purple-900/40 opacity-70'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                currentStreak >= 3 ? 'bg-[#A855F7] text-white shadow-sm' : 'bg-purple-900/60 text-purple-300'
              }`}>
                {currentStreak >= 3 ? '✓' : '3'}
              </div>
              <span className="font-black text-white text-[11px]">Month 3</span>
            </div>
            <div className="text-[10px] text-purple-200">3rd Consecutive Month</div>
          </div>

          {/* Month 4 (REWARD) */}
          <div className={`rounded-2xl p-3.5 border transition-all ${
            isFourthMonthUnlocked
              ? 'bg-gradient-to-br from-[#9333EA] to-[#F472B6] border-[#F472B6] text-white shadow-xl scale-[1.02]' 
              : 'bg-[#18042C]/90 border-[#F472B6]/50 shadow-md'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                isFourthMonthUnlocked ? 'bg-white text-[#9333EA] shadow-md' : 'bg-[#F472B6] text-zinc-950 font-black'
              }`}>
                🎁
              </div>
              <span className="font-black text-[#FBCFE8] text-[11px]">Month 4: REWARD</span>
            </div>
            <div className="text-[10px] font-black text-[#F472B6] uppercase tracking-wide">
              {isFourthMonthUnlocked ? 'UNLOCKED! 100% FREE FOOD' : '30 DAYS FREE FOOD'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 12 STARS LOYALTY REWARDS SYSTEM                                        */}
      {/* ========================================================================= */}
      <div 
        className="rounded-[32px] p-6 sm:p-8 shadow-xl border space-y-6"
        style={{
          background: 'linear-gradient(180deg, #18042C 0%, #1F0838 100%)',
          borderColor: 'rgba(168, 85, 247, 0.35)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/50 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9333EA] to-[#F472B6] flex items-center justify-center shadow-md">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
                Stuvvy 12-Star Rewards
              </h3>
            </div>
            <p className="text-xs text-purple-300 font-medium mt-1">
              Every consecutive subscription earns stars. Complete 3 consecutive months to unlock the 4th month free!
            </p>
          </div>

          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full self-start sm:self-center border"
            style={{
              background: 'rgba(46, 16, 101, 0.7)',
              borderColor: 'rgba(244, 114, 182, 0.4)'
            }}
          >
            <Star className="w-4 h-4 fill-[#F472B6] text-[#F472B6]" />
            <span className="text-xs font-black text-[#FBCFE8]">
              {starsEarned} of 12 Stars Collected
            </span>
          </div>
        </div>

        {/* 12-STAR PROGRESS GRID */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const starIndex = i + 1;
            const isFilled = starIndex <= starsEarned;
            const isFreeFoodMilestone = starIndex === 4 || starIndex === 8 || starIndex === 12;

            return (
              <div
                key={starIndex}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  isFilled
                    ? 'shadow-lg scale-[1.04] border'
                    : 'border-2 border-dashed'
                }`}
                style={
                  isFilled
                    ? {
                        background: 'linear-gradient(135deg, #9333EA 0%, #C084FC 50%, #F472B6 100%)',
                        borderColor: '#FBCFE8',
                        boxShadow: '0 8px 20px -4px rgba(168, 85, 247, 0.5)'
                      }
                    : {
                        background: 'rgba(24, 4, 44, 0.5)',
                        borderColor: isFreeFoodMilestone ? 'rgba(244, 114, 182, 0.4)' : 'rgba(168, 85, 247, 0.2)'
                      }
                }
                title={
                  isFreeFoodMilestone
                    ? `Milestone Star ${starIndex}: Month ${starIndex} FREE FOOD (Unlocked after 3 consecutive months!)`
                    : `Star ${starIndex}: Month ${starIndex}`
                }
              >
                {/* Milestone Crown / Gift Pill */}
                {isFreeFoodMilestone && (
                  <span 
                    className="absolute -top-2.5 px-1.5 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider shadow-sm"
                    style={{
                      background: isFilled ? '#ffffff' : 'linear-gradient(90deg, #9333EA, #F472B6)',
                      color: isFilled ? '#2E1065' : '#ffffff'
                    }}
                  >
                    {starIndex === 4 ? '4th FREE' : starIndex === 8 ? '8th FREE' : '12th FREE'}
                  </span>
                )}

                <Star
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                    isFilled ? 'fill-white text-white drop-shadow-md' : 'text-purple-800/80 fill-purple-950/40'
                  }`}
                />

                <span 
                  className={`text-[10px] font-black mt-1 ${
                    isFilled ? 'text-white' : isFreeFoodMilestone ? 'text-[#F472B6]' : 'text-purple-400/60'
                  }`}
                >
                  #{starIndex}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3 CONSECUTIVE MONTHS MILESTONE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {milestones.map((m) => (
            <div
              key={m.starNum}
              className={`p-4 rounded-2xl border transition-all ${
                m.unlocked
                  ? 'bg-gradient-to-br from-[#2E1065] to-[#3B0764] border-[#F472B6] shadow-md'
                  : 'bg-[#18042C]/70 border-purple-900/40 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                  style={{
                    background: m.unlocked ? 'linear-gradient(90deg, #9333EA, #F472B6)' : 'rgba(46, 16, 101, 0.8)',
                    color: '#ffffff'
                  }}
                >
                  {m.badge}
                </span>
                {m.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-xs font-black text-white leading-snug">{m.reward}</div>
              <div className="text-[10px] text-purple-300 font-medium mt-1">{m.condition}</div>
            </div>
          ))}
        </div>

        {/* NOTES SECTION BELOW STARS: RULES & REWARD INFORMATION */}
        <div 
          className="rounded-2xl p-4 sm:p-5 text-xs space-y-2 border"
          style={{
            background: 'rgba(24, 4, 44, 0.75)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}
        >
          <div className="font-black text-[#FBCFE8] flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>Stuvvy Star Rewards Information & Rules</span>
          </div>

          <ul className="space-y-1.5 text-[11px] leading-relaxed list-disc list-inside text-purple-200/90 font-medium">
            <li>
              <strong className="text-white">Star 1 to 12 Allocation:</strong> Stars remain unfilled initially. When you maintain your active subscription, each month completed fills one star on your customer profile.
            </li>
            <li>
              <strong className="text-[#FBCFE8]">The 4th Month Free Rule:</strong> When you subscribe to the Monthly Plan for <strong>3 consecutive months</strong> without gap, the <strong>4th month food is 100% FREE</strong> (30 days of daily wholesome meals delivered at ₹0).
            </li>
            <li>
              <strong className="text-[#FBCFE8]">Ongoing Reward Milestones:</strong> Reaching Star 8 unlocks an additional 8th Month Free, and reaching Star 12 unlocks a 12th Month Free plus Stuvvy VIP Beneficiary perks.
            </li>
            <li>
              <strong className="text-white">Consecutive Requirement:</strong> To qualify for the free month reward, subscriptions must be consecutive. Pauses approved by the Kitchen Admin will freeze your streak without forfeiting your earned stars.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
