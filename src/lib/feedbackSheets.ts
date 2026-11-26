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

// Fallback initial reviews (including Sanjana's verified first-customer feedback and live feedback form responses)
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
    id: 'feedback-shalini-1',
    name: 'SHALINI',
    mobile: '7548888549',
    tag: 'Monthly Subscriber',
    rating: 5,
    reviewText:
      "Good packaging , good quality ,good taste — Maintain the same quality and taste, don’t change",
    timestamp: '11/16/2026',
  },
  {
    id: 'feedback-chhaya-1',
    name: 'CHHAYA MARY',
    mobile: '7974432841',
    tag: 'Weekly Subscriber',
    rating: 5,
    reviewText:
      "One the best food service i had from stuvvy. Best part is delivering food on proper time. Packing is perfect. Food is tasty and healthy as exact home cooked meal.",
    timestamp: '11/25/2026',
  },
  {
    id: 'feedback-pradeep-1',
    name: 'PRADEEP J',
    mobile: '9751178184',
    tag: 'Weekly Subscriber',
    rating: 5,
    reviewText:
      "The food is very delicious, fresh, and well prepared. The overall quality and taste of the food are excellent. Food is served with good care, and the variety of food provided is satisfying. Rice and side dishes, are flavourful and well balanced. The food is served at the right temperature, and the portions are also adequate. Appreciate the team for maintaining good hygiene, food quality, and timely service. I am highly satisfied with the food supply. Keep up the excellent work!",
    timestamp: '11/26/2026',
  },
];

// RFC 4180 compliant CSV parser supporting multiline fields inside quotes and escaped quotes
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currRow: string[] = [];
  let currField = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    const nextC = i + 1 < n ? text[i + 1] : '';

    if (c === '"') {
      if (inQuotes && nextC === '"') {
        currField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      currRow.push(currField.trim());
      currField = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && nextC === '\n') {
        i++; // handle CRLF
      }
      currRow.push(currField.trim());
      currField = '';
      if (currRow.some((f) => f.length > 0)) {
        rows.push(currRow);
      }
      currRow = [];
    } else {
      currField += c;
    }
    i++;
  }

  if (currField.length > 0 || currRow.length > 0) {
    currRow.push(currField.trim());
    if (currRow.some((f) => f.length > 0)) {
      rows.push(currRow);
    }
  }

  return rows;
}

export function parseFeedbackCsv(fileContent: string): FeedbackEntry[] {
  const rows = parseCsvRows(fileContent);
  if (rows.length <= 1) return [];

  const headers = rows[0].map((h) => h.replace(/\s+/g, ' ').toUpperCase().trim());

  const timestampIdx = headers.findIndex((h) => h.includes('TIMESTAMP') || h.includes('DATE') || h.includes('TIME'));
  const nameIdx = headers.findIndex((h) => h === 'NAME' || h === 'FULL NAME' || h.startsWith('NAME') || h.includes('CUSTOMER NAME'));
  const mobileIdx = headers.findIndex((h) => h.includes('MOBILE') || h.includes('PHONE') || h.includes('WHATSAPP'));
  const planIdx = headers.findIndex((h) => h === 'PLAN' || (h.includes('PLAN') && !h.includes('PLANNED')));
  const ratingIdx = headers.findIndex(
    (h) => h.includes('OVERALL FOOD QUALITY') || h.includes('FOOD TASTE') || h.includes('RATE') || h.includes('STAR') || h.includes('RATING')
  );
  const reviewIdx = headers.findIndex(
    (h) =>
      h.includes('VALUABLE REVIEWS') ||
      h.includes('VALUABLE REVIEW') ||
      h.includes('REVIEWS ABOUT') ||
      (h.includes('REVIEW') && !h.includes('WHICH MEALS'))
  );
  const suggestionsIdx = headers.findIndex((h) => h === 'ANY SUGGESTIONS' || (h.includes('SUGGESTION') && !h.includes('SHARE')));
  const consentIdx = headers.findIndex((h) => h.includes('OKAY WITH IT') || h.includes('PLANNED TO SHARE'));

  const entries: FeedbackEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const parts = rows[i];
    if (parts.length === 0 || parts.every((p) => !p)) continue;

    // Check user consent if asked in form
    if (consentIdx >= 0 && parts[consentIdx]) {
      const consentText = parts[consentIdx].trim().toLowerCase();
      if (consentText.includes('no') || consentText.includes('dont') || consentText.includes("don't")) {
        continue;
      }
    }

    const rawName = (nameIdx >= 0 && parts[nameIdx] ? parts[nameIdx] : '').replace(/^"|"$/g, '').trim().toUpperCase();
    const rawMobile = (mobileIdx >= 0 && parts[mobileIdx] ? parts[mobileIdx] : '').replace(/\D/g, '').slice(-10);
    const rawTimestamp = (timestampIdx >= 0 && parts[timestampIdx] ? parts[timestampIdx] : '').replace(/^"|"$/g, '').trim();

    // Guard against header rows or empty names
    if (!rawName || rawName === 'NAME' || rawName.includes('QUALITY') || rawName.includes('RATE')) {
      continue;
    }

    // Parse rating
    let rating: number = 5;
    if (ratingIdx >= 0 && parts[ratingIdx]) {
      const parsedNum = parseFloat(parts[ratingIdx].replace(/[^\d.]/g, ''));
      if (!Number.isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
        rating = Math.round(parsedNum);
      }
    }

    // Parse ONLY genuine review text: prioritize column 20 ("Valuable Reviews"), fallback to column 19 ("Any Suggestions")
    const valReview = reviewIdx >= 0 && parts[reviewIdx] ? parts[reviewIdx].replace(/^"|"$/g, '').trim() : '';
    const suggestions = suggestionsIdx >= 0 && parts[suggestionsIdx] ? parts[suggestionsIdx].replace(/^"|"$/g, '').trim() : '';

    let reviewText = '';
    if (valReview && suggestions && valReview.toLowerCase() !== suggestions.toLowerCase()) {
      // If valReview is short and suggestions has substantive review text (like Yamuna/Shalini)
      if (valReview.length < 80 && suggestions.length > 25 && !suggestions.toLowerCase().startsWith('include')) {
        reviewText = `${valReview} — ${suggestions}`;
      } else {
        reviewText = valReview;
      }
    } else {
      reviewText = valReview || suggestions;
    }

    // Clean up excessive whitespace and line breaks inside the review
    reviewText = reviewText.replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Do NOT include reviews that are just "YES", "NO", or consent answers
    if (
      reviewText &&
      reviewText.length > 5 &&
      !reviewText.toUpperCase().startsWith('YES !') &&
      !reviewText.toUpperCase().startsWith('NO ')
    ) {
      const isSanjana = rawName.includes('SANJANA') || rawMobile === '9444746064';
      const tag = isSanjana ? 'Our First Customer' : 'Verified Subscriber';

      entries.push({
        id: `feedback-sheet-${i}-${rawMobile || rawName.slice(0, 4)}`,
        name: rawName,
        mobile: rawMobile || undefined,
        reviewText,
        rating,
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

  // 4. Deduplicate entries by mobile number (or name if mobile missing)
  const mergedMap = new Map<string, FeedbackEntry>();

  // Add fallback entries first (like Sanjana's verified first-customer feedback)
  for (const item of fallbackEntries) {
    const digits = (item.mobile || '').replace(/\D/g, '').slice(-10);
    const key = digits || (item.name || '').trim().toUpperCase();
    if (key) mergedMap.set(key, item);
  }

  // Live entries from the Customer Feedback Google Sheet take priority
  for (const item of liveEntries) {
    const digits = (item.mobile || '').replace(/\D/g, '').slice(-10);
    const key = digits || (item.name || '').trim().toUpperCase();
    if (key) {
      // If already present from fallback with a formatted full name, retain the fuller name
      const prev = mergedMap.get(key);
      const chosenName = prev && prev.name.length > item.name.length ? prev.name : item.name;
      mergedMap.set(key, { ...item, name: chosenName });
    }
  }

  const combined = Array.from(mergedMap.values());
  return {
    source: liveEntries.length > 0 ? `${sourceUsed} + verified-archive` : sourceUsed,
    feedback: combined.length > 0 ? combined : DEFAULT_FEEDBACK_ENTRIES,
  };
}

