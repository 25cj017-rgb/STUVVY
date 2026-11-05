/**
 * Subscription Calculation and Scheduling Utilities for STUVVY
 */

export interface SubscriptionSchedule {
  purchaseDateStr: string;      // Form submission / Payment date e.g. "29 Oct 2026"
  startDateStr: string;         // Customer's selected delivery start date e.g. "01 Nov 2026"
  endDateStr: string;           // Calculated end date e.g. "30 Nov 2026"
  durationDays: number;         // 1 (Daily), 7 (Weekly), 30 (Monthly)
  remainingDays: number;        // Days left from today
  elapsedDays: number;          // Days passed since start date
  status: 'Active' | 'Upcoming' | 'Expired';
  statusMessage: string;
  progressPercent: number;      // 0 - 100%
  startDate: Date;
  endDate: Date;
  purchaseDate: Date;
}

/**
 * Parses diverse date formats into a valid Date object:
 * - "11/1/2026" (M/D/YYYY)
 * - "10/29/2026 22:03:21"
 * - "2026-11-01" or "2026/11/01" (YYYY-MM-DD)
 * - "01-11-2026" or "01/11/2026" (DD-MM-YYYY)
 * - "Nov 1, 2026"
 */
export function parseDateFlexible(dateInput?: string | Date): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? new Date() : dateInput;

  const raw = dateInput.trim();
  if (!raw) return new Date();

  // Strip time if present for matching (e.g. "10/29/2026 22:03:21")
  const dateOnly = raw.split(' ')[0];

  // Pattern: M/D/YYYY or MM/DD/YYYY (common Google Sheets format like 11/1/2026 or 10/29/2026)
  const mdyMatch = dateOnly.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    const month = parseInt(m, 10) - 1;
    const day = parseInt(d, 10);
    const year = parseInt(y, 10);
    // If month > 11 and day <= 12, it was probably DD/MM/YYYY
    if (month > 11 && day <= 12) {
      return new Date(year, day - 1, parseInt(m, 10));
    }
    return new Date(year, month, day);
  }

  // Pattern: DD-MM-YYYY
  const dmyMatch = dateOnly.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }

  // Pattern: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = dateOnly.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }

  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Formats a Date object to a clean human-readable date string, e.g. "01 Nov 2026"
 */
export function formatDisplayDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = String(date.getDate()).padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Calculates plan duration in days:
 * - Monthly: 30 days
 * - Weekly: 7 days
 * - Daily: 1 day
 */
export function getPlanDurationDays(planName?: string): number {
  if (!planName) return 7; // Default to 7 days
  const norm = planName.toLowerCase().trim();
  if (norm.includes('month')) return 30;
  if (norm.includes('week')) return 7;
  if (norm.includes('day') || norm.includes('daily')) return 1;
  return 7;
}

/**
 * Computes the complete subscription schedule based on delivery start date and plan duration.
 *
 * Example:
 * - Purchase Date: 29 Oct 2026
 * - Selected Start Date: 01 Nov 2026
 * - Plan: Monthly (30 days)
 * - Calculated End Date: 30 Nov 2026 (01 Nov + 29 days)
 */
export function calculateSubscriptionSchedule(
  startDateInput?: string | Date,
  purchaseDateInput?: string | Date,
  planInput?: string,
  referenceDate: Date = new Date()
): SubscriptionSchedule {
  const durationDays = getPlanDurationDays(planInput);

  // Normalize dates to midnight for accurate day difference calculations
  const parsedStart = parseDateFlexible(startDateInput);
  const startDate = new Date(parsedStart.getFullYear(), parsedStart.getMonth(), parsedStart.getDate(), 0, 0, 0);

  const parsedPurchase = purchaseDateInput ? parseDateFlexible(purchaseDateInput) : new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  const purchaseDate = new Date(parsedPurchase.getFullYear(), parsedPurchase.getMonth(), parsedPurchase.getDate(), 0, 0, 0);

  // End Date = Start Date + (durationDays - 1) days
  const endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + (durationDays - 1));
  endDate.setHours(23, 59, 59, 999);

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0);

  let status: 'Active' | 'Upcoming' | 'Expired' = 'Active';
  let remainingDays = 0;
  let elapsedDays = 0;
  let statusMessage = '';
  let progressPercent = 0;

  if (today.getTime() < startDate.getTime()) {
    status = 'Upcoming';
    const diffMs = startDate.getTime() - today.getTime();
    const daysUntilStart = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    remainingDays = durationDays;
    elapsedDays = 0;
    progressPercent = 0;
    statusMessage = `Delivery starts in ${daysUntilStart} day${daysUntilStart > 1 ? 's' : ''} on ${formatDisplayDate(startDate)}`;
  } else if (today.getTime() > endDate.getTime()) {
    status = 'Expired';
    remainingDays = 0;
    elapsedDays = durationDays;
    progressPercent = 100;
    statusMessage = `Subscription ended on ${formatDisplayDate(endDate)}. Please renew to continue meals.`;
  } else {
    status = 'Active';
    const remainingMs = endDate.getTime() - today.getTime();
    remainingDays = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    const elapsedMs = today.getTime() - startDate.getTime();
    elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24))) + 1;
    progressPercent = Math.min(100, Math.round((elapsedDays / durationDays) * 100));
    statusMessage = `${remainingDays} day${remainingDays > 1 ? 's' : ''} remaining of wholesome home food delivery.`;
  }

  return {
    purchaseDateStr: formatDisplayDate(purchaseDate),
    startDateStr: formatDisplayDate(startDate),
    endDateStr: formatDisplayDate(endDate),
    durationDays,
    remainingDays,
    elapsedDays,
    status,
    statusMessage,
    progressPercent,
    startDate,
    endDate,
    purchaseDate
  };
}

/**
 * Checks whether a specific target date falls within the customer's subscription window
 */
export function isDateWithinSubscription(targetDate: Date, startDate: Date, endDate: Date): boolean {
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0).getTime();
  const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0).getTime();
  const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).getTime();

  return targetMidnight >= startMidnight && targetMidnight <= endMidnight;
}
