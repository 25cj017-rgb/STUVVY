import fs from 'fs';
import path from 'path';

export interface SubscriptionHistoryEntry {
  plan: string;
  startDate?: string;
  purchaseDate?: string;
  subscriberType?: string;
}

export interface CustomerRow {
  sNo: number;
  name: string;
  mobileNo: string;
  dob: string;
  address: string;
  addresses?: string[];
  plan?: string;
  startDate?: string;
  purchaseDate?: string;
  email?: string;
  locality?: string;
  paymentStatus?: string;
  paymentAmount?: string;
  orderStatus?: string;
  requestedMeals?: string[];
  subscriberType?: string;
  review?: string;
  rating?: number;
  photoUrl?: string;
  subscriptionHistory?: SubscriptionHistoryEntry[];
}

export const GOOGLE_SHEET_CSV_URL =
  process.env.GOOGLE_SHEETS_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/11Q7UbFV2V4kZZID1VloM80pD-rKMFdfD_6HYUfgHa6g/export?format=csv';

// Parses a CSV line supporting quoted strings with commas and escaped quotes
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizePlanLabel(rawPlan?: string): string {
  if (!rawPlan) return '';
  const trimmed = rawPlan.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('daily')) return '₹149 Daily Plan';
  if (lower.includes('weekly')) return 'Weekly Plan';
  if (lower.includes('monthly')) return 'Monthly Plan';
  return trimmed;
}

function parseSortableTime(dateStr?: string): number {
  if (!dateStr) return 0;
  const parsed = Date.parse(dateStr);
  if (!Number.isNaN(parsed)) return parsed;
  const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (match) {
    const first = parseInt(match[1], 10);
    const second = parseInt(match[2], 10);
    const year = match[3].length === 2 ? 2000 + parseInt(match[3], 10) : parseInt(match[3], 10);
    // Support DD/MM/YYYY or MM/DD/YYYY safely
    const month = first > 12 ? second - 1 : first - 1;
    const day = first > 12 ? first : second;
    return new Date(year, month, day).getTime();
  }
  return 0;
}

export function makeCustomerKey(name?: string, mobile?: string): string {
  const cleanName = (name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
  return `${cleanName}_${cleanMobile}`;
}

/**
 * Attaches non-destructive chronological subscriptionHistory[] to each customer row
 * by grouping rows with matching normalized name AND 10-digit mobile number.
 * This guarantees customers sharing a phone number (e.g. Sanjana and Chandran)
 * are NEVER merged or confused.
 */
export function attachSubscriptionHistories(rows: CustomerRow[]): CustomerRow[] {
  const grouped = new Map<string, SubscriptionHistoryEntry[]>();

  for (const row of rows) {
    const key = makeCustomerKey(row.name, row.mobileNo);
    if (!key || !row.plan) continue;
    const list = grouped.get(key) || [];
    list.push({
      plan: normalizePlanLabel(row.plan),
      startDate: row.startDate,
      purchaseDate: row.purchaseDate,
      subscriberType: row.subscriberType,
    });
    grouped.set(key, list);
  }

  for (const [, list] of grouped) {
    list.sort((a, b) => {
      const ta = parseSortableTime(a.purchaseDate || a.startDate);
      const tb = parseSortableTime(b.purchaseDate || b.startDate);
      return ta - tb;
    });
  }

  return rows.map((row) => {
    const key = makeCustomerKey(row.name, row.mobileNo);
    const history = key ? grouped.get(key) : undefined;
    return history && history.length > 0
      ? { ...row, subscriptionHistory: history }
      : row;
  });
}

export function parseCsvContent(fileContent: string): CustomerRow[] {
  const lines = fileContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/\s+/g, ' ').toUpperCase().trim());

  const timestampIdx = headers.findIndex((h) => h.includes('TIMESTAMP') || h.includes('PURCHASE') || h.includes('ORDER DATE'));
  const nameIdx = headers.findIndex((h) => h.includes('FULL NAME') || h.includes('NAME'));
  const mobileIdx = headers.findIndex((h) => h.includes('MOBILE') || h.includes('PHONE'));
  const dobIdx = headers.findIndex((h) => h.includes('DATE OF BIRTH') || h.includes('DOB') || h.includes('BIRTH'));
  const emailIdx = headers.findIndex((h) => h.includes('EMAIL'));
  const addressIdx = headers.findIndex((h) => !h.includes('EMAIL') && (h.includes('DELIVERY ADDRESS') || h.includes('ADDRESS')));
  const address2Idx = headers.findIndex((h) => h.includes('ADDRESS 2') || h.includes('LOCATION 2') || h.includes('SECONDARY'));
  const localityIdx = headers.findIndex((h) => h.includes('AREA') || h.includes('LOCALITY') || h.includes('CITY'));
  const planIdx = headers.findIndex((h) => h.includes('SUBSCRIPTION PLAN') || h.includes('NEW PLAN') || h === 'PLAN' || h.includes('PLAN'));
  const mealsIdx = headers.findIndex((h) => h.includes('WHICH MEALS DO U NEED') || h.includes('WHICH MEALS') || h.includes('MEALS DO U NEED') || h.includes('MEALS NEEDED'));
  const startDateIdx = headers.findIndex(
    (h) => !h.includes('DOB') && !h.includes('BIRTH') && (h.includes('START') || h.includes('WHEN WOULD YOU LIKE TO START') || h.includes('BEGIN'))
  );
  // Payment Status: matches 'PAYMNET STATUS' / 'PAYMENT STATUS' (e.g. 'PAID')
  const paymentStatusIdx = headers.findIndex((h) => h === 'PAYMNET STATUS' || h === 'PAYMENT STATUS' || h.includes('PAYMNET STATUS') || h.includes('PAYMENT STATUS'));
  // Payment Amount: matches 'PAYMENT' column (amount paid e.g. '2500', '149', '1669', '1500')
  const paymentAmountIdx = headers.findIndex((h) => h === 'PAYMENT');
  const orderStatusIdx = headers.findIndex((h) => h.includes('ORDER STATUS'));
  const sNoIdx = headers.findIndex((h) => h.includes('S.NO') || h.includes('SNO') || h === 'ID');
  const subscriberTypeIdx = headers.findIndex((h) => h.includes('EXISTING') || h.includes('SUBSCRIBER TYPE') || h.includes('UPGRADING'));
  const reviewIdx = headers.findIndex((h) => h.includes('REVIEW') || h.includes('TESTIMONIAL') || h.includes('EXPERIENCE') || h.includes('FEEDBACK'));
  const ratingIdx = headers.findIndex((h) => h.includes('RATING') || h.includes('STAR'));
  const photoUrlIdx = headers.findIndex((h) => h.includes('PHOTO') || h.includes('AVATAR') || h.includes('PROFILE PIC') || h.includes('IMAGE'));

  const customers: CustomerRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length === 0 || parts.every((p) => !p)) continue;

    const sNo = sNoIdx >= 0 && parts[sNoIdx] && !isNaN(parseInt(parts[sNoIdx], 10)) ? parseInt(parts[sNoIdx], 10) : i;
    const name = (nameIdx >= 0 ? parts[nameIdx] : parts[1] || '').replace(/^"|"$/g, '').trim().toUpperCase();
    const mobileNo = (mobileIdx >= 0 ? parts[mobileIdx] : parts[2] || '').replace(/\D/g, '').slice(-10);
    const dob = (dobIdx >= 0 ? parts[dobIdx] : parts[3] || '').replace(/^"|"$/g, '').trim();
    const email = (emailIdx >= 0 ? parts[emailIdx] : '').replace(/^"|"$/g, '').trim();
    const locality = (localityIdx >= 0 ? parts[localityIdx] : '').replace(/^"|"$/g, '').trim();

    const rawAddr1 = (addressIdx >= 0 ? parts[addressIdx] : parts[4] || '').replace(/^"|"$/g, '').trim();
    const rawAddr2 = (address2Idx >= 0 ? parts[address2Idx] : '').replace(/^"|"$/g, '').trim();

    const rawAddrs: string[] = [];
    if (rawAddr1) {
      if (/(?:^|\s)\d+\.\s+/.test(rawAddr1)) {
        const splitNumbered = rawAddr1
          .split(/(?:^|\s)\d+\.\s+/)
          .map((s) => s.trim().replace(/^[,.-]\s*/, '').replace(/[,.-]\s*$/, ''))
          .filter(Boolean);
        rawAddrs.push(...splitNumbered);
      } else if (rawAddr1.includes('|') || rawAddr1.includes(';') || rawAddr1.includes('\n') || rawAddr1.includes('//')) {
        rawAddrs.push(...rawAddr1.split(/[|;\n]|\/\//).map((a) => a.trim()).filter(Boolean));
      } else {
        rawAddrs.push(rawAddr1);
      }
    }
    if (rawAddr2) {
      rawAddrs.push(rawAddr2);
    }

    const addresses = Array.from(new Set(rawAddrs.filter(Boolean)));
    const address = addresses[0] || '';

    const plan = planIdx >= 0 && parts[planIdx] ? parts[planIdx].replace(/^"|"$/g, '').trim() : undefined;
    const startDate = startDateIdx >= 0 && parts[startDateIdx] ? parts[startDateIdx].replace(/^"|"$/g, '').trim() : undefined;
    const purchaseDate = timestampIdx >= 0 && parts[timestampIdx] ? parts[timestampIdx].replace(/^"|"$/g, '').trim() : undefined;
    const paymentStatus = paymentStatusIdx >= 0 && parts[paymentStatusIdx] ? parts[paymentStatusIdx].replace(/^"|"$/g, '').trim() : undefined;
    const paymentAmount = paymentAmountIdx >= 0 && parts[paymentAmountIdx] ? parts[paymentAmountIdx].replace(/^"|"$/g, '').trim() : undefined;
    const orderStatus = orderStatusIdx >= 0 && parts[orderStatusIdx] ? parts[orderStatusIdx].replace(/^"|"$/g, '').trim() : undefined;

    // Parse requested meals (e.g. "BREAKFAST, LUNCH, DINNER" or "LUNCH")
    const rawMeals = mealsIdx >= 0 && parts[mealsIdx] ? parts[mealsIdx].replace(/^"|"$/g, '').trim() : '';
    const requestedMeals: string[] = [];
    if (rawMeals) {
      const upper = rawMeals.toUpperCase();
      if (upper.includes('BREAKFAST')) requestedMeals.push('Breakfast');
      if (upper.includes('LUNCH')) requestedMeals.push('Lunch');
      if (upper.includes('DINNER')) requestedMeals.push('Dinner');
    }

    const rawSubType = subscriberTypeIdx >= 0 && parts[subscriberTypeIdx] ? parts[subscriberTypeIdx].replace(/^"|"$/g, '').trim() : '';
    const subscriberType = rawSubType
      ? rawSubType.toLowerCase().includes('yes') || rawSubType.toLowerCase().includes('upgrade')
        ? 'Upgrade'
        : 'New'
      : undefined;

    const review = reviewIdx >= 0 && parts[reviewIdx] ? parts[reviewIdx].replace(/^"|"$/g, '').trim() : undefined;
    const rawRating = ratingIdx >= 0 && parts[ratingIdx] ? parseFloat(parts[ratingIdx].replace(/[^\d.]/g, '')) : NaN;
    const rating = !Number.isNaN(rawRating) && rawRating >= 1 && rawRating <= 5 ? Math.round(rawRating) : undefined;
    const photoUrl = photoUrlIdx >= 0 && parts[photoUrlIdx] ? parts[photoUrlIdx].replace(/^"|"$/g, '').trim() : undefined;

    if (name || mobileNo) {
      customers.push({
        sNo,
        name,
        mobileNo,
        dob,
        address,
        addresses: addresses.length > 0 ? addresses : address ? [address] : [],
        plan: plan || undefined,
        startDate: startDate || undefined,
        purchaseDate: purchaseDate || undefined,
        email: email || undefined,
        locality: locality || undefined,
        paymentStatus: paymentStatus || undefined,
        paymentAmount: paymentAmount || undefined,
        orderStatus: orderStatus || undefined,
        requestedMeals: requestedMeals.length > 0 ? requestedMeals : undefined,
        subscriberType,
        review: review || undefined,
        rating,
        photoUrl: photoUrl || undefined,
      });
    }
  }

  return attachSubscriptionHistories(customers);
}

export async function fetchCustomersFromSource(): Promise<{ source: string; customers: CustomerRow[] }> {
  try {
    const sheetRes = await fetch(GOOGLE_SHEET_CSV_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });

    if (sheetRes.ok) {
      const csvText = await sheetRes.text();
      const customers = parseCsvContent(csvText);
      if (customers.length > 0) {
        return { source: 'google-sheets-live', customers };
      }
    }
  } catch (sheetErr) {
    console.warn('Could not fetch live Google Sheet, falling back to local CSV:', sheetErr);
  }

  try {
    const rootPath = path.join(process.cwd(), 'customers.csv');
    const publicPath = path.join(process.cwd(), 'public', 'customers.csv');

    let csvPath = '';
    if (fs.existsSync(rootPath) && fs.existsSync(publicPath)) {
      const rootMtime = fs.statSync(rootPath).mtimeMs;
      const pubMtime = fs.statSync(publicPath).mtimeMs;
      csvPath = pubMtime > rootMtime ? publicPath : rootPath;
    } else if (fs.existsSync(rootPath)) {
      csvPath = rootPath;
    } else if (fs.existsSync(publicPath)) {
      csvPath = publicPath;
    }

    if (csvPath && fs.existsSync(/*turbopackIgnore: true*/ csvPath)) {
      const fileContent = fs.readFileSync(/*turbopackIgnore: true*/ csvPath, 'utf8');
      const customers = parseCsvContent(fileContent);
      return { source: 'local-customers.csv', customers };
    }
  } catch (error) {
    console.error('Error reading local customers.csv:', error);
  }

  return { source: 'empty', customers: [] };
}

