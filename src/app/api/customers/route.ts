import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    if (!csvPath || !fs.existsSync(/*turbopackIgnore: true*/ csvPath)) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
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
    }

    const fileContent = fs.readFileSync(/*turbopackIgnore: true*/ csvPath, 'utf8');
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
    
    // Address indices (support ADDRESS, ADDRESS 1, ADDRESS 2, SECONDARY, LOCATION 1, LOCATION 2)
    const address1Idx = headers.findIndex(h => h === 'ADDRESS' || h === 'ADDRESS 1' || h === 'LOCATION 1' || (h.includes('ADDRESS') && !h.includes('2')));
    const address2Idx = headers.findIndex(h => h === 'ADDRESS 2' || h === 'LOCATION 2' || h.includes('ADDRESS 2') || h.includes('SECONDARY'));

    // Plan and Start Date indices
    const planIdx = headers.findIndex(h => h.includes('PLAN') || h.includes('SUBSCRIPTION'));
    const startDateIdx = headers.findIndex(h => !h.includes('DOB') && !h.includes('BIRTH') && (h.includes('START') || h.includes('BEGIN') || h.includes('FROM')));

    const sNoIdx = headers.findIndex(h => h.includes('S.NO') || h.includes('SNO') || h.includes('ID'));

    const customers: CustomerRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCsvLine(lines[i]);
      if (parts.length === 0 || parts.every(p => !p)) continue;

      const sNo = sNoIdx >= 0 && parts[sNoIdx] ? parseInt(parts[sNoIdx], 10) || i : i;
      const name = (nameIdx >= 0 ? parts[nameIdx] : parts[1] || '').replace(/^"|"$/g, '').trim().toUpperCase();
      const mobileNo = (mobileIdx >= 0 ? parts[mobileIdx] : parts[2] || '').replace(/\D/g, '').slice(-10);
      const dob = (dobIdx >= 0 ? parts[dobIdx] : parts[3] || '').replace(/^"|"$/g, '').trim();

      const addr1 = (address1Idx >= 0 ? parts[address1Idx] : parts[4] || '').replace(/^"|"$/g, '').trim();
      const addr2 = (address2Idx >= 0 ? parts[address2Idx] : '').replace(/^"|"$/g, '').trim();

      // Collect all addresses (supports separate columns or pipe '|' / ';' delimited)
      const rawAddrs: string[] = [];
      if (addr1) {
        if (addr1.includes('|') || addr1.includes(';') || addr1.includes('//') || addr1.includes('\n')) {
          rawAddrs.push(...addr1.split(/[|;\n]|\/\//).map(a => a.trim()).filter(Boolean));
        } else {
          rawAddrs.push(addr1);
        }
      }
      if (addr2) {
        rawAddrs.push(addr2);
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
          addresses: addresses.length > 0 ? addresses : (address ? [address] : []),
          plan: plan || undefined,
          startDate: startDate || undefined
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
