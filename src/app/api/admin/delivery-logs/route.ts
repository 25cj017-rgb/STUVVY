import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  mealSession: 'Lunch' | 'Dinner';
  status: 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused';
  deliveredAt?: string; // e.g. "12:35 PM"
  recipientNote?: string; // e.g. "Handed to security gate", "Received directly"
  issueReason?: string; // e.g. "Phone switched off", "Door locked"
  markedBy: 'admin' | 'customer' | 'driver';
  updatedAt: string;
}

const LOGS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'delivery_logs.json');
const EXCEL_CSV_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'stuvvy_delivery_orders.csv');

function escapeCsvField(val: string | undefined): string {
  if (!val) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Ensure data directory and logs file exist
function getSavedLogs(): DeliveryLogItem[] {
  try {
    if (!fs.existsSync(LOGS_FILE_PATH)) {
      const defaultLogs = generateSeedLogs();
      fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(defaultLogs, null, 2), 'utf-8');
      syncExcelCsv(defaultLogs);
      return defaultLogs;
    }
    const raw = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
    return JSON.parse(raw) as DeliveryLogItem[];
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
    fs.writeFileSync(EXCEL_CSV_FILE_PATH, csvContent, 'utf-8');
  } catch (err) {
    console.error('Error writing Excel CSV file:', err);
  }
}

function saveLogs(logs: DeliveryLogItem[]): boolean {
  try {
    const dir = path.dirname(LOGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    syncExcelCsv(logs);
    return true;
  } catch (err) {
    console.error('Error saving delivery logs:', err);
    return false;
  }
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

// GET: Fetch logs, optional ?date=YYYY-MM-DD filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterDate = searchParams.get('date');
  const filterMobile = searchParams.get('mobile');

  let logs = getSavedLogs();

  if (filterDate) {
    logs = logs.filter(l => l.date === filterDate);
  }
  if (filterMobile) {
    logs = logs.filter(l => l.customerMobile === filterMobile);
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
    const logId = id || `LOG-${logDate}-${customerMobile}-${mealSession.toLowerCase()}`;

    const logs = getSavedLogs();
    const existingIndex = logs.findIndex(l => l.id === logId);

    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const timestampIso = new Date().toISOString();

    const updatedRecord: DeliveryLogItem = {
      id: logId,
      date: logDate,
      customerName: customerName || (existingIndex >= 0 ? logs[existingIndex].customerName : 'Subscriber'),
      customerMobile: customerMobile.replace(/\D/g, '').slice(-10),
      planName: planName || (existingIndex >= 0 ? logs[existingIndex].planName : 'Monthly'),
      deliveryAddress: deliveryAddress || (existingIndex >= 0 ? logs[existingIndex].deliveryAddress : ''),
      locality: locality || (existingIndex >= 0 ? logs[existingIndex].locality : ''),
      mealSession,
      status,
      deliveredAt: status === 'delivered' ? (deliveredAt || nowStr) : undefined,
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
