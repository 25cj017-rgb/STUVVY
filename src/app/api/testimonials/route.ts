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
    const { source, customers: sheetCustomers } = await fetchCustomersFromSource();
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

    for (const [custKey, rows] of byCustomer.entries()) {
      const primaryRow = rows[rows.length - 1];
      const firstRow = rows[0];
      const mobile = (primaryRow.mobileNo || firstRow.mobileNo || '').replace(/\D/g, '').slice(-10);
      const deliveredCount = deliveredCounts.get(mobile) || 0;
      const normName = (primaryRow.name || firstRow.name || '').trim().toUpperCase();
      const isSanjana = normName.includes('SANJANA');

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

      let customerReview = latestReviewRow?.review;
      // Guarantee Sanjana's authentic first-customer review is anchored to Sanjana
      if (isSanjana && (!customerReview || customerReview.length < 10)) {
        customerReview = "Hi, The food is really good. And importantly it's exactly like home food. Especially I liked ur packing please keep doing the same. I'm really happy with ur service. I believe and wish you keep doing the same work all the time. I'm honestly happy with the taste and work….. One small request from my side is I personally don't want to include banana due to my dad's health requirements…";
      }

      // Guarantee Yamuna J N's authentic feedback is anchored to Yamuna J N
      if (normName.includes('YAMUNA') && (!customerReview || customerReview.length < 10)) {
        customerReview = "Food exceeded all my expectation.. quality wise, quantity wise, and taste wise. I can't even point out a single standout dish because I genuinely enjoyed every single one. Stuvvy is already doing great work in food delivery. Compared to other delivery services that are costlier and not up to the mark, Stuvvy's service is more than satisfying. I hope you keep up this exact same standard as you grow and gain a huge number of customers. Wishing great heights for Stuvvy!";
      }

      testimonials.push({
        id: `cust-${custKey}`,
        name: primaryRow.name || firstRow.name,
        locality: primaryRow.locality || firstRow.locality,
        photoUrl: latestPhotoRow?.photoUrl,
        review: customerReview,
        rating: latestRatingRow?.rating || 5,
        journeySteps,
        hasUpgraded,
        isFirstCustomer: isSanjana,
        deliveredCount,
      });
    }

    // Merge live customer feedback submissions from the new Google Feedback Sheet
    const { source: feedbackSource, feedback } = await fetchFeedbackFromSource();

    for (const item of feedback) {
      if (!item.reviewText) continue;
      const cleanMobile = (item.mobile || '').replace(/\D/g, '').slice(-10);
      const cleanName = (item.name || '').trim().toUpperCase();
      const itemKey = makeCustomerKey(item.name, item.mobile);

      // Strictly match by BOTH name and mobile number or customer key
      const existing = testimonials.find((t) => {
        const tKey = t.id.replace(/^cust-/, '');
        if (tKey && itemKey && tKey === itemKey) return true;
        const tNormName = (t.name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const normItemName = cleanName.replace(/[^A-Z0-9]/g, '');
        return normItemName && tNormName && (tNormName === normItemName || tNormName.includes(normItemName) || normItemName.includes(tNormName));
      });

      if (existing) {
        existing.review = item.reviewText;
        if (item.rating) existing.rating = item.rating;
      } else {
        testimonials.push({
          id: `feedback-${item.id}`,
          name: item.name,
          locality: 'Coimbatore',
          review: item.reviewText,
          rating: item.rating || 5,
          journeySteps: ['Verified Customer Review'],
          hasUpgraded: false,
          isFirstCustomer: cleanName.includes('SANJANA'),
          deliveredCount: 1,
        });
      }
    }

    // Order: Sanjana ("Our First Customer") ALWAYS first, followed by customers with reviews, then upgrades
    testimonials.sort((a, b) => {
      if (a.isFirstCustomer && !b.isFirstCustomer) return -1;
      if (!a.isFirstCustomer && b.isFirstCustomer) return 1;
      const aHasReview = a.review && a.review.trim().length > 0 ? 1 : 0;
      const bHasReview = b.review && b.review.trim().length > 0 ? 1 : 0;
      if (aHasReview !== bHasReview) return bHasReview - aHasReview;
      const aUpgrade = a.hasUpgraded ? 1 : 0;
      const bUpgrade = b.hasUpgraded ? 1 : 0;
      return bUpgrade - aUpgrade;
    });

    return NextResponse.json(
      {
        success: true,
        source: `${source} + ${feedbackSource}`,
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

