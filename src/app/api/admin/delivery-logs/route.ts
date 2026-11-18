import { NextResponse } from 'next/server';
import {
  getSavedLogs,
  saveLogs,
  DeliveryLogItem,
} from '@/lib/deliveryStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export type { DeliveryLogItem };

// GET: Fetch logs, optional ?date=YYYY-MM-DD, ?mobile=..., ?name=... filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filterDate = searchParams.get('date');
  const filterMobile = searchParams.get('mobile');
  const filterName = searchParams.get('name');

  let logs = await getSavedLogs();

  if (filterDate) {
    logs = logs.filter((l) => l.date === filterDate);
  }
  if (filterMobile) {
    const cleanFilter = filterMobile.replace(/\D/g, '').slice(-10);
    logs = logs.filter((l) => (l.customerMobile || '').replace(/\D/g, '').slice(-10) === cleanFilter);
  }
  if (filterName) {
    const cleanName = filterName.trim().toUpperCase();
    logs = logs.filter((l) => {
      const lName = (l.customerName || '').trim().toUpperCase();
      return lName === cleanName || lName.includes(cleanName) || cleanName.includes(lName);
    });
  }

  // Sort by updatedAt descending
  logs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json(
    {
      success: true,
      count: logs.length,
      logs,
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

// POST: Create or update a delivery log status (changeable & persistent)
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
      markedBy = 'admin',
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

    const logs = await getSavedLogs();
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
      recipientNote:
        status === 'delivered'
          ? (recipientNote || 'Food received in good condition')
          : undefined,
      issueReason:
        status === 'not_received'
          ? (issueReason || 'Customer reported order not received')
          : status === 'paused'
          ? (issueReason || 'Order paused or canceled')
          : undefined,
      markedBy,
      updatedAt: timestampIso,
    };

    if (existingIndex >= 0) {
      logs[existingIndex] = updatedRecord;
    } else {
      logs.unshift(updatedRecord);
    }

    await saveLogs(logs);

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
      log: updatedRecord,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update delivery log' },
      { status: 500 }
    );
  }
}
