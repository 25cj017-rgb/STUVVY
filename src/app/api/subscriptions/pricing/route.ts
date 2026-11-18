import { NextResponse } from 'next/server';
import { fetchCustomersFromSource } from '@/lib/customerSheets';
import { STUVVY_3_PLUS_1_CONFIG } from '@/config/subscriptionConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Backend Authoritative Pricing Endpoint for Stuvvy 3+1 Meal Pass
 * Validates whether a mobile number has an eligible paid monthly subscription
 * and calculates the exact final payable amount.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mobileNumber, customerName } = body;

    let isEligibleMonthly = false;
    let customerRecord: any = null;

    if (mobileNumber) {
      const cleanMobile = String(mobileNumber).replace(/\D/g, '').slice(-10);
      const { customers } = await fetchCustomersFromSource();
      
      const found = customers.find(c => {
        const cMob = (c.mobileNo || '').replace(/\D/g, '').slice(-10);
        return cMob === cleanMobile;
      });

      if (found) {
        customerRecord = found;
        const plan = (found.plan || '').toLowerCase();
        const hasMonthlyPlan = plan.includes('month');
        const paidAmount = parseInt((found.paymentAmount || '0').replace(/\D/g, ''), 10);
        const isPaid = found.paymentStatus?.toUpperCase() === 'PAID' || paidAmount >= 2400;

        // An eligible monthly subscriber has an active/ongoing monthly plan with verified payment
        if (hasMonthlyPlan && isPaid) {
          isEligibleMonthly = true;
        }
      }
    }

    if (isEligibleMonthly) {
      return NextResponse.json({
        success: true,
        planId: STUVVY_3_PLUS_1_CONFIG.planId,
        planName: STUVVY_3_PLUS_1_CONFIG.name,
        isEligibleMonthlySubscriber: true,
        packagePrice: STUVVY_3_PLUS_1_CONFIG.packagePrice, // ₹7,500
        alreadyPaidCredit: STUVVY_3_PLUS_1_CONFIG.eligibleMonthlyCredit, // -₹2,500
        upgradeDiscount: STUVVY_3_PLUS_1_CONFIG.upgradeDiscount, // -₹100
        finalPayableAmount: STUVVY_3_PLUS_1_CONFIG.upgradePayablePrice, // ₹4,900
        freeMonthsCount: 1,
        totalDurationDays: STUVVY_3_PLUS_1_CONFIG.totalDays, // 120 days
        freeMonthEntitlement: {
          status: 'UPCOMING',
          startsOnDay: 91,
          durationDays: 30,
          guaranteedFree: true
        },
        message: 'Your previous monthly subscription payment will be adjusted! Enjoy an additional ₹100 upgrade discount.',
        customer: {
          name: customerRecord?.name,
          mobile: customerRecord?.mobileNo,
          previousPlan: customerRecord?.plan
        }
      });
    }

    // Standard / New Customer Pricing
    return NextResponse.json({
      success: true,
      planId: STUVVY_3_PLUS_1_CONFIG.planId,
      planName: STUVVY_3_PLUS_1_CONFIG.name,
      isEligibleMonthlySubscriber: false,
      packagePrice: STUVVY_3_PLUS_1_CONFIG.packagePrice, // ₹7,500
      alreadyPaidCredit: 0,
      upgradeDiscount: 0,
      finalPayableAmount: STUVVY_3_PLUS_1_CONFIG.newCustomerPrice, // ₹7,500
      freeMonthsCount: 1,
      totalDurationDays: STUVVY_3_PLUS_1_CONFIG.totalDays, // 120 days
      freeMonthEntitlement: {
        status: 'UPCOMING',
        startsOnDay: 91,
        durationDays: 30,
        guaranteedFree: true
      },
      message: 'Subscribe for 3 Months upfront and get your 4th Month completely FREE!'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Pricing calculation failed' },
      { status: 500 }
    );
  }
}
