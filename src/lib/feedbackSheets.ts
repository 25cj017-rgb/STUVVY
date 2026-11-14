import fs from 'fs';
import path from 'path';

export interface FeedbackEntry {
  id: string;
  name: string;
  mobile?: string;
  reviewText: string;
  rating?: number;
  tag?: string;
  timestamp?: string;
}

export const FEEDBACK_SHEET_CSV_URL =
  process.env.FEEDBACK_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1A5tBfZCrusMd3Kxmvu3-5wAJ7FbMl2VtNue0Rm64_Is/export?format=csv';

export const FEEDBACK_SHEET_CSV_BACKUP_URL =
  'https://docs.google.com/spreadsheets/d/1mAmMsLeinW8FdSy8p8uQIRPDMGKls82U4n9F16lPpvk/export?format=csv';

// Fallback initial reviews (including Sanjana's verified first-customer feedback and Yamuna J N's full feedback)
export const DEFAULT_FEEDBACK_ENTRIES: FeedbackEntry[] = [
  {
    id: 'feedback-sanjana-1',
    name: 'SANJANA',
    mobile: '9444746064',
    tag: 'Our First Customer',
    rating: 5,
    reviewText:
      "Hi, The food is really good. And importantly it's exactly like home food. Especially I liked ur packing please keep doing the same. I'm really happy with ur service. I believe and wish you keep doing the same work all the time. I'm honestly happy with the taste and work….. One small request from my side is I personally don't want to include banana due to my dad's health requirements…",
    timestamp: '11/5/2026',
  },
  {
    id: 'feedback-yamuna-1',
    name: 'YAMUNA J N',
    mobile: '9626531680',
    tag: 'Monthly Subscriber',
    rating: 5,
    reviewText:
      "Exceeded all my expectations. Stuvvy beats other delivery services on both price and service — Food exceeded all my expectation.. quality wise, quantity wise, and taste wise. I can't even point out a single standout dish because I genuinely enjoyed every single one. Stuvvy is already doing great work in food delivery. Compared to other delivery services that are costlier and not up to the mark, Stuvvy's service is more than satisfying. I hope you keep up this exact same standard as you grow and gain a huge number of customers. Wishing great heights for Stuvvy!",
    timestamp: '11/14/2026',
  },
  {
    id: 'feedback-chandran-1',
    name: 'Chandran',
    mobile: '9444746064',
    tag: 'Upgraded Subscriber',
    rating: 5,
    reviewText: 'Good work keep doing the same',
    timestamp: '11/12/2026',
  },
  {
    id: 'feedback-priyanka-1',
    name: 'PRIYANKA S',
    mobile: '7094704460',
    tag: 'Monthly Subscriber',
    rating: 5,
    reviewText: 'Good start',
    timestamp: '11/12/2026',
  },
];

// Helper to parse CSV lines safely handling quotes and commas
function parseCsvLine(line: string): string[] {
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

export function parseFeedbackCsv(fileContent: string): FeedbackEntry[] {
  const lines = fileContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/\s+/g, ' ').toUpperCase().trim());

  const timestampIdx = headers.findIndex((h) => h.includes('TIMESTAMP') || h.includes('DATE') || h.includes('TIME'));
  const nameIdx = headers.findIndex((h) => h === 'NAME' || h.includes('FULL NAME') || h.includes('NAME') || h.includes('CUSTOMER'));
  const mobileIdx = headers.findIndex((h) => h.includes('MOBILE') || h.includes('PHONE') || h.includes('WHATSAPP'));
  const planIdx = headers.findIndex((h) => h === 'PLAN' || (h.includes('PLAN') && !h.includes('PLANNED')));
  const ratingIdx = headers.findIndex(
    (h) => h.includes('OVERALL FOOD QUALITY') || h.includes('FOOD TASTE') || h.includes('RATE') || h.includes('STAR') || h.includes('RATING')
  );
  const reviewIdx = headers.findIndex(
    (h) =>
      !h.includes('SPILLAGE') &&
      !h.includes('REVIEWING') &&
      !h.includes('PLANNED') &&
      !h.includes('OKAY') &&
      (h.includes('VALUABLE REVIEWS') ||
        h.includes('VALUABLE REVIEW') ||
        h.includes('REVIEWS ABOUT') ||
        h.includes('FEEDBACK') ||
        h.includes('TESTIMONIAL') ||
        (h.includes('REVIEW') && !h.includes('WHICH MEALS')) ||
        (h.includes('EXPERIENCE') && !h.includes('SPILLAGE')))
  );
  const consentIdx = headers.findIndex((h) => h.includes('OKAY WITH IT') || h.includes('PLANNED TO SHARE'));
  const suggestionsIdx = headers.findIndex((h) => h.includes('SUGGESTION'));
  const favoriteDishIdx = headers.findIndex((h) => h.includes('ENJOY THE MOST'));

  const entries: FeedbackEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length === 0 || parts.every((p) => !p)) continue;

    // Check user consent if asked in form
    if (consentIdx >= 0 && parts[consentIdx]) {
      const consentText = parts[consentIdx].trim().toLowerCase();
      if (consentText.includes('no') || consentText.includes('dont') || consentText.includes("don't")) {
        continue;
      }
    }

    const rawName = (nameIdx >= 0 ? parts[nameIdx] : parts[1] || '').replace(/^"|"$/g, '').trim().toUpperCase();
    const rawMobile = (mobileIdx >= 0 ? parts[mobileIdx] : '').replace(/\D/g, '').slice(-10);
    const rawTimestamp = (timestampIdx >= 0 ? parts[timestampIdx] : '').replace(/^"|"$/g, '').trim();

    // Parse rating
    let rating: number | undefined;
    if (ratingIdx >= 0 && parts[ratingIdx]) {
      const parsedNum = parseFloat(parts[ratingIdx].replace(/[^\d.]/g, ''));
      if (!Number.isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
        rating = Math.round(parsedNum);
      }
    }

    // Parse review text: check both "Valuable Reviews" and "Any Suggestions"
    const valReview = reviewIdx >= 0 && parts[reviewIdx] ? parts[reviewIdx].replace(/^"|"$/g, '').trim() : '';
    const suggestions = suggestionsIdx >= 0 && parts[suggestionsIdx] ? parts[suggestionsIdx].replace(/^"|"$/g, '').trim() : '';

    let reviewText = '';
    if (valReview && suggestions && valReview.toLowerCase() !== suggestions.toLowerCase()) {
      reviewText = `${valReview} — ${suggestions}`;
    } else {
      reviewText = valReview || suggestions;
    }

    if (!reviewText) {
      // Fallback: pick the column with the longest string as review text
      let longest = '';
      for (const p of parts) {
        const cleaned = p.replace(/^"|"$/g, '').trim();
        if (cleaned.length > longest.length && cleaned.length > 15) {
          longest = cleaned;
        }
      }
      reviewText = longest;
    }

    if (reviewText && reviewText.length > 3) {
      const isSanjana = rawName.includes('SANJANA') || rawMobile === '9444746064';
      const tag = isSanjana ? 'Our First Customer' : 'Verified Subscriber';

      entries.push({
        id: `feedback-sheet-${i}-${rawMobile || rawName.slice(0, 4)}`,
        name: rawName || 'STUVVY SUBSCRIBER',
        mobile: rawMobile || undefined,
        reviewText,
        rating: rating || 5,
        tag,
        timestamp: rawTimestamp || undefined,
      });
    }
  }

  return entries;
}

export async function fetchFeedbackFromSource(): Promise<{ source: string; feedback: FeedbackEntry[] }> {
  let liveEntries: FeedbackEntry[] = [];
  let sourceUsed = 'default-fallback';

  // 1. Try Primary Google Sheet
  try {
    const res = await fetch(FEEDBACK_SHEET_CSV_URL, {
      cache: 'no-store',
      headers: { Accept: 'text/csv, text/plain, */*' },
    });

    if (res.ok) {
      const csvText = await res.text();
      if (!csvText.includes('<!DOCTYPE html') && !csvText.includes('<html')) {
        const parsed = parseFeedbackCsv(csvText);
        if (parsed.length > 0) {
          liveEntries = parsed;
          sourceUsed = 'google-sheets-live';
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch live Google Sheet feedback:', err);
  }

  // 2. If primary had no entries, try backup Google Sheet
  if (liveEntries.length === 0 && FEEDBACK_SHEET_CSV_BACKUP_URL) {
    try {
      const res = await fetch(FEEDBACK_SHEET_CSV_BACKUP_URL, {
        cache: 'no-store',
        headers: { Accept: 'text/csv, text/plain, */*' },
      });

      if (res.ok) {
        const csvText = await res.text();
        if (!csvText.includes('<!DOCTYPE html') && !csvText.includes('<html')) {
          const parsed = parseFeedbackCsv(csvText);
          if (parsed.length > 0) {
            liveEntries = parsed;
            sourceUsed = 'google-sheets-backup-live';
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch backup Google Sheet feedback:', err);
    }
  }

  // 3. Fallback to local feedback.csv if no Google Sheets live entries
  let fallbackEntries = DEFAULT_FEEDBACK_ENTRIES;
  try {
    const rootPath = path.join(process.cwd(), 'feedback.csv');
    const pubPath = path.join(process.cwd(), 'public', 'feedback.csv');
    const targetPath = fs.existsSync(pubPath) ? pubPath : fs.existsSync(rootPath) ? rootPath : '';

    if (targetPath && fs.existsSync(targetPath)) {
      const content = fs.readFileSync(targetPath, 'utf-8');
      const parsed = parseFeedbackCsv(content);
      if (parsed.length > 0) {
        fallbackEntries = parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading local feedback.csv:', err);
  }

  // 4. Merge default/local entries with live sheet entries so verified customers are never lost
  const mergedMap = new Map<string, FeedbackEntry>();

  for (const item of fallbackEntries) {
    const key = `${(item.name || '').trim().toUpperCase()}_${(item.mobile || '').replace(/\D/g, '').slice(-10)}`;
    mergedMap.set(key, item);
  }

  for (const item of liveEntries) {
    const key = `${(item.name || '').trim().toUpperCase()}_${(item.mobile || '').replace(/\D/g, '').slice(-10)}`;
    mergedMap.set(key, item);
  }

  const combined = Array.from(mergedMap.values());
  return {
    source: liveEntries.length > 0 ? `${sourceUsed} + verified-archive` : sourceUsed,
    feedback: combined.length > 0 ? combined : DEFAULT_FEEDBACK_ENTRIES,
  };
}

