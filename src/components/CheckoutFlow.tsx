'use client';

import React, { useState, useEffect } from 'react';
import { PlanOption, SUBSCRIPTION_PLANS } from './PricingSection';
import { SubscriptionCalendar, CalendarDay, generateUpcomingDays } from './SubscriptionCalendar';
import { UserProfile, CartItem } from '../types';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Lock, Phone, MessageSquare, 
  Check, Plus, Minus, Lightbulb, Sparkles, ArrowRight, Calendar as CalendarIcon, 
  ShoppingBag, Clock, X, AlertCircle 
} from 'lucide-react';

interface CheckoutFlowProps {
  plan: PlanOption;
  selectedDays?: number;
  initialPrice?: number;
  user?: UserProfile;
  cart?: CartItem[];
  checkoutMode?: 'subscription' | 'cart';
  onBack: () => void;
  onCompleteCheckout: (savedCalendar?: CalendarDay[]) => void;
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
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => generateUpcomingDays(selectedDays));
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
    const newGen = generateUpcomingDays(selectedDays);
    setCalendarDays(newGen);
    setActiveFoodDays(newGen.filter(d => d.isDelivery).length);
  }, [selectedDays]);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [email, setEmail] = useState('subscriber@stuvvy.com');
  const [address, setAddress] = useState(user?.address || '');
  const [deliverySlot, setDeliverySlot] = useState('Morning Breakfast (7:30 - 8:30 AM)');

  // Sync address, fullName, and mobile when user updates from customers.csv
  useEffect(() => {
    if (user?.address) setAddress(user.address);
    if (user?.fullName) setFullName(user.fullName);
    if (user?.mobileNumber) setMobileNumber(user.mobileNumber);
  }, [user?.address, user?.fullName, user?.mobileNumber]);
  
  const [showAdminPaymentNotify, setShowAdminPaymentNotify] = useState<boolean>(false);
  const [orderId] = useState<string>(() => 'STV-' + Math.floor(100000 + Math.random() * 900000));

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cart Subtotal calculation
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.pricingOption === 'subsidized' ? item.item.subsidizedPrice : item.item.standardPrice;
    return acc + price * item.quantity;
  }, 0);

  // Subscription calculation
  const ratePerDay = currentPlan.ratePerDay || (currentPlan.price / (currentPlan.defaultDays || 1));
  const subscriptionPrice = Math.round(activeFoodDays * ratePerDay);

  const finalAmount = currentMode === 'cart' ? cartSubtotal : subscriptionPrice;

  const handleIncrementDays = () => {
    const newCount = totalRangeDays + 1;
    setTotalRangeDays(newCount);
    const newGen = generateUpcomingDays(newCount);
    setCalendarDays(newGen);
    setActiveFoodDays(newGen.filter(d => d.isDelivery).length);
  };

  const handleDecrementDays = () => {
    const newCount = Math.max(1, totalRangeDays - 1);
    setTotalRangeDays(newCount);
    const newGen = generateUpcomingDays(newCount);
    setCalendarDays(newGen);
    setActiveFoodDays(newGen.filter(d => d.isDelivery).length);
  };

  const handleApplyWeeklyPlan = () => {
    const weekly = SUBSCRIPTION_PLANS.find(p => p.id === 'weekly') || SUBSCRIPTION_PLANS[1];
    setCurrentPlan(weekly);
    setTotalRangeDays(7);
    const newGen = generateUpcomingDays(7);
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
    setShowAdminPaymentNotify(true);
  };

  const handleFinalizeWithAdmin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setShowAdminPaymentNotify(false);
      setTimeout(() => {
        onCompleteCheckout(currentMode === 'subscription' ? calendarDays : undefined);
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
                      <p className="text-xs text-zinc-500">Pick any delicious fresh meal from the daily menu to checkout.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onBack}
                      className="inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <span>Browse Daily Menu</span>
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
                onDaysChange={handleCalendarDaysChange}
              />
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

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-black text-white">Total Amount Payable</div>
                  <div className="text-[10px] text-zinc-400 font-medium">All taxes & fees included</div>
                </div>
                <div className="text-2xl font-black text-orange-400 font-heading">
                  ₹{finalAmount}
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
                  disabled={isProcessing || finalAmount === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing Order...' : `Pay ₹${finalAmount} (Notify Administrator)`}</span>
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
                To activate your daily meals and lock in kitchen preparation, please contact our Administrator to complete the settlement of <strong>₹{finalAmount}</strong>.
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
              <div className="pt-2 border-t border-zinc-200 flex justify-between items-center">
                <span className="font-bold text-zinc-800">Total Payable Amount:</span>
                <span className="text-xl font-black text-orange-600 font-heading">₹{finalAmount}</span>
              </div>
            </div>

            {/* QUICK CONTACT ACTIONS */}
            <div className="space-y-2.5">
              <a
                id="modal-whatsapp-admin-btn"
                href={`https://wa.me/919344795832?text=${encodeURIComponent(
                  `Hi Stuvvy Administrator, I would like to pay ₹${finalAmount} for my ${currentMode === 'cart' ? 'Meal Order' : currentPlan.name} (Ref: ${orderId}). Subscriber: ${fullName}, Phone: ${mobileNumber}. Please confirm payment instructions.`
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

    </div>
  );
};
