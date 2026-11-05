import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface CustomerRow {
  sNo: number;
  name: string;
  mobileNo: string;
  dob: string;
  address: string;
  addresses?: string[];
  plan?: string;
  startDate?: string;
}

const GOOGLE_SHEET_CSV_URL =
  process.env.GOOGLE_SHEETS_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/11Q7UbFV2V4kZZID1VloM80pD-rKMFdfD_6HYUfgHa6g/export?format=csv';

// Parses a CSV line supporting quoted strings with commas and escaped quotes
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

function parseCsvContent(fileContent: string): CustomerRow[] {
  const lines = fileContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length <= 1) {
    return [];
  }

  // Header row normalized (collapsed spaces, upper-case)
  const headers = parseCsvLine(lines[0]).map(h => h.replace(/\s+/g, ' ').toUpperCase().trim());

  const nameIdx = headers.findIndex(h => h.includes('FULL NAME') || h.includes('NAME'));
  const mobileIdx = headers.findIndex(h => h.includes('MOBILE') || h.includes('PHONE'));
  const dobIdx = headers.findIndex(h => h.includes('DATE OF BIRTH') || h.includes('DOB') || h.includes('BIRTH'));
  const addressIdx = headers.findIndex(h => !h.includes('EMAIL') && (h.includes('DELIVERY ADDRESS') || h.includes('ADDRESS')));
  const address2Idx = headers.findIndex(h => h.includes('ADDRESS 2') || h.includes('LOCATION 2') || h.includes('SECONDARY'));
  const planIdx = headers.findIndex(h => h.includes('SUBSCRIPTION PLAN') || h.includes('PLAN'));
  const startDateIdx = headers.findIndex(
    h => !h.includes('DOB') && !h.includes('BIRTH') && (h.includes('START') || h.includes('WHEN WOULD YOU LIKE TO START') || h.includes('BEGIN'))
  );
  const sNoIdx = headers.findIndex(h => h.includes('S.NO') || h.includes('SNO') || h === 'ID' || h.includes('TIMESTAMP'));

  const customers: CustomerRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length === 0 || parts.every(p => !p)) continue;

    const sNo = sNoIdx >= 0 && parts[sNoIdx] && !isNaN(parseInt(parts[sNoIdx], 10)) ? parseInt(parts[sNoIdx], 10) : i;
    const name = (nameIdx >= 0 ? parts[nameIdx] : parts[1] || '').replace(/^"|"$/g, '').trim().toUpperCase();
    const mobileNo = (mobileIdx >= 0 ? parts[mobileIdx] : parts[2] || '').replace(/\D/g, '').slice(-10);
    const dob = (dobIdx >= 0 ? parts[dobIdx] : parts[3] || '').replace(/^"|"$/g, '').trim();

    const rawAddr1 = (addressIdx >= 0 ? parts[addressIdx] : parts[4] || '').replace(/^"|"$/g, '').trim();
    const rawAddr2 = (address2Idx >= 0 ? parts[address2Idx] : '').replace(/^"|"$/g, '').trim();

    // Parse multi-addresses: supports "1. Address one 2. Address two" or pipe / newline separated
    const rawAddrs: string[] = [];
    if (rawAddr1) {
      if (/(?:^|\s)\d+\.\s+/.test(rawAddr1)) {
        const splitNumbered = rawAddr1
          .split(/(?:^|\s)\d+\.\s+/)
          .map(s => s.trim().replace(/^[,.-]\s*/, '').replace(/[,.-]\s*$/, ''))
          .filter(Boolean);
        rawAddrs.push(...splitNumbered);
      } else if (rawAddr1.includes('|') || rawAddr1.includes(';') || rawAddr1.includes('\n') || rawAddr1.includes('//')) {
        rawAddrs.push(...rawAddr1.split(/[|;\n]|\/\//).map(a => a.trim()).filter(Boolean));
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

    if (name || mobileNo) {
      customers.push({
        sNo,
        name,
        mobileNo,
        dob,
        address,
        addresses: addresses.length > 0 ? addresses : address ? [address] : [],
        plan: plan || undefined,
        startDate: startDate || undefined
      });
    }
  }

  return customers;
}

export async function GET() {
  // 1. First priority: Fetch live from Google Sheets
  try {
    const sheetRes = await fetch(GOOGLE_SHEET_CSV_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/csv, text/plain, */*'
      }
    });

    if (sheetRes.ok) {
      const csvText = await sheetRes.text();
      const customers = parseCsvContent(csvText);
      if (customers.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'google-sheets-live',
          total: customers.length,
          customers
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    }
  } catch (sheetErr) {
    console.warn('Could not fetch live Google Sheet, falling back to local CSV:', sheetErr);
  }

  // 2. Fallback: Local customers.csv
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
      return NextResponse.json({
        success: true,
        source: 'local-customers.csv',
        total: customers.length,
        customers
      });
    }

    // Default demo fallback if no file or sheet exists
    return NextResponse.json({
      success: true,
      source: 'demo-fallback',
      customers: [
        {
          sNo: 1,
          name: 'SRI RAM V K',
          mobileNo: '9344795832',
          dob: '26-10-2007',
          address: 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040',
          addresses: ['No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040']
        }
      ]
    });
  } catch (error: any) {
    console.error('Error reading customers.csv:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      customers: []
    });
  }
}
