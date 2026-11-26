import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchCustomersFromSource, CustomerRow, makeCustomerKey } from '@/lib/customerSheets';
import { fetchFeedbackFromSource } from '@/lib/feedbackSheets';
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
    // 1. Live customer feedback submissions from the Google Feedback Sheet
    const { source: feedbackSource, feedback } = await fetchFeedbackFromSource();

    // 2. Fetch customer details strictly for optional profile enrichment (locality, journey steps, delivery count)
    const { customers: sheetCustomers } = await fetchCustomersFromSource();
    const rawCustomers: CustomerRow[] =
      sheetCustomers.length > 0
        ? sheetCustomers
        : DEMO_CUSTOMERS_DATABASE.map((c) => ({
            ...c,
            address: c.address || c.addresses?.[0] || '',
          }));

    const deliveredCounts = getDeliveredCountsByMobile();

    // Strictly group rows by BOTH Name and Mobile Number to prevent shared-phone collision (e.g. Sanjana and Chandran)
    const byCustomer = new Map<string, CustomerRow[]>();
    for (const row of rawCustomers) {
      const custKey = makeCustomerKey(row.name, row.mobileNo);
      if (!custKey) continue;
      const list = byCustomer.get(custKey) || [];
      list.push(row);
      byCustomer.set(custKey, list);
    }

    const testimonials: CustomerTestimonialItem[] = [];

    // ONLY create testimonials from verified feedback submissions (never from customer details rows)
    for (const item of feedback) {
      if (!item.reviewText || item.reviewText.trim().length === 0) continue;

      const cleanMobile = (item.mobile || '').replace(/\D/g, '').slice(-10);
      const cleanName = (item.name || '').trim().toUpperCase();
      const isSanjana = cleanName.includes('SANJANA') || cleanMobile === '9444746064';

      // Look up matching customer in customer details form strictly for metadata enrichment
      let matchedRows: CustomerRow[] | undefined;
      for (const [, rows] of byCustomer.entries()) {
        const rName = (rows[0]?.name || '').trim().toUpperCase();
        const rMobile = (rows[0]?.mobileNo || '').replace(/\D/g, '').slice(-10);

        // Prevent Sanjana & Chandran collision
        if (isSanjana && !rName.includes('SANJANA')) continue;
        if (!isSanjana && rName.includes('SANJANA')) continue;

        if (cleanMobile && rMobile && cleanMobile === rMobile) {
          matchedRows = rows;
          break;
        }
        if (
          cleanName &&
          rName &&
          (cleanName === rName || rName.includes(cleanName) || cleanName.includes(rName))
        ) {
          matchedRows = rows;
          break;
        }
      }

      let locality = 'Coimbatore';
      let photoUrl: string | undefined;
      let deliveredCount = cleanMobile ? deliveredCounts.get(cleanMobile) || 0 : 0;
      let journeySteps: string[] = ['Verified Customer Review'];
      let hasUpgraded = false;

      if (matchedRows && matchedRows.length > 0) {
        const primaryRow = matchedRows[matchedRows.length - 1];
        const firstRow = matchedRows[0];
        if (primaryRow.locality || firstRow.locality) {
          locality = primaryRow.locality || firstRow.locality || locality;
        }
        const rMobile = (primaryRow.mobileNo || firstRow.mobileNo || '').replace(/\D/g, '').slice(-10);
        if (rMobile && !deliveredCount) {
          deliveredCount = deliveredCounts.get(rMobile) || 0;
        }
        const latestPhoto = [...matchedRows].reverse().find((r) => Boolean(r.photoUrl));
        if (latestPhoto?.photoUrl) {
          photoUrl = latestPhoto.photoUrl;
        }

        // Build authentic journey trail from verified subscription records
        const history =
          primaryRow.subscriptionHistory && primaryRow.subscriptionHistory.length > 0
            ? primaryRow.subscriptionHistory
            : matchedRows
                .filter((r) => Boolean(r.plan))
                .map((r) => ({
                  plan: r.plan as string,
                  startDate: r.startDate,
                  purchaseDate: r.purchaseDate,
                  subscriberType: r.subscriberType,
                }));

        const distinctPlans: string[] = [];
        for (const h of history) {
          if (h.plan && distinctPlans[distinctPlans.length - 1] !== h.plan) {
            distinctPlans.push(h.plan);
          }
        }

        hasUpgraded = distinctPlans.length > 1 || matchedRows.some((r) => r.subscriberType === 'Upgrade');

        if (distinctPlans.length > 1) {
          journeySteps = [distinctPlans[0]];
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
          journeySteps = [distinctPlans[0]];
          if (deliveredCount > 0) {
            journeySteps.push('Food Delivered');
          }
        }
      }

      const displayName = (matchedRows && matchedRows[0]?.name ? matchedRows[0].name : item.name).trim().toUpperCase();

      testimonials.push({
        id: `feedback-${item.id}`,
        name: displayName,
        locality,
        photoUrl,
        review: item.reviewText,
        rating: item.rating || 5,
        journeySteps,
        hasUpgraded,
        isFirstCustomer: isSanjana,
        deliveredCount: deliveredCount || 1,
      });
    }

    // Order: Sanjana ("Our First Customer") ALWAYS first, followed by customers with reviews, then upgrades
    testimonials.sort((a, b) => {
      if (a.isFirstCustomer && !b.isFirstCustomer) return -1;
      if (!a.isFirstCustomer && b.isFirstCustomer) return 1;
      const aUpgrade = a.hasUpgraded ? 1 : 0;
      const bUpgrade = b.hasUpgraded ? 1 : 0;
      return bUpgrade - aUpgrade;
    });

    return NextResponse.json(
      {
        success: true,
        source: feedbackSource,
        total: testimonials.length,
        testimonials,
        feedback,
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

