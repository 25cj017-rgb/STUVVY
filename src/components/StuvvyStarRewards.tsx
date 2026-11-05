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
    <div className="space-y-6 select-none">
      {/* ========================================================================= */}
      {/* 1. SPECIAL OFFER BANNER: VIBRANT ELECTRIC PURPLE, DEEP VIOLET & SOFT PINK */}
      {/* ========================================================================= */}
      <div 
        className="relative overflow-hidden rounded-[32px] text-white p-6 sm:p-8 shadow-2xl border"
        style={{
          background: 'linear-gradient(135deg, #6A13F5 0%, #5B0ED6 50%, #4C09B8 100%)',
          borderColor: 'rgba(242, 202, 226, 0.4)',
          boxShadow: '0 25px 60px -15px rgba(106, 19, 245, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Soft pink ambient lighting */}
        <div 
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(242, 202, 226, 0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(36, 4, 74, 0.5) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            {/* Soft pink pill tag */}
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm"
              style={{
                background: '#F2CAE2',
                color: '#24044A'
              }}
            >
              <Zap className="w-3.5 h-3.5 text-[#24044A]" />
              <span>Special Customer Retention Offer</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight leading-tight text-white">
              Subscribe for 3 Consecutive Months & Get the{' '}
              <span 
                className="underline decoration-2 underline-offset-4"
                style={{
                  color: '#F2CAE2',
                  textDecorationColor: '#F2CAE2'
                }}
              >
                4th Month Food 100% FREE!
              </span>
            </h3>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-white/90">
              Maintain your active monthly subscription for 3 consecutive months. Upon completing Month 3, your <strong className="text-white font-extrabold underline decoration-[#F2CAE2]">4th Month (30 Days) of wholesome home food is completely free</strong> delivered right to your door.
            </p>
          </div>

          {/* PROGRESS BADGE IN DEEP VIOLET WITH SOFT PINK ACCENTS */}
          <div 
            className="rounded-3xl p-5 shrink-0 text-center space-y-3 min-w-[220px] border shadow-xl"
            style={{
              background: 'rgba(36, 4, 74, 0.65)',
              borderColor: 'rgba(242, 202, 226, 0.45)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#F2CAE2' }}>
              Your Consecutive Streak
            </div>
            
            <div className="text-3xl font-black font-heading text-white flex items-center justify-center gap-1.5">
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#F2CAE2' }}>Month</span>
              <span className="text-4xl" style={{ color: '#F2CAE2' }}>{currentStreak}</span>
              <span className="text-white/60 font-light">/</span>
              <span className="text-white">{targetMonths}</span>
            </div>

            {/* Glowing Progress Bar */}
            <div 
              className="w-full rounded-full h-3 overflow-hidden p-0.5 border"
              style={{
                background: 'rgba(36, 4, 74, 0.8)',
                borderColor: 'rgba(242, 202, 226, 0.3)'
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 shadow-md"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #F2CAE2 0%, #ffffff 100%)'
                }}
              />
            </div>

            <div className="text-[11px] font-black flex items-center justify-center gap-1.5" style={{ color: '#F2CAE2' }}>
              {isFourthMonthUnlocked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-300">🎉 4th Month Free Food Unlocked!</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" style={{ color: '#F2CAE2' }} />
                  <span>{targetMonths - currentStreak} more month{targetMonths - currentStreak > 1 ? 's' : ''} to unlock 4th Month Free</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4-MONTH CONSECUTIVE JOURNEY ROADMAP */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t relative z-10 text-xs"
          style={{ borderColor: 'rgba(242, 202, 226, 0.25)' }}
        >
          {/* Month 1 */}
          <div 
            className={`rounded-2xl p-3.5 border transition-all ${
              currentStreak >= 1 
                ? 'shadow-lg' 
                : 'opacity-70'
            }`}
            style={{
              background: currentStreak >= 1 ? 'rgba(36, 4, 74, 0.65)' : 'rgba(36, 4, 74, 0.35)',
              borderColor: currentStreak >= 1 ? '#F2CAE2' : 'rgba(242, 202, 226, 0.25)'
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shadow-sm"
                style={{
                  background: currentStreak >= 1 ? '#F2CAE2' : 'rgba(242, 202, 226, 0.2)',
                  color: currentStreak >= 1 ? '#24044A' : '#ffffff'
                }}
              >
                {currentStreak >= 1 ? '✓' : '1'}
              </div>
              <span className="font-black text-white text-[11px]">Month 1</span>
            </div>
            <div className="text-[10px]" style={{ color: '#F2CAE2' }}>Subscribed & Active</div>
          </div>

          {/* Month 2 */}
          <div 
            className={`rounded-2xl p-3.5 border transition-all ${
              currentStreak >= 2 
                ? 'shadow-lg' 
                : 'opacity-70'
            }`}
            style={{
              background: currentStreak >= 2 ? 'rgba(36, 4, 74, 0.65)' : 'rgba(36, 4, 74, 0.35)',
              borderColor: currentStreak >= 2 ? '#F2CAE2' : 'rgba(242, 202, 226, 0.25)'
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shadow-sm"
                style={{
                  background: currentStreak >= 2 ? '#F2CAE2' : 'rgba(242, 202, 226, 0.2)',
                  color: currentStreak >= 2 ? '#24044A' : '#ffffff'
                }}
              >
                {currentStreak >= 2 ? '✓' : '2'}
              </div>
              <span className="font-black text-white text-[11px]">Month 2</span>
            </div>
            <div className="text-[10px]" style={{ color: '#F2CAE2' }}>2nd Consecutive Month</div>
          </div>

          {/* Month 3 */}
          <div 
            className={`rounded-2xl p-3.5 border transition-all ${
              currentStreak >= 3 
                ? 'shadow-lg' 
                : 'opacity-70'
            }`}
            style={{
              background: currentStreak >= 3 ? 'rgba(36, 4, 74, 0.65)' : 'rgba(36, 4, 74, 0.35)',
              borderColor: currentStreak >= 3 ? '#F2CAE2' : 'rgba(242, 202, 226, 0.25)'
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shadow-sm"
                style={{
                  background: currentStreak >= 3 ? '#F2CAE2' : 'rgba(242, 202, 226, 0.2)',
                  color: currentStreak >= 3 ? '#24044A' : '#ffffff'
                }}
              >
                {currentStreak >= 3 ? '✓' : '3'}
              </div>
              <span className="font-black text-white text-[11px]">Month 3</span>
            </div>
            <div className="text-[10px]" style={{ color: '#F2CAE2' }}>3rd Consecutive Month</div>
          </div>

          {/* Month 4 (REWARD) */}
          <div 
            className={`rounded-2xl p-3.5 border transition-all shadow-xl ${
              isFourthMonthUnlocked
                ? 'scale-[1.03]' 
                : ''
            }`}
            style={{
              background: '#F2CAE2',
              borderColor: '#ffffff',
              color: '#24044A'
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shadow-md"
                style={{
                  background: '#24044A',
                  color: '#F2CAE2'
                }}
              >
                🎁
              </div>
              <span className="font-black text-[11px]" style={{ color: '#24044A' }}>
                Month 4: REWARD
              </span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#24044A' }}>
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
          background: 'linear-gradient(135deg, #6A13F5 0%, #5B0ED6 50%, #4C09B8 100%)',
          borderColor: 'rgba(242, 202, 226, 0.4)',
          boxShadow: '0 20px 50px -15px rgba(106, 19, 245, 0.5)'
        }}
      >
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'rgba(242, 202, 226, 0.25)' }}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: '#F2CAE2',
                  color: '#24044A'
                }}
              >
                <Crown className="w-4 h-4" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
                Stuvvy 12-Star Rewards
              </h3>
            </div>
            <p className="text-xs font-medium mt-1" style={{ color: '#F2CAE2' }}>
              Every consecutive subscription earns stars. Complete 3 consecutive months to unlock the 4th month free!
            </p>
          </div>

          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full self-start sm:self-center border shadow-sm"
            style={{
              background: 'rgba(36, 4, 74, 0.65)',
              borderColor: '#F2CAE2'
            }}
          >
            <Star className="w-4 h-4 fill-[#F2CAE2] text-[#F2CAE2]" />
            <span className="text-xs font-black" style={{ color: '#F2CAE2' }}>
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
                        background: '#F2CAE2',
                        borderColor: '#ffffff',
                        boxShadow: '0 8px 20px -4px rgba(242, 202, 226, 0.6)'
                      }
                    : {
                        background: 'rgba(36, 4, 74, 0.45)',
                        borderColor: isFreeFoodMilestone ? '#F2CAE2' : 'rgba(242, 202, 226, 0.3)'
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
                    className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider shadow-sm"
                    style={{
                      background: isFilled ? '#24044A' : '#F2CAE2',
                      color: isFilled ? '#F2CAE2' : '#24044A'
                    }}
                  >
                    {starIndex === 4 ? '4th FREE' : starIndex === 8 ? '8th FREE' : '12th FREE'}
                  </span>
                )}

                <Star
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                    isFilled ? 'fill-[#24044A] text-[#24044A]' : 'text-white/30 fill-transparent'
                  }`}
                />

                <span 
                  className={`text-[10px] font-black mt-1 ${
                    isFilled ? 'text-[#24044A]' : isFreeFoodMilestone ? 'text-[#F2CAE2]' : 'text-white/60'
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
                  ? 'shadow-md scale-[1.01]'
                  : 'opacity-80'
              }`}
              style={{
                background: 'rgba(36, 4, 74, 0.6)',
                borderColor: m.unlocked ? '#F2CAE2' : 'rgba(242, 202, 226, 0.25)'
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                  style={{
                    background: m.unlocked ? '#F2CAE2' : 'rgba(36, 4, 74, 0.8)',
                    color: m.unlocked ? '#24044A' : '#F2CAE2'
                  }}
                >
                  {m.badge}
                </span>
                {m.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
              </div>
              <div className="text-xs font-black text-white leading-snug">{m.reward}</div>
              <div className="text-[10px] font-medium mt-1" style={{ color: '#F2CAE2' }}>{m.condition}</div>
            </div>
          ))}
        </div>

        {/* NOTES SECTION BELOW STARS: RULES & REWARD INFORMATION */}
        <div 
          className="rounded-2xl p-4 sm:p-5 text-xs space-y-2 border"
          style={{
            background: 'rgba(36, 4, 74, 0.65)',
            borderColor: 'rgba(242, 202, 226, 0.3)'
          }}
        >
          <div className="font-black flex items-center gap-2 uppercase tracking-wider text-[11px]" style={{ color: '#F2CAE2' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#F2CAE2' }} />
            <span>Stuvvy Star Rewards Information & Rules</span>
          </div>

          <ul className="space-y-1.5 text-[11px] leading-relaxed list-disc list-inside text-white/90 font-medium">
            <li>
              <strong className="text-white">Star 1 to 12 Allocation:</strong> Stars remain unfilled initially. When you maintain your active subscription, each month completed fills one star on your customer profile.
            </li>
            <li>
              <strong style={{ color: '#F2CAE2' }}>The 4th Month Free Rule:</strong> When you subscribe to the Monthly Plan for <strong>3 consecutive months</strong> without gap, the <strong>4th month food is 100% FREE</strong> (30 days of daily wholesome meals delivered at ₹0).
            </li>
            <li>
              <strong style={{ color: '#F2CAE2' }}>Ongoing Reward Milestones:</strong> Reaching Star 8 unlocks an additional 8th Month Free, and reaching Star 12 unlocks a 12th Month Free plus Stuvvy VIP Beneficiary perks.
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
