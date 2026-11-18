import { UserProfile } from '../types';
import { parseDateFlexible } from '../utils/subscriptionUtils';

/**
 * Authoritative Business Configuration for STUVVY 3+1 MEAL PASS
 * 
 * Rules:
 * - 3 months paid (90 days) + 1 month completely free (30 days) = 120 days total.
 * - Standard 3-month package: ₹7,500
 * - Eligible monthly subscriber (already paid ₹2,500 monthly plan):
 *     ₹7,500 - ₹2,500 (credit) - ₹100 (upgrade discount) = ₹4,900 final payable.
 * - New / non-monthly customer: ₹7,500 final payable.
 * - Both receive the 4th month 100% free.
 */
export const STUVVY_3_PLUS_1_CONFIG = {
  planId: '3plus1',
  name: 'Stuvvy 3+1 Meal Pass',
  tagline: 'Subscribe for 3 Months. Enjoy Your 4th Month FREE!',
  headline: 'Your Meals. Your Routine. Your Reward.',
  subheadline: 'Pay for 3 Months and Enjoy Your 4th Month FREE!',
  ctaText: 'CLAIM YOUR 4TH MONTH FREE',
  popupCtaText: 'CLAIM YOUR 3+1 PASS',
  popupDismissKey: 'stuvvy_3plus1_dismissed',
  
  // Pricing structure
  monthlyPrice: 2500,
  packagePrice: 7500, // 3 months package
  eligibleMonthlyCredit: 2500,
  upgradeDiscount: 100,
  upgradePayablePrice: 4900, // 7500 - 2500 - 100
  newCustomerPrice: 7500,

  // Duration
  paidDurationDays: 90,
  freeDurationDays: 30,
  totalDays: 120, // 4 months total
  effectiveRatePerDay: 62.5, // 7500 / 120 = ₹62.50 / day

  // Promotional Messages
  upgradeMessage:
    'Your previous monthly subscription payment will be adjusted! Enjoy an additional ₹100 upgrade discount.',
  newCustomerMessage:
    'Pay for 3 months upfront and receive your 4th consecutive month completely FREE (Total 120 days of meals).',
} as const;

export interface PricingCalculationResult {
  isEligibleUpgrade: boolean;
  packagePrice: number;
  monthlyCredit: number;
  upgradeDiscount: number;
  finalPayable: number;
  message: string;
  totalDays: number;
  paidDays: number;
  freeDays: number;
}

/**
 * Checks whether a given user profile is an active/verified monthly subscriber
 * eligible for the ₹4,900 upgrade.
 */
export function checkMonthlyUpgradeEligibility(user?: UserProfile | null): boolean {
  if (!user) return false;

  const currentPlan = (user.currentPlan || '').toLowerCase();
  const rawSubscribedPlan = ((user as any).plan || '').toLowerCase();
  const history = (user as any).subscriptionHistory || [];

  const hasMonthlyInCurrent =
    currentPlan.includes('month') ||
    rawSubscribedPlan.includes('month');

  const hasMonthlyInHistory = Array.isArray(history) && history.some((h: any) =>
    (h.plan || '').toLowerCase().includes('month')
  );

  const paymentStatus = ((user as any).paymentStatus || '').toUpperCase();
  const paymentAmount = parseInt(String((user as any).paymentAmount || '0').replace(/\D/g, ''), 10);
  const isPaid = paymentStatus === 'PAID' || paymentAmount >= 2400 || (user as any).isVerified;

  return (hasMonthlyInCurrent || hasMonthlyInHistory) && isPaid;
}

/**
 * Calculates authoritative pricing and dynamic breakdown for the 3+1 Meal Pass.
 */
export function calculate3Plus1Pricing(user?: UserProfile | null): PricingCalculationResult {
  const isEligibleUpgrade = checkMonthlyUpgradeEligibility(user);

  if (isEligibleUpgrade) {
    return {
      isEligibleUpgrade: true,
      packagePrice: STUVVY_3_PLUS_1_CONFIG.packagePrice,
      monthlyCredit: STUVVY_3_PLUS_1_CONFIG.eligibleMonthlyCredit,
      upgradeDiscount: STUVVY_3_PLUS_1_CONFIG.upgradeDiscount,
      finalPayable: STUVVY_3_PLUS_1_CONFIG.upgradePayablePrice, // ₹4,900
      message: STUVVY_3_PLUS_1_CONFIG.upgradeMessage,
      totalDays: STUVVY_3_PLUS_1_CONFIG.totalDays,
      paidDays: STUVVY_3_PLUS_1_CONFIG.paidDurationDays,
      freeDays: STUVVY_3_PLUS_1_CONFIG.freeDurationDays,
    };
  }

  return {
    isEligibleUpgrade: false,
    packagePrice: STUVVY_3_PLUS_1_CONFIG.packagePrice,
    monthlyCredit: 0,
    upgradeDiscount: 0,
    finalPayable: STUVVY_3_PLUS_1_CONFIG.newCustomerPrice, // ₹7,500
    message: STUVVY_3_PLUS_1_CONFIG.newCustomerMessage,
    totalDays: STUVVY_3_PLUS_1_CONFIG.totalDays,
    paidDays: STUVVY_3_PLUS_1_CONFIG.paidDurationDays,
    freeDays: STUVVY_3_PLUS_1_CONFIG.freeDurationDays,
  };
}

export type FreeMonthStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

/**
 * Determines whether the 4th free month is UPCOMING (days 1-90), ACTIVE (days 91-120), or COMPLETED (>120).
 */
export function getFreeMonthStatus(
  startDateInput?: string | Date,
  referenceDateInput: Date = new Date()
): { status: FreeMonthStatus; label: string; currentDay: number; daysUntilFree: number } {
  const start = parseDateFlexible(startDateInput);
  start.setHours(0, 0, 0, 0);

  const ref = new Date(referenceDateInput);
  ref.setHours(0, 0, 0, 0);

  const diffMs = ref.getTime() - start.getTime();
  const currentDay = Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1);

  if (currentDay <= 90) {
    return {
      status: 'UPCOMING',
      label: 'Free Month Starts after Day 90',
      currentDay,
      daysUntilFree: 91 - currentDay,
    };
  } else if (currentDay <= 120) {
    return {
      status: 'ACTIVE',
      label: '4th Month Free Meal Pass Active',
      currentDay,
      daysUntilFree: 0,
    };
  } else {
    return {
      status: 'COMPLETED',
      label: '120-Day Pass Completed',
      currentDay,
      daysUntilFree: 0,
    };
  }
}
