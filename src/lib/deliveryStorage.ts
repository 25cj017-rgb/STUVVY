import fs from 'fs';
import path from 'path';
import os from 'os';

export interface DeliveryLogItem {
  id: string; // e.g. "LOG-2026-11-18-yamuna-9626531680-lunch"
  date: string; // "2026-11-18"
  customerName: string;
  customerMobile: string;
  planName: string; // "Daily", "Weekly", "Monthly"
  deliveryAddress: string;
  locality?: string;
  mealSession: 'Breakfast' | 'Lunch' | 'Dinner';
  status: 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused';
  deliveredAt?: string; // e.g. "12:35 PM"
  recipientNote?: string;
  issueReason?: string;
  markedBy: 'admin' | 'customer' | 'driver';
  updatedAt: string;
}

const PUBLIC_CSV_PATH = path.join(process.cwd(), 'public', 'stuvvy_delivery_orders.csv');
const REPO_LOGS_PATH = path.join(process.cwd(), 'src', 'data', 'delivery_logs.json');
const REPO_CSV_PATH = path.join(process.cwd(), 'src', 'data', 'stuvvy_delivery_orders.csv');
const TMP_LOGS_PATH = path.join(os.tmpdir(), 'stuvvy_delivery_logs.json');
const TMP_CSV_PATH = path.join(os.tmpdir(), 'stuvvy_delivery_orders.csv');

const GIST_ID = process.env.GITHUB_GIST_ID || 'f4540ccbc3ac842cde8a3083213f6293';
const GITHUB_TOKEN = process.env.GITHUB_STORAGE_TOKEN || '';

declare global {
  // eslint-disable-next-line no-var
  var __stuvvyDeliveryLogs: DeliveryLogItem[] | undefined;
}

function escapeCsvField(val: string | undefined): string {
  if (!val) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function syncExcelCsv(logs: DeliveryLogItem[]) {
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

    const rows = logs.map((l) => {
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

export function generateSeedLogs(): DeliveryLogItem[] {
  return [
    {
      id: 'LOG-2026-11-05-9626531680',
      date: '2026-11-05',
      customerName: 'YAMUNA J N',
      customerMobile: '9626531680',
      planName: 'Monthly',
      deliveryAddress:
        'Cognizant Technology Solutions, Special Economic Zone (SEZ), Saravanampatti via Keeranatham, Coimbatore',
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

// Fetch logs from GitHub Gist Cloud Store
export async function fetchLogsFromCloud(): Promise<DeliveryLogItem[] | null> {
  if (!GIST_ID) return null;
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Stuvvy-App',
      Accept: 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers,
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const file = data?.files?.['stuvvy_delivery_logs.json'];
      if (file && file.content) {
        const parsed = JSON.parse(file.content);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Notice: Could not fetch delivery logs from GitHub Gist:', err);
  }
  return null;
}

// Save logs to GitHub Gist Cloud Store
export async function saveLogsToCloud(logs: DeliveryLogItem[]): Promise<boolean> {
  if (!GIST_ID || !GITHUB_TOKEN) return false;
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'User-Agent': 'Stuvvy-App',
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'stuvvy_delivery_logs.json': {
            content: JSON.stringify(logs, null, 2),
          },
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Notice: Could not save delivery logs to GitHub Gist:', err);
    return false;
  }
}

// Read logs with multi-layer persistence (Cloud Gist -> /tmp -> local file -> memory)
export async function getSavedLogs(): Promise<DeliveryLogItem[]> {
  // 1. Check cloud gist first so all systems and browsers have the exact same real-time logs
  const cloudLogs = await fetchLogsFromCloud();
  if (cloudLogs && cloudLogs.length > 0) {
    globalThis.__stuvvyDeliveryLogs = cloudLogs;
    try {
      fs.writeFileSync(TMP_LOGS_PATH, JSON.stringify(cloudLogs, null, 2), 'utf-8');
    } catch {}
    return cloudLogs;
  }

  // 2. In-memory cache
  if (Array.isArray(globalThis.__stuvvyDeliveryLogs) && globalThis.__stuvvyDeliveryLogs.length > 0) {
    return globalThis.__stuvvyDeliveryLogs;
  }

  // 3. Writable /tmp container file
  try {
    if (fs.existsSync(TMP_LOGS_PATH)) {
      const raw = fs.readFileSync(TMP_LOGS_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DeliveryLogItem[];
      globalThis.__stuvvyDeliveryLogs = parsed;
      return parsed;
    }
  } catch {}

  // 4. Repo fallback seed file
  try {
    if (fs.existsSync(REPO_LOGS_PATH)) {
      const raw = fs.readFileSync(REPO_LOGS_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DeliveryLogItem[];
      globalThis.__stuvvyDeliveryLogs = parsed;
      return parsed;
    }
  } catch {}

  const defaultLogs = generateSeedLogs();
  globalThis.__stuvvyDeliveryLogs = defaultLogs;
  return defaultLogs;
}

// Save logs across all storage layers
export async function saveLogs(logs: DeliveryLogItem[]): Promise<boolean> {
  globalThis.__stuvvyDeliveryLogs = logs;

  try {
    fs.writeFileSync(TMP_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch {}
  try {
    const dir = path.dirname(REPO_LOGS_PATH);
    if (fs.existsSync(dir)) {
      fs.writeFileSync(REPO_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    }
  } catch {}

  syncExcelCsv(logs);

  // Sync to Cloud Gist so new devices and refreshed browsers immediately see it
  try {
    await saveLogsToCloud(logs);
  } catch (err) {
    console.warn('Notice: Background Gist sync failed:', err);
  }

  return true;
}
