import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchCustomersFromSource, CustomerRow } from '@/lib/customerSheets';
import { DEMO_CUSTOMERS_DATABASE } from '@/data/customerAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface CustomerTestimonialItem {
  id: string;
  name: string;
  locality?: string;
  photoUrl?: string;
  review?: string;
  rating?: number;
  journeySteps: string[];
  hasUpgraded: boolean;
  isFirstCustomer: boolean;
  deliveredCount: number;
}

interface DeliveryLogLite {
  customerMobile?: string;
  status?: string;
}

function getDeliveredCountsByMobile(): Map<string, number> {
  const counts = new Map<string, number>();
  try {
    const logsPath = path.join(process.cwd(), 'src', 'data', 'delivery_logs.json');
    if (fs.existsSync(logsPath)) {
      const raw = fs.readFileSync(logsPath, 'utf-8');
      const parsed = JSON.parse(raw) as DeliveryLogLite[];
      if (Array.isArray(parsed)) {
        for (const log of parsed) {
          if (log.status === 'delivered' && log.customerMobile) {
            const digits = log.customerMobile.replace(/\D/g, '').slice(-10);
            if (digits) {
              counts.set(digits, (counts.get(digits) || 0) + 1);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not read delivery logs for testimonials:', err);
  }
  return counts;
}

export async function GET() {
  try {
    const { source, customers: sheetCustomers } = await fetchCustomersFromSource();
    const rawCustomers: CustomerRow[] =
      sheetCustomers.length > 0
        ? sheetCustomers
        : DEMO_CUSTOMERS_DATABASE.map((c) => ({
            ...c,
            address: c.address || c.addresses?.[0] || '',
          }));

    const deliveredCounts = getDeliveredCountsByMobile();

    // Group rows by normalized 10-digit mobile number without overwriting history
    const byMobile = new Map<string, CustomerRow[]>();
    for (const row of rawCustomers) {
      const mobile = row.mobileNo?.replace(/\D/g, '').slice(-10);
      if (!mobile) continue;
      const list = byMobile.get(mobile) || [];
      list.push(row);
      byMobile.set(mobile, list);
    }

    const testimonials: CustomerTestimonialItem[] = [];
    let idx = 0;

    for (const [mobile, rows] of byMobile.entries()) {
      const primaryRow = rows[rows.length - 1];
      const firstRow = rows[0];
      const deliveredCount = deliveredCounts.get(mobile) || 0;

      // Build ordered, non-overwritten plan history
      const history = primaryRow.subscriptionHistory && primaryRow.subscriptionHistory.length > 0
        ? primaryRow.subscriptionHistory
        : rows
            .filter((r) => Boolean(r.plan))
            .map((r) => ({ plan: r.plan as string, startDate: r.startDate, purchaseDate: r.purchaseDate, subscriberType: r.subscriberType }));

      const distinctPlans: string[] = [];
      for (const h of history) {
        if (h.plan && distinctPlans[distinctPlans.length - 1] !== h.plan) {
          distinctPlans.push(h.plan);
        }
      }

      const hasUpgraded = distinctPlans.length > 1 || rows.some((r) => r.subscriberType === 'Upgrade');
      const journeySteps: string[] = [];

      if (distinctPlans.length > 1) {
        // Show full upgrade journey, inserting "Food Delivered" between initial plan and upgrade when deliveries exist
        journeySteps.push(distinctPlans[0]);
        if (deliveredCount > 0) {
          journeySteps.push('Food Delivered');
        }
        for (let i = 1; i < distinctPlans.length; i++) {
          const upgradedLabel = distinctPlans[i].toLowerCase().includes('upgrade')
            ? distinctPlans[i]
            : `${distinctPlans[i]} Upgrade`;
          journeySteps.push(upgradedLabel);
        }
      } else if (distinctPlans.length === 1) {
        journeySteps.push(distinctPlans[0]);
        if (deliveredCount > 0) {
          journeySteps.push('Food Delivered');
        }
      }

      const latestReviewRow = [...rows].reverse().find((r) => Boolean(r.review));
      const latestRatingRow = [...rows].reverse().find((r) => typeof r.rating === 'number');
      const latestPhotoRow = [...rows].reverse().find((r) => Boolean(r.photoUrl));

      testimonials.push({
        id: `cust-${mobile}`,
        name: primaryRow.name || firstRow.name,
        locality: primaryRow.locality || firstRow.locality,
        photoUrl: latestPhotoRow?.photoUrl,
        review: latestReviewRow?.review,
        rating: latestRatingRow?.rating,
        journeySteps,
        hasUpgraded,
        isFirstCustomer: idx === 0 || primaryRow.name === 'SANJANA',
        deliveredCount,
      });

      idx++;
    }

    // Prioritize customers who have a genuine review or upgrade journey first, while keeping rotation order deterministic
    testimonials.sort((a, b) => {
      const aScore = (a.isFirstCustomer ? 4 : 0) + (a.hasUpgraded ? 2 : 0) + (a.review ? 1 : 0);
      const bScore = (b.isFirstCustomer ? 4 : 0) + (b.hasUpgraded ? 2 : 0) + (b.review ? 1 : 0);
      return bScore - aScore;
    });

    return NextResponse.json(
      {
        success: true,
        source,
        total: testimonials.length,
        testimonials,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error building testimonials:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      testimonials: [],
    });
  }
}

