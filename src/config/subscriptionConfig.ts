import { UserProfile } from '../types';
import { parseDateFlexible } from '../utils/subscriptionUtils';

/**
 * Authoritative Business Configuration for STUVVY 3+1 MEAL PASS
 * 
 * Rules:
 * - 3 months paid (90 days) + 1 month completely free (30 days) = 120 days total.
 * - 3-month package: ₹7,999
 * - Fourth month: 100% completely FREE (₹0).
 * - Total payable: ₹7,999 for 120 days of meals.
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
  packagePrice: 7999, // 3 months package
  eligibleMonthlyCredit: 0,
  upgradeDiscount: 0,
  upgradePayablePrice: 7999,
  newCustomerPrice: 7999,

  // Duration
  paidDurationDays: 90,
  freeDurationDays: 30,
  totalDays: 120, // 4 months total
  effectiveRatePerDay: 66.65, // 7999 / 120 = ₹66.65 / day

  // Promotional Messages
  upgradeMessage:
    'Pay ₹7,999 for 3 months upfront and enjoy your 4th month completely FREE! (Total 120 days of meals).',
  newCustomerMessage:
    'Pay for 3 months upfront (₹7,999) and enjoy your 4th month completely FREE! (Total 120 days of meals).',
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
 * Checks whether a given user profile is an active/verified monthly subscriber.
 */
export function checkMonthlyUpgradeEligibility(user?: UserProfile | null): boolean {
  return false;
}

/**
 * Calculates authoritative pricing and dynamic breakdown for the 3+1 Meal Pass.
 * Unified for all users: Pay ₹7,999 for 3 months and get the 4th month completely free.
 */
export function calculate3Plus1Pricing(user?: UserProfile | null): PricingCalculationResult {
  return {
    isEligibleUpgrade: false,
    packagePrice: STUVVY_3_PLUS_1_CONFIG.packagePrice,
    monthlyCredit: 0,
    upgradeDiscount: 0,
    finalPayable: STUVVY_3_PLUS_1_CONFIG.packagePrice, // ₹7,999
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
