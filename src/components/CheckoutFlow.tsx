'use client';

import React, { useState, useEffect } from 'react';
import { PlanOption, SUBSCRIPTION_PLANS } from './PricingSection';
import { SubscriptionCalendar, CalendarDay, generateUpcomingDays } from './SubscriptionCalendar';
import { UserProfile, CartItem } from '../types';
import { STUVVY_3_PLUS_1_CONFIG, calculate3Plus1Pricing } from '../config/subscriptionConfig';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Lock, Phone, MessageSquare, 
  Check, Plus, Minus, Lightbulb, Sparkles, ArrowRight, Calendar as CalendarIcon, 
  ShoppingBag, Clock, X, AlertCircle, MapPin, Package
} from 'lucide-react';

export const INSULATED_LUNCH_BOX_DEPOSIT = 699;

interface CheckoutFlowProps {
  plan: PlanOption;
  selectedDays?: number;
  initialPrice?: number;
  user?: UserProfile;
  cart?: CartItem[];
  checkoutMode?: 'subscription' | 'cart';
  onBack: () => void;
  onCompleteCheckout: (
    savedCalendar?: CalendarDay[],
    orderMeta?: { insulatedLunchBox?: boolean; depositAmount?: number; totalPaid?: number }
  ) => void;
  onSwitchPlan?: (plan: PlanOption, days: number, price: number) => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ 
  plan, 
  selectedDays = plan.defaultDays || 7,
  initialPrice,
  user,
  cart = [],
  checkoutMode = 'subscription',
  onBack, 
  onCompleteCheckout,
  onSwitchPlan
}) => {
  const [currentMode, setCurrentMode] = useState<'subscription' | 'cart'>(checkoutMode);
  const [currentPlan, setCurrentPlan] = useState<PlanOption>(plan);
  const [totalRangeDays, setTotalRangeDays] = useState<number>(selectedDays);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => generateUpcomingDays(selectedDays, user?.startDate));
  const [activeFoodDays, setActiveFoodDays] = useState<number>(selectedDays);

  // Synchronize when parent navigation changes modes or plans
  React.useEffect(() => {
    setCurrentMode(checkoutMode);
  }, [checkoutMode]);

  React.useEffect(() => {
    setCurrentPlan(plan);
  }, [plan]);

  React.useEffect(() => {
    setTotalRangeDays(selectedDays);
    const newGen = generateUpcomingDays(selectedDays, user?.startDate);
    setCalendarDays(newGen);
    setActiveFoodDays(newGen.filter(d => d.isDelivery).length);
  }, [selectedDays, user?.startDate]);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [email, setEmail] = useState('orders@stuvvy.in');
  const [address, setAddress] = useState(user?.selectedAddress || user?.address || (user?.addresses && user.addresses[0]) || '');
  const [deliverySlot, setDeliverySlot] = useState('Morning Breakfast (7:30 - 8:30 AM)');

  // Sync address, fullName, and mobile when user updates from customers.csv
  useEffect(() => {
    if (user?.selectedAddress) setAddress(user.selectedAddress);
    else if (user?.address) setAddress(user.address);
    else if (user?.addresses && user.addresses.length > 0) setAddress(user.addresses[0]);
    if (user?.fullName) setFullName(user.fullName);
    if (user?.mobileNumber) setMobileNumber(user.mobileNumber);
  }, [user?.address, user?.selectedAddress, user?.addresses, user?.fullName, user?.mobileNumber]);
  
  const [showAdminPaymentNotify, setShowAdminPaymentNotify] = useState<boolean>(false);
  const [orderId] = useState<string>(() => 'STV-' + Math.floor(100000 + Math.random() * 900000));

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cart Subtotal calculation
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.pricingOption === 'subsidized' ? item.item.subsidizedPrice : item.item.standardPrice;
    return acc + price * item.quantity;
  }, 0);

  // 3+1 Meal Pass pricing & eligibility
  const is3Plus1 = currentPlan.id === '3plus1';
  const pricing3Plus1 = calculate3Plus1Pricing(user);

  // Subscription calculation
  const ratePerDay = is3Plus1 
    ? STUVVY_3_PLUS_1_CONFIG.effectiveRatePerDay 
    : (currentPlan.ratePerDay || (currentPlan.price / (currentPlan.defaultDays || 1)));

  const subscriptionPrice = is3Plus1
    ? (initialPrice || pricing3Plus1.finalPayable)
    : Math.round(activeFoodDays * ratePerDay);

  const finalAmount = currentMode === 'cart' ? cartSubtotal : subscriptionPrice;

  // Optional Insulated Lunch Box Deposit (₹699) - Applicable to Weekly & Monthly Plans
  const isEligibleForDeposit =
    currentMode === 'subscription' &&
    ((currentPlan.id || '').toLowerCase().includes('month') ||
      (currentPlan.id || '').toLowerCase().includes('week') ||
      (currentPlan.id || '').toLowerCase().includes('3plus1') ||
      (currentPlan.name || '').toLowerCase().includes('monthly') ||
      (currentPlan.name || '').toLowerCase().includes('weekly') ||
      (currentPlan.name || '').toLowerCase().includes('meal pass'));

  const [includeLunchBoxDeposit, setIncludeLunchBoxDeposit] = useState<boolean>(false);
  const [showSkipDepositModal, setShowSkipDepositModal] = useState<boolean>(false);
  const [hasConfirmedSkipDeposit, setHasConfirmedSkipDeposit] = useState<boolean>(false);

  const depositAmount = (isEligibleForDeposit && includeLunchBoxDeposit) ? INSULATED_LUNCH_BOX_DEPOSIT : 0;
  const finalPayableTotal = finalAmount + depositAmount;

  const handleIncrementDays = () => {
    const newCount = totalRangeDays + 1;
    setTotalRangeDays(newCount);
    const newGen = generateUpcomingDays(newCount, user?.startDate);
    setCalendarDays(newGen);
    setActiveFoodDays(newGen.filter(d => d.isDelivery).length);
  };

  const handleDecrementDays = () => {
    const newCount = Math.max(1, totalRangeDays - 1);
    setTotalRangeDays(newCount);
    const newGen = generateUpcomingDays(newCount, user?.startDate);
    setCalendarDays(newGen);
    setActiveFoodDays(newGen.filter(d => d.isDelivery).length);
  };

  const handleApplyWeeklyPlan = () => {
    const weekly = SUBSCRIPTION_PLANS.find(p => p.id === 'weekly') || SUBSCRIPTION_PLANS[1];
    setCurrentPlan(weekly);
    setTotalRangeDays(7);
    const newGen = generateUpcomingDays(7, user?.startDate);
    setCalendarDays(newGen);
    setActiveFoodDays(7);
    if (onSwitchPlan) {
      onSwitchPlan(weekly, 7, 689);
    }
  };

  const handleCalendarDaysChange = (updatedDays: CalendarDay[], activeCount: number) => {
    setCalendarDays(updatedDays);
    setActiveFoodDays(activeCount);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Intercept: If customer is opting for Weekly/Monthly plan without selecting the deposit, show confirmation popup
    if (isEligibleForDeposit && !includeLunchBoxDeposit && !hasConfirmedSkipDeposit) {
      setShowSkipDepositModal(true);
      return;
    }
    setShowAdminPaymentNotify(true);
  };

  const handleFinalizeWithAdmin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setShowAdminPaymentNotify(false);
      setTimeout(() => {
        onCompleteCheckout(
          currentMode === 'subscription' ? calendarDays : undefined,
          {
            insulatedLunchBox: isEligibleForDeposit && includeLunchBoxDeposit,
            depositAmount: depositAmount,
            totalPaid: finalPayableTotal,
          }
        );
      }, 1000);
    }, 700);
  };

  return (
    <div className="py-6 sm:py-8 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full transition-all border border-zinc-200 shadow-xs hover:scale-105 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu / Plans</span>
        </button>

        {/* Mode Selector Toggle if cart has items */}
        {cart.length > 0 && (
          <div className="flex items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200 text-xs font-extrabold self-start sm:self-auto">
            <button
              onClick={() => setCurrentMode('cart')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentMode === 'cart'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
              <span>Meal Cart (₹{cartSubtotal})</span>
            </button>
            <button
              onClick={() => setCurrentMode('subscription')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentMode === 'subscription'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-orange-500" />
              <span>Subscription Plan ({currentPlan.name})</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SELECTION & CUSTOMER DETAILS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* VIEW A: CART ITEMS SUMMARY */}
          {currentMode === 'cart' ? (
            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-lg font-black font-heading text-zinc-950">
                    Review Your Selected Meals
                  </h2>
                </div>
                <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-black text-zinc-900">Your meal tray is empty</div>
                      <p className="text-xs text-zinc-500">Pick any delicious fresh meal from the menu to checkout.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onBack}
                      className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <span>Browse Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  cart.map((cartItem) => (
                    <div 
                      key={cartItem.item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cartItem.item.image}
                          alt={cartItem.item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-200"
                        />
                        <div>
                          <div className="text-xs font-black text-zinc-950 font-heading">
                            {cartItem.item.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-medium">
                            Qty: {cartItem.quantity} × ₹{cartItem.item.standardPrice}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-black text-zinc-950">
                        ₹{cartItem.quantity * cartItem.item.standardPrice}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Delivery slot */}
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Delivery Time Slot</span>
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                >
                  <option>Morning Breakfast (7:30 - 8:30 AM)</option>
                  <option>Afternoon Lunch (12:30 - 1:30 PM)</option>
                  <option>Evening Dinner (7:30 - 8:30 PM)</option>
                </select>
              </div>
            </div>
          ) : (
            /* VIEW B: SUBSCRIPTION CALENDAR WINDOW */
            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-lg font-black font-heading text-zinc-950">
                    Choose Delivery Days
                  </h2>
                </div>

                <div className="text-xs font-extrabold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                  {activeFoodDays} Active Days Selected
                </div>
              </div>

              <SubscriptionCalendar
                totalRangeDays={totalRangeDays}
                ratePerDay={ratePerDay}
                isPaid={false}
                startDate={user?.startDate}
                onDaysChange={handleCalendarDaysChange}
              />
            </div>
          )}

          {/* OPTIONAL INSULATED LUNCH BOX DEPOSIT SECTION (WEEKLY & MONTHLY PLANS) */}
          {isEligibleForDeposit && (
            <div 
              id="lunchbox-deposit-section"
              className={`bg-white/95 backdrop-blur-xl border rounded-[32px] p-5 sm:p-7 shadow-md transition-all space-y-3.5 ${
                includeLunchBoxDeposit 
                  ? 'border-orange-500 ring-4 ring-orange-500/10 bg-orange-50/10' 
                  : 'border-zinc-200/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black font-heading text-zinc-950 uppercase tracking-wide">
                      Insulated Lunch Box Option
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-medium">Keep your food steaming hot & fresh</p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                  includeLunchBoxDeposit 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-2xs' 
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}>
                  {includeLunchBoxDeposit ? '+₹699 Deposit Selected' : 'Optional Choice'}
                </span>
              </div>

              {/* Exact user-specified checkbox and wording */}
              <label 
                htmlFor="lunchbox-deposit-checkbox" 
                className="flex items-start gap-3.5 cursor-pointer select-none group pt-1"
              >
                <input
                  type="checkbox"
                  id="lunchbox-deposit-checkbox"
                  checked={includeLunchBoxDeposit}
                  onChange={(e) => {
                    setIncludeLunchBoxDeposit(e.target.checked);
                    if (e.target.checked) setHasConfirmedSkipDeposit(false);
                  }}
                  className="w-5 h-5 mt-0.5 rounded-md border-zinc-300 text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600 shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs sm:text-sm font-black text-zinc-950 leading-snug group-hover:text-orange-600 transition-colors">
                    I want my lunch delivered in an insulated lunch box – ₹699 refundable deposit.
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-600 font-medium leading-relaxed bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-100">
                    “The ₹699 deposit is applicable only for customers who prefer to receive their lunch in an insulated lunch box. This deposit is collected separately and is refundable subject to the return of the lunch box in acceptable condition.”
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* SUBSCRIBER DELIVERY DETAILS FORM */}
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-black font-heading text-zinc-950">
                Subscriber Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* ADDRESS SELECTION: If user has 2+ addresses, prompt asking which address to deliver to */}
              {user?.addresses && user.addresses.length > 1 ? (
                <div className="sm:col-span-2 space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span>Which delivery address should we deliver to?</span>
                    </label>
                    <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-200">
                      Select Location
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((locAddr, idx) => {
                      const isSelected = address.trim() === locAddr.trim();
                      const locNum = idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAddress(locAddr)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-orange-50/70 border-2 border-orange-500 shadow-md ring-1 ring-orange-500/20'
                              : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isSelected ? 'bg-orange-500 text-white' : 'bg-zinc-200 text-zinc-700'
                            }`}>
                              Location {locNum}
                            </span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected ? 'bg-orange-500 border-orange-500 text-white shadow-xs' : 'border-zinc-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className={`text-xs font-bold leading-relaxed ${isSelected ? 'text-zinc-950' : 'text-zinc-600'}`}>
                            {locAddr}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                      Selected Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              ) : (
                /* Single Address (No prompt needed for people with one address) */
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* PAYMENT OPTION / INSTRUCTIONS (ADMIN SETTLEMENT) */}
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <span className="w-7 h-7 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-black font-heading text-zinc-950">
                Payment & Verification
              </h2>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-950 uppercase tracking-wider">
                      Administrator Direct Settlement
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                      Zero Fees
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    All subscription and meal tray payments are verified directly by our Stuvvy Administrator. When you click <strong>Pay & Confirm</strong>, you will receive our administrator contact card to settle via Google Pay, PhonePe, Paytm, Bank Transfer, or Cash.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href="tel:+919344795832"
                  className="bg-white hover:bg-zinc-100/80 p-3 rounded-xl border border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Admin Hotline</div>
                      <div className="text-xs font-black text-zinc-950 truncate">+91 9344795832</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">Call</span>
                </a>

                <a
                  href={`https://wa.me/919344795832?text=${encodeURIComponent(
                    `Hi Stuvvy Administrator, I would like to pay ₹${finalAmount} for my Stuvvy ${currentMode === 'cart' ? 'Meal Order' : currentPlan.name} (Ref: ${orderId}). Subscriber: ${fullName}, Phone: ${mobileNumber}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-zinc-100/80 p-3 rounded-xl border border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">WhatsApp Direct</div>
                      <div className="text-xs font-black text-zinc-950 truncate">+91 9344795832</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">Chat</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY & CHECKOUT BUTTON (5 COLS) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-zinc-950 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-zinc-900 space-y-6">
            
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                Order & Billing Summary
              </span>
              <h3 className="text-2xl font-black font-heading mt-1">
                {currentMode === 'cart' ? 'Homely Meals Cart' : currentPlan.name}
              </h3>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                {currentMode === 'cart' 
                  ? `Delivering ${cart.length} item types with contactless priority`
                  : `Billed for ${activeFoodDays} delivery days at ₹${ratePerDay.toFixed(2)}/day`}
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs">
              {is3Plus1 ? (
                <>
                  <div className="flex justify-between text-zinc-300">
                    <span>Three-Month Package (90 Days)</span>
                    <span className="font-mono font-bold text-white">₹{pricing3Plus1.packagePrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-zinc-300">
                    <span>Fourth Month Benefit (30 Days)</span>
                    <span className="text-emerald-400 font-black uppercase">100% FREE (₹0)</span>
                  </div>

                  <div className="flex justify-between text-zinc-300">
                    <span>Total Service Coverage</span>
                    <span className="text-white font-mono font-bold">120 Days (4 Months)</span>
                  </div>

                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] text-zinc-300 leading-snug">
                    Pay for 3 months upfront (₹7,999) and enjoy your 4th month completely FREE! (Total 120 days of homely meals)
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-zinc-300">
                    <span>{currentMode === 'cart' ? 'Food Items Subtotal' : `Active Meal Days (${activeFoodDays} days)`}</span>
                    <span className="font-black text-white">₹{finalAmount}</span>
                  </div>

                  <div className="flex justify-between text-zinc-300">
                    <span>Delivery & Logistics</span>
                    <span className="text-emerald-400 font-black">FREE (₹0)</span>
                  </div>

                  <div className="flex justify-between text-zinc-300">
                    <span>Subsidized Meal Fund Contribution</span>
                    <span className="text-emerald-400 font-black">Included (₹0)</span>
                  </div>
                </>
              )}

              {/* INSULATED LUNCH BOX LINE ITEM */}
              {isEligibleForDeposit && includeLunchBoxDeposit && (
                <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800/80">
                  <span className="flex items-center gap-1.5 text-orange-300 font-bold">
                    <Package className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Insulated Lunch Box Deposit (Refundable)</span>
                  </span>
                  <span className="font-mono font-black text-orange-400">+₹{INSULATED_LUNCH_BOX_DEPOSIT}</span>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-black text-white">
                    Total Amount Payable
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium">All taxes & fees included</div>
                </div>
                <div className="text-2xl font-black text-orange-400 font-heading">
                  ₹{finalPayableTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Submit / Pay Button */}
            <div>
              {isSuccess ? (
                <div className="bg-emerald-600 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md animate-bounce">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Order Logged! Redirecting to Dashboard...</span>
                </div>
              ) : (
                <button
                  id="checkout-pay-btn"
                  onClick={handleSubmitPayment}
                  disabled={isProcessing || finalPayableTotal === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing Order...' : `Pay ₹${finalPayableTotal} (Notify Administrator)`}</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 text-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Admin Settlement • Zero transaction fees</span>
            </div>

          </div>
        </div>

      </div>

      {/* NOTIFY TO CONTACT ADMINISTRATOR FOR PAYMENT MODAL */}
      {showAdminPaymentNotify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white border border-zinc-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowAdminPaymentNotify(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* HEADER */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full text-xs font-black text-orange-700">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Payment Notice • Ref: {orderId}</span>
              </div>
              <h2 className="text-2xl font-black font-heading text-zinc-950 tracking-tight">
                Contact Administrator for Payment
              </h2>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                To activate your daily meals and lock in kitchen preparation, please contact our Administrator to complete the settlement of <strong>₹{finalPayableTotal}</strong>.
              </p>
            </div>

            {/* ORDER SUMMARY BOX */}
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Selected Service:</span>
                <span className="font-black text-zinc-950">
                  {currentMode === 'cart' ? 'Homely Meals Tray' : currentPlan.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Coverage / Quantity:</span>
                <span className="font-black text-zinc-950">
                  {currentMode === 'cart' 
                    ? `${cart.reduce((a, b) => a + b.quantity, 0)} Meals` 
                    : `${activeFoodDays} Active Food Days`}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Subscriber:</span>
                <span className="font-black text-zinc-950">{fullName} ({mobileNumber})</span>
              </div>
              {isEligibleForDeposit && (
                <div className="flex justify-between items-center text-zinc-600">
                  <span>Packaging Option:</span>
                  <span className="font-black text-zinc-950">
                    {includeLunchBoxDeposit ? 'Insulated Lunch Box' : 'Regular Packaging'}
                  </span>
                </div>
              )}
              {isEligibleForDeposit && includeLunchBoxDeposit && (
                <div className="flex justify-between items-center text-orange-700 font-bold">
                  <span>Refundable Lunch Box Deposit:</span>
                  <span className="font-mono font-black">+₹{INSULATED_LUNCH_BOX_DEPOSIT}</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-200 flex justify-between items-center">
                <span className="font-bold text-zinc-800">Total Payable Amount:</span>
                <span className="text-xl font-black text-orange-600 font-heading">₹{finalPayableTotal}</span>
              </div>
            </div>

            {/* QUICK CONTACT ACTIONS */}
            <div className="space-y-2.5">
              <a
                id="modal-whatsapp-admin-btn"
                href={`https://wa.me/919344795832?text=${encodeURIComponent(
                  `Hi Stuvvy Administrator, I would like to pay ₹${finalPayableTotal} for my ${currentMode === 'cart' ? 'Meal Order' : currentPlan.name}${isEligibleForDeposit && includeLunchBoxDeposit ? ' (including ₹699 Insulated Lunch Box Refundable Deposit)' : ''} (Ref: ${orderId}). Subscriber: ${fullName}, Phone: ${mobileNumber}. Packaging Preference: ${isEligibleForDeposit && includeLunchBoxDeposit ? 'Insulated Lunch Box' : 'Regular Food Packaging'}. Please confirm payment instructions.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Administrator on WhatsApp</span>
              </a>

              <a
                id="modal-call-admin-btn"
                href="tel:+919344795832"
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Hotline (+91 9344795832)</span>
              </a>
            </div>

            {/* CONFIRMATION / PROCEED */}
            <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="modal-confirm-admin-btn"
                onClick={handleFinalizeWithAdmin}
                disabled={isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3.5 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Saving Schedule...' : 'I have Notified Admin • Proceed to Dashboard'}</span>
              </button>

              <button
                onClick={() => setShowAdminPaymentNotify(false)}
                className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-3.5 px-5 rounded-2xl transition-all cursor-pointer"
              >
                Back
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP – IF CUSTOMER SKIPS THE DEPOSIT */}
      {showSkipDepositModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-zinc-200 rounded-[32px] w-full max-w-md p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowSkipDepositModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 tracking-tight">
                Are You Sure?
              </h3>
              <div className="text-xs text-zinc-600 font-medium leading-relaxed space-y-2">
                <p>
                  You have chosen to proceed without the insulated lunch box deposit.
                </p>
                <p>
                  Your lunch will be delivered in regular food packaging instead of an insulated lunch box.
                </p>
                <p className="font-bold text-zinc-900 pt-1">
                  Are you sure you want to continue without the insulated lunch box?
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSkipDepositModal(false);
                  const el = document.getElementById('lunchbox-deposit-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <span>Go Back & Select Deposit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSkipDepositModal(false);
                  setHasConfirmedSkipDeposit(true);
                  setShowAdminPaymentNotify(true);
                }}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-center"
              >
                <span>Continue Without Deposit</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
