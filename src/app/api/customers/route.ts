import { NextResponse } from 'next/server';
import { fetchCustomersFromSource } from '@/lib/customerSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { source, customers } = await fetchCustomersFromSource();

    if (customers.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source,
          total: customers.length,
          customers,
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
          addresses: ['No. 14, 2nd Cross, Anna Nagar West, Chennai - 600040'],
          plan: 'Weekly',
          startDate: '03-11-2026',
          purchaseDate: '28-10-2026',
        },
      ],
    });
  } catch (error: any) {
    console.error('Error loading customers:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      customers: [],
    });
  }
}
