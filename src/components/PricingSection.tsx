'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Plus, Minus, Lightbulb, Zap, ArrowRight, ShieldCheck, Eye } from 'lucide-react';

import { UserProfile } from '../types';

export interface PlanOption {
  id: string;
  name: string;
  price: number;
  period: string;
  billingText: string;
  savingsBadge?: string;
  isPopular?: boolean;
  description: string;
  features: string[];
  defaultDays: number;
  ratePerDay: number;
}

export const SUBSCRIPTION_PLANS: PlanOption[] = [
  {
    id: 'daily',
    name: 'Daily Plan',
    price: 149,
    period: '/ day',
    billingText: 'Billed per day • Flexible duration',
    description: 'Flexible day-to-day fresh meal delivery with zero long-term commitment.',
    defaultDays: 1,
    ratePerDay: 149,
    features: [
      '1 Fresh Chef Meal per day',
      'Choose South, North or Healthy menu',
      'Free standard delivery slot',
      'Pause or adjust days anytime'
    ]
  },
  {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 689,
    period: '/ week',
    billingText: 'Billed weekly • Save 34% vs Daily',
    savingsBadge: 'MOST POPULAR • SAVE 34%',
    isPopular: true,
    description: 'Our most popular plan for daily hassle-free home food.',
    defaultDays: 7,
    ratePerDay: 98.43,
    features: [
      '7 Fresh Chef Meals per week',
      'Full access to all 3 cuisine categories',
      'Temporal Day Selector (Mon-Sun planning)',
      'Free priority morning/evening delivery',
      'Subsidized meal fund contribution included'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 2499,
    period: '/ month',
    billingText: 'Billed monthly • Save 44%',
    savingsBadge: 'BEST VALUE • SAVE 44%',
    description: 'Ultimate convenience & maximum savings for regular patrons.',
    defaultDays: 30,
    ratePerDay: 83.30,
    features: [
      '30 Fresh Chef Meals per month',
      'Priority delivery slot lock',
      'Free dietary customization (Keto / Low-GI)',
      'Dedicated care support manager',
      'Full flexibility to pause during vacations'
    ]
  }
];

interface PricingSectionProps {
  selectedPlan: PlanOption | null;
  onSelectPlan: (plan: PlanOption, customDays?: number, calculatedPrice?: number) => void;
  onViewMenu?: (planId: 'daily' | 'weekly' | 'monthly') => void;
  isCompactView?: boolean;
  user?: UserProfile;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  selectedPlan, 
  onSelectPlan,
  onViewMenu,
  isCompactView = false,
  user
}) => {
  // Check if current logged in user has a specific assigned plan from customers.csv
  const userPlanNormalized = (user?.plan || '').trim().toLowerCase();
  const assignedPlan = userPlanNormalized 
    ? (SUBSCRIPTION_PLANS.find(p => p.id === userPlanNormalized || userPlanNormalized.includes(p.id) || p.name.toLowerCase().includes(userPlanNormalized)) || null)
    : null;

  // If user has an assigned plan in CSV, show ONLY that plan! Otherwise show all plans.
  const plansToDisplay = assignedPlan ? [assignedPlan] : SUBSCRIPTION_PLANS;

  // State for days selector per plan
  const [daysState, setDaysState] = useState<Record<string, number>>({
    daily: 1,
    weekly: 7,
    monthly: 30
  });

  // State to track dismiss or active suggestion popup (hidden if user already has an assigned plan)
  const [showWeeklySuggestion, setShowWeeklySuggestion] = useState(true);

  const handleIncrementDays = (planId: string) => {
    setDaysState(prev => ({
      ...prev,
      [planId]: (prev[planId] || 1) + 1
    }));
  };

  const handleDecrementDays = (planId: string) => {
    setDaysState(prev => ({
      ...prev,
      [planId]: Math.max(1, (prev[planId] || 1) - 1)
    }));
  };

  const getCalculatedPrice = (plan: PlanOption) => {
    const days = daysState[plan.id] || plan.defaultDays;
    return Math.round(days * plan.ratePerDay);
  };

  const handleApplyWeeklyPlan = () => {
    const weeklyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'weekly') || SUBSCRIPTION_PLANS[1];
    setDaysState(prev => ({ ...prev, weekly: 7 }));
    onSelectPlan(weeklyPlan, 7, 689);
  };

  return (
    <section id="pricing" className={`${isCompactView ? 'p-1' : 'py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6'}`}>
      
      {/* Section Header */}
      {!isCompactView && (
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
            {assignedPlan ? 'Your Registered Plan' : 'Flexible Subscription Options'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-heading mt-3 tracking-tight">
            {assignedPlan ? `Your Assigned Plan: ${assignedPlan.name}` : 'Select Your Meal Subscription'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-2 leading-relaxed">
            {assignedPlan ? (
              <span>
                Registered under <strong>{user?.fullName}</strong>
                {user?.startDate ? ` • Deliveries begin ${user.startDate}` : ''}.
              </span>
            ) : (
              'Adjust days to automatically calculate your price. Pause or change plans anytime.'
            )}
          </p>
        </div>
      )}

      {/* WEEKLY SUBSCRIPTION POPUP / SUGGESTION BANNER (Only shown when not restricted to single assigned plan) */}
      {!assignedPlan && showWeeklySuggestion && (
        <div className="mb-8 bg-zinc-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-300 shadow-xs border border-white/10">
              <Lightbulb className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  💡 Smart Recommendation
                </span>
                <span className="text-xs text-zinc-400 font-medium">Weekly Subscription Suggestion</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-zinc-100 mt-1.5 leading-snug">
                Switch to <strong className="text-white underline underline-offset-2">Weekly Subscription (7 Days @ ₹689)</strong> to save 34% per day compared to daily orders!
              </p>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Enjoy hassle-free Mon-Sun menu selection + priority delivery slots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleApplyWeeklyPlan}
              className="bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <span>Activate Weekly Plan (₹689)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid (Renders ONLY assigned plan if user has one, or all 3 plans if not) */}
      <div className={`grid grid-cols-1 ${plansToDisplay.length === 1 ? 'max-w-lg mx-auto' : isCompactView ? 'gap-4' : 'md:grid-cols-3 gap-6'} items-stretch`}>
        {plansToDisplay.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const currentDays = daysState[plan.id] || plan.defaultDays;
          const calculatedPrice = getCalculatedPrice(plan);

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'bg-white border-2 border-zinc-950 shadow-xl ring-1 ring-zinc-950/10'
                  : 'bg-white border border-zinc-200/90 shadow-xs hover:border-zinc-300'
              }`}
            >
              {/* Savings / Popular / Assigned Badge */}
              {assignedPlan?.id === plan.id ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap border border-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-200" />
                  <span>Your Assigned Plan</span>
                </div>
              ) : plan.savingsBadge ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md whitespace-nowrap border border-zinc-800">
                  {plan.savingsBadge}
                </div>
              ) : null}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-zinc-950 font-heading">
                    {plan.name}
                  </h3>
                  {plan.id === 'weekly' && (
                    <span className="text-[10px] font-bold text-zinc-800 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                  {plan.description}
                </p>

                {/* DAY INCREASING & DECREASING CONTROL BUTTONS */}
                <div className="mt-5 p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-zinc-900">
                    <span className="text-[11px] text-zinc-600 font-bold">Subscription Days:</span>
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-zinc-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleDecrementDays(plan.id)}
                        className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 flex items-center justify-center font-black transition-colors cursor-pointer"
                        title="Decrease Day"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <span className="text-xs font-black text-zinc-900 min-w-[50px] text-center">
                        {currentDays} {currentDays === 1 ? 'Day' : 'Days'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleIncrementDays(plan.id)}
                        className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 flex items-center justify-center font-black transition-colors cursor-pointer"
                        title="Increase Day"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-medium text-right">
                    Rate: ₹{plan.ratePerDay.toFixed(2)}/day
                  </p>
                </div>

                {/* DYNAMIC PRICE DISPLAY */}
                <div className="my-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-950 font-heading tracking-tight">
                      ₹{calculatedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">
                      for {currentDays} {currentDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium mt-1">
                    {plan.billingText}
                  </p>
                </div>

                {/* WEEKLY SUGGESTION CALLOUT FOR INDIVIDUAL CARDS */}
                {plan.id !== 'weekly' ? (
                  <div className="mb-5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-700 flex items-center justify-between gap-2">
                    <span className="font-medium text-[10px]">
                      💡 Tip: Weekly plan (7 days) saves 34%!
                    </span>
                    <button
                      onClick={handleApplyWeeklyPlan}
                      className="text-[10px] font-black text-zinc-950 hover:underline shrink-0"
                    >
                      Switch Weekly
                    </button>
                  </div>
                ) : (
                  <div className="mb-5 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="font-bold text-[10px]">
                      Best Choice! Saves ₹350+ every 7 days.
                    </span>
                  </div>
                )}

                <hr className="border-zinc-100 my-4" />

                {/* Feature Bullet List */}
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* VIEW MENU & SELECT PLAN BUTTONS */}
              <div className="space-y-2 mt-2">
                <button
                  type="button"
                  onClick={() => onViewMenu && onViewMenu(plan.id as 'daily' | 'weekly' | 'monthly')}
                  className="w-full py-3 px-4 rounded-2xl font-extrabold text-xs tracking-wide transition-all bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.01]"
                >
                  <Eye className="w-4 h-4 text-zinc-700" />
                  <span>View Menu ({plan.name})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan, currentDays, calculatedPrice)}
                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    plan.isPopular
                      ? 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-md'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  }`}
                >
                  <span>Select {plan.name} (₹{calculatedPrice})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Guarantee Note */}
      {!isCompactView && (
        <div className="mt-10 text-center text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>No hidden fees • Instant pause or cancellation anytime • 100% Satisfaction Guarantee</span>
        </div>
      )}
    </section>
  );
};

