import { NextResponse } from 'next/server';
import { fetchCustomersFromSource } from '@/lib/customerSheets';
import { DEMO_CUSTOMERS_DATABASE } from '@/data/customerAuth';

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
      customers: DEMO_CUSTOMERS_DATABASE,
    });
  } catch (error: any) {
    console.error('Error loading customers:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      customers: DEMO_CUSTOMERS_DATABASE,
    });
  }
}
