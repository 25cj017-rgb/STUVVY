import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DeliveryLogItem } from '../delivery-logs/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LOGS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'delivery_logs.json');

function escapeCsvField(val: string | undefined): string {
  if (!val) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterDate = searchParams.get('date');

    let logs: DeliveryLogItem[] = [];
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const raw = fs.readFileSync(LOGS_FILE_PATH, 'utf-8');
      logs = JSON.parse(raw);
    }

    if (filterDate) {
      logs = logs.filter(l => l.date === filterDate);
    }

    // CSV Header with exact requested fields: NAME, DATE, STATUS, etc.
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
