import { NextResponse } from 'next/server';
import { getSavedLogs, DeliveryLogItem } from '@/lib/deliveryStorage';
import { fetchCustomersFromSource } from '@/lib/customerSheets';
import { parseDateFlexible, getPlanDurationDays } from '@/utils/subscriptionUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function escapeCsvField(val: string | undefined): string {
  if (!val) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 1. Fetch saved logs from multi-layer storage
    const savedLogs = await getSavedLogs();
    const dateLogs = savedLogs.filter((l) => l.date === filterDate);

    // 2. Fetch customer directory to build full scheduled deliveries for this date
    let allSubmissions: any[] = [];
    try {
      const custData = await fetchCustomersFromSource();
      allSubmissions =
        Array.isArray(custData.allSubmissions) && custData.allSubmissions.length > 0
          ? custData.allSubmissions
          : Array.isArray(custData.customers)
          ? custData.customers
          : [];
    } catch (err) {
      console.warn('Could not fetch customers from source in export-excel:', err);
    }

    const allSessions: Array<'Breakfast' | 'Lunch' | 'Dinner'> = ['Breakfast', 'Lunch', 'Dinner'];
    const mergedMap = new Map<string, DeliveryLogItem>();

    // Add existing recorded logs for this date
    for (const l of dateLogs) {
      const mob = (l.customerMobile || '').replace(/\D/g, '').slice(-10);
      const key = `${mob}_${l.mealSession}`;
      mergedMap.set(key, l);
    }

    // Evaluate active subscribers for this date
    const targetDateObj = parseDateFlexible(filterDate);
    targetDateObj.setHours(0, 0, 0, 0);

    for (const c of allSubmissions) {
      const mob = (c.mobileNo || '').replace(/\D/g, '').slice(-10);
      if (!mob) continue;

      const duration = getPlanDurationDays(c.plan);
      const startObj = parseDateFlexible(c.startDate);
      startObj.setHours(0, 0, 0, 0);

      const endObj = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate() + duration - 1);
      endObj.setHours(23, 59, 59, 999);

      // Check if targetDate falls within plan validity
      if (targetDateObj.getTime() >= startObj.getTime() && targetDateObj.getTime() <= endObj.getTime()) {
        const optedMeals =
          c.requestedMeals && c.requestedMeals.length > 0
            ? c.requestedMeals.filter((m: any) => allSessions.includes(m))
            : allSessions;

        for (const session of optedMeals) {
          const key = `${mob}_${session}`;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, {
              id: `EXPORT-${filterDate}-${mob}-${String(session).toLowerCase()}`,
              date: filterDate,
              customerName: c.name || 'Subscriber',
              customerMobile: mob,
              planName: c.plan || 'Monthly',
              deliveryAddress: c.address || '',
              locality: c.locality || '',
              mealSession: session,
              status: 'pending',
              markedBy: 'admin',
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    const finalLogs = Array.from(mergedMap.values());
    // If no customers were active on filterDate, fallback to all saved logs
    const outputLogs = finalLogs.length > 0 ? finalLogs : savedLogs;

    // CSV Header with exact requested fields
    const headers = [
      'CUSTOMER NAME',
      'DATE',
      'STATUS',
      'MOBILE NUMBER',
      'SUBSCRIPTION PLAN',
      'MEAL SESSION',
      'DELIVERY ADDRESS',
      'DELIVERED TIME',
      'DELIVERY / ISSUE NOTE'
    ];

    const rows = outputLogs.map((l) => {
      let statusFormatted = 'PENDING';
      if (l.status === 'delivered') statusFormatted = 'DELIVERED';
      else if (l.status === 'not_received') statusFormatted = 'NOT DELIVERED';
      else if (l.status === 'paused') statusFormatted = 'CANCELED';
      else if (l.status === 'out_for_delivery') statusFormatted = 'OUT FOR DELIVERY';

      return [
        escapeCsvField(l.customerName),
        escapeCsvField(l.date || filterDate),
        escapeCsvField(statusFormatted),
        escapeCsvField(l.customerMobile),
        escapeCsvField(l.planName),
        escapeCsvField(l.mealSession),
        escapeCsvField(l.deliveryAddress),
        escapeCsvField(l.deliveredAt || '-'),
        escapeCsvField(l.issueReason || l.recipientNote || '-')
      ].join(',');
    });

    // Add UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 text perfectly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    const fileName = filterDate 
      ? `Stuvvy_Delivery_Report_${filterDate}.csv`
      : `Stuvvy_Delivery_Report_All.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to export Excel CSV' },
      { status: 500 }
    );
  }
}

