import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface CustomerRow {
  sNo: number;
  name: string;
  mobileNo: string;
  dob: string;
  address: string;
}

// Parses a CSV line supporting quoted strings with commas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'customers.csv');
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        customers: [
          {
            sNo: 1,
            name: 'SRI RAM V K',
            mobileNo: '9344795832',
            dob: '26-10-2007',
            address: 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040'
          }
        ]
      });
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length <= 1) {
      return NextResponse.json({ success: true, customers: [] });
    }

    // Header row
    const headers = parseCsvLine(lines[0]).map(h => h.toUpperCase());
    const nameIdx = headers.findIndex(h => h.includes('NAME'));
    const mobileIdx = headers.findIndex(h => h.includes('MOBILE') || h.includes('PHONE'));
    const dobIdx = headers.findIndex(h => h.includes('DOB') || h.includes('BIRTH'));
    const addressIdx = headers.findIndex(h => h.includes('ADDRESS') || h.includes('LOCATION'));
    const sNoIdx = headers.findIndex(h => h.includes('S.NO') || h.includes('SNO') || h.includes('ID'));

    const customers: CustomerRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCsvLine(lines[i]);
      if (parts.length === 0 || parts.every(p => !p)) continue;

      const sNo = sNoIdx >= 0 && parts[sNoIdx] ? parseInt(parts[sNoIdx], 10) || i : i;
      const name = (nameIdx >= 0 ? parts[nameIdx] : parts[1] || '').replace(/^"|"$/g, '').trim().toUpperCase();
      const mobileNo = (mobileIdx >= 0 ? parts[mobileIdx] : parts[2] || '').replace(/\D/g, '').slice(-10);
      const dob = (dobIdx >= 0 ? parts[dobIdx] : parts[3] || '').replace(/^"|"$/g, '').trim();
      const address = (addressIdx >= 0 ? parts[addressIdx] : parts[4] || '')
        .replace(/^"|"$/g, '')
        .trim();

      if (name || mobileNo) {
        customers.push({
          sNo,
          name,
          mobileNo,
          dob,
          address: address || 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040'
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: 'customers.csv',
      customers
    });
  } catch (error: any) {
    console.error('Error reading customers.csv:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      customers: [
        {
          sNo: 1,
          name: 'SRI RAM V K',
          mobileNo: '9344795832',
          dob: '26-10-2007',
          address: 'No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040'
        }
      ]
    });
  }
}
