import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface DeliveryLogItem {
  id: string; // e.g. "LOG-2026-11-05-9626531680"
  date: string; // "2026-11-05"
  customerName: string;
  customerMobile: string;
  planName: string; // "Daily", "Weekly", "Monthly"
  deliveryAddress: string;
  locality?: string;
  mealSession: 'Breakfast' | 'Lunch' | 'Dinner';
  status: 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused';
  deliveredAt?: string; // e.g. "12:35 PM"
  recipientNote?: string; // e.g. "Handed to security gate", "Received directly"
  issueReason?: string; // e.g. "Phone switched off", "Door locked"
  markedBy: 'admin' | 'customer' | 'driver';
  updatedAt: string;
}

const PUBLIC_CSV_PATH = path.join(process.cwd(), 'public', 'stuvvy_delivery_orders.csv');
const REPO_LOGS_PATH = path.join(process.cwd(), 'src', 'data', 'delivery_logs.json');
const REPO_CSV_PATH = path.join(process.cwd(), 'src', 'data', 'stuvvy_delivery_orders.csv');
const TMP_LOGS_PATH = path.join(os.tmpdir(), 'stuvvy_delivery_logs.json');
const TMP_CSV_PATH = path.join(os.tmpdir(), 'stuvvy_delivery_orders.csv');

declare global {
  // eslint-disable-next-line no-var
  var __stuvvyDeliveryLogs: DeliveryLogItem[] | undefined;
}

function escapeCsvField(val: string | undefined): string {
  if (!val) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Read logs from in-memory cache, /tmp (Vercel writable), or repo seed file
function getSavedLogs(): DeliveryLogItem[] {
  try {
    if (Array.isArray(globalThis.__stuvvyDeliveryLogs) && globalThis.__stuvvyDeliveryLogs.length > 0) {
      return globalThis.__stuvvyDeliveryLogs;
    }
    if (fs.existsSync(TMP_LOGS_PATH)) {
      const raw = fs.readFileSync(TMP_LOGS_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DeliveryLogItem[];
      globalThis.__stuvvyDeliveryLogs = parsed;
      return parsed;
    }
    if (fs.existsSync(REPO_LOGS_PATH)) {
      const raw = fs.readFileSync(REPO_LOGS_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DeliveryLogItem[];
      globalThis.__stuvvyDeliveryLogs = parsed;
      return parsed;
    }
    const defaultLogs = generateSeedLogs();
    globalThis.__stuvvyDeliveryLogs = defaultLogs;
    return defaultLogs;
  } catch (err) {
    console.error('Error reading delivery logs:', err);
    return generateSeedLogs();
  }
}

function syncExcelCsv(logs: DeliveryLogItem[]) {
  try {
    const headers = [
      'CUSTOMER NAME',
      'DATE',
      'STATUS',
      'MOBILE NUMBER',
      'SUBSCRIPTION PLAN',
      'MEAL SESSION',
      'DELIVERY ADDRESS',
      'DELIVERED TIME',
      'NOTES / ISSUE REASON'
    ];

    const rows = logs.map(l => {
      let statusFormatted = 'PENDING';
      if (l.status === 'delivered') statusFormatted = 'DELIVERED';
      else if (l.status === 'not_received') statusFormatted = 'NOT DELIVERED';
      else if (l.status === 'paused') statusFormatted = 'CANCELED';
      else if (l.status === 'out_for_delivery') statusFormatted = 'OUT FOR DELIVERY';

      return [
        escapeCsvField(l.customerName),
        escapeCsvField(l.date),
        escapeCsvField(statusFormatted),
        escapeCsvField(l.customerMobile),
        escapeCsvField(l.planName),
        escapeCsvField(l.mealSession),
        escapeCsvField(l.deliveryAddress),
        escapeCsvField(l.deliveredAt || '-'),
        escapeCsvField(l.issueReason || l.recipientNote || '-')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    try {
      fs.writeFileSync(TMP_CSV_PATH, csvContent, 'utf-8');
    } catch {}
    try {
      fs.writeFileSync(REPO_CSV_PATH, csvContent, 'utf-8');
    } catch {}
    try {
      fs.writeFileSync(PUBLIC_CSV_PATH, csvContent, 'utf-8');
    } catch {}
  } catch (err) {
    console.error('Error writing Excel CSV file:', err);
  }
}

function saveLogs(logs: DeliveryLogItem[]): boolean {
  globalThis.__stuvvyDeliveryLogs = logs;
  let wrote = false;
  try {
    fs.writeFileSync(TMP_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    wrote = true;
  } catch {}
  try {
    const dir = path.dirname(REPO_LOGS_PATH);
    if (fs.existsSync(dir)) {
      fs.writeFileSync(REPO_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
      wrote = true;
    }
  } catch {}
  syncExcelCsv(logs);
  return wrote;
}

// Seed initial logs for active customers for demo & testing
function generateSeedLogs(): DeliveryLogItem[] {
  return [
    {
      id: 'LOG-2026-11-05-9626531680',
      date: '2026-11-05',
      customerName: 'YAMUNA J N',
      customerMobile: '9626531680',
      planName: 'Monthly',
      deliveryAddress: 'Cognizant Technology Solutions, Special Economic Zone (SEZ), Saravanampatti via Keeranatham, Coimbatore',
      locality: 'Saravanampatti',
      mealSession: 'Lunch',
      status: 'delivered',
      deliveredAt: '12:28 PM',
      recipientNote: 'Handed over at Cognizant SEZ Reception counter',
      markedBy: 'admin',
      updatedAt: '2026-11-05T12:28:14Z'
    },
    {
      id: 'LOG-2026-11-05-9444746064',
      date: '2026-11-05',
      customerName: 'SANJANA',
      customerMobile: '9444746064',
      planName: 'Daily',
      deliveryAddress: '2/712, teachers colony, NGGO COLONY Thudiyalur',
      locality: 'Thudiyalur',
      mealSession: 'Lunch',
      status: 'delivered',
      deliveredAt: '12:45 PM',
      recipientNote: 'Handed to customer at doorstep',
      markedBy: 'admin',
      updatedAt: '2026-11-05T12:45:00Z'
    }
  ];
}

// GET: Fetch logs, optional ?date=YYYY-MM-DD, ?mobile=..., ?name=... filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterDate = searchParams.get('date');
  const filterMobile = searchParams.get('mobile');
  const filterName = searchParams.get('name');

  let logs = getSavedLogs();

  if (filterDate) {
    logs = logs.filter(l => l.date === filterDate);
  }
  if (filterMobile) {
    const cleanFilter = filterMobile.replace(/\D/g, '').slice(-10);
    logs = logs.filter(l => (l.customerMobile || '').replace(/\D/g, '').slice(-10) === cleanFilter);
  }
  if (filterName) {
    const cleanName = filterName.trim().toUpperCase();
    logs = logs.filter(l => {
      const lName = (l.customerName || '').trim().toUpperCase();
      return lName === cleanName || lName.includes(cleanName) || cleanName.includes(lName);
    });
  }

  // Sort by updatedAt descending
  logs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs
  });
}

// POST: Create or update a delivery log status
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      date, 
      customerName, 
      customerMobile, 
      planName, 
      deliveryAddress, 
      locality, 
      mealSession = 'Lunch', 
      status, 
      deliveredAt, 
      recipientNote, 
      issueReason, 
      markedBy = 'admin' 
    } = body;

    if (!customerMobile || !status) {
      return NextResponse.json(
        { success: false, error: 'customerMobile and status are required' },
        { status: 400 }
      );
    }

    const logDate = date || new Date().toISOString().split('T')[0];
    const normMobile = customerMobile.replace(/\D/g, '').slice(-10);
    const cleanNameSlug = (customerName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const logId = id || `LOG-${logDate}-${cleanNameSlug}-${normMobile}-${String(mealSession).toLowerCase()}`;

    const logs = getSavedLogs();
    const existingIndex = logs.findIndex(
      (l) =>
        l.id === logId ||
        (l.date === logDate &&
          (l.customerMobile || '').replace(/\D/g, '').slice(-10) === normMobile &&
          (!customerName || (l.customerName || '').trim().toUpperCase() === (customerName || '').trim().toUpperCase()) &&
          l.mealSession === mealSession)
    );

    // Exact real-time in Indian Standard Time (Asia/Kolkata) as guaranteed fallback
    const istNowStr = new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(new Date()).toUpperCase();
    const timestampIso = new Date().toISOString();

    const resolvedDeliveredAt =
      status === 'delivered'
        ? (deliveredAt && String(deliveredAt).trim() ? String(deliveredAt).trim() : istNowStr)
        : undefined;

    const updatedRecord: DeliveryLogItem = {
      id: existingIndex >= 0 ? logs[existingIndex].id : logId,
      date: logDate,
      customerName: customerName || (existingIndex >= 0 ? logs[existingIndex].customerName : 'Subscriber'),
      customerMobile: normMobile,
      planName: planName || (existingIndex >= 0 ? logs[existingIndex].planName : 'Monthly'),
      deliveryAddress: deliveryAddress || (existingIndex >= 0 ? logs[existingIndex].deliveryAddress : ''),
      locality: locality || (existingIndex >= 0 ? logs[existingIndex].locality : ''),
      mealSession,
      status,
      deliveredAt: resolvedDeliveredAt,
      recipientNote: recipientNote || (status === 'delivered' ? 'Food received in good condition' : undefined),
      issueReason: status === 'not_received' ? issueReason || 'Customer reported order not received' : undefined,
      markedBy,
      updatedAt: timestampIso
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = updatedRecord;
    } else {
      logs.unshift(updatedRecord);
    }

    saveLogs(logs);

    // Optional automatic Google Sheets / Excel Web App sync
    const webhookUrl = process.env.GOOGLE_DELIVERY_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      }).catch((err) => console.warn('Google Delivery Webhook sync warning:', err));
    }

    return NextResponse.json({
      success: true,
      message: `Delivery log updated to ${status}`,
      log: updatedRecord
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update delivery log' },
      { status: 500 }
    );
  }
}
