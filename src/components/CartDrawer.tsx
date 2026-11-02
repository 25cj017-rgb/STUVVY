'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Clock, ArrowRight, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem, DayOfWeek, MenuItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem, day: DayOfWeek) => void;
  onRemoveFromCart: (itemId: string, day: DayOfWeek) => void;
  onClearCart?: () => void;
  onProceedToCheckout: () => void;
  selectedDay: DayOfWeek;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onProceedToCheckout,
  selectedDay
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'lunch' | 'dinner'>('morning');

  if (!isOpen) return null;

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => {
    const price = item.pricingOption === 'subsidized' ? item.item.subsidizedPrice : item.item.standardPrice;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-zinc-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-950 font-heading">
                Your Meal Tray
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-200/70 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl border border-orange-100">
                🍛
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 font-heading">
                  Your tray is empty
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                  Add your favorite crispy dosas, fluffy idlis, or wholesome lunch thalis from the menu.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold py-2.5 px-6 rounded-full shadow-xs transition-all cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Selected Delicacies
                </div>

                {cart.map((cartItem) => {
                  const day = cartItem.selectedDays[0] || selectedDay;
                  const itemPrice = cartItem.pricingOption === 'subsidized'
                    ? cartItem.item.subsidizedPrice
                    : cartItem.item.standardPrice;
                  const itemTotal = itemPrice * cartItem.quantity;

                  return (
                    <div
                      key={`${cartItem.item.id}-${day}`}
                      className="bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-3.5 flex items-center gap-3.5 transition-all hover:border-zinc-300"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-zinc-200/70 shadow-2xs">
                        <img
                          src={cartItem.item.image}
                          alt={cartItem.item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-zinc-900 truncate font-heading">
                          {cartItem.item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-extrabold text-orange-600">
                            ₹{itemPrice}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            • {cartItem.item.nutritionalInfo.calories} kcal
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-white border border-zinc-200 rounded-xl shadow-2xs p-1">
                        <button
                          onClick={() => onRemoveFromCart(cartItem.item.id, day)}
                          className="w-6 h-6 rounded-lg text-zinc-600 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="px-2 text-xs font-black text-zinc-900">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => onAddToCart(cartItem.item, day)}
                          className="w-6 h-6 rounded-lg text-zinc-600 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Slot Choice */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Delivery Time Slot
                  </span>
                  <span className="text-emerald-600 font-bold">Priority Free</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'morning', label: 'Breakfast', time: '7:30 - 8:30 AM' },
                    { id: 'lunch', label: 'Lunch', time: '12:30 - 1:30 PM' },
                    { id: 'dinner', label: 'Dinner', time: '7:30 - 8:30 PM' },
                  ].map((slot) => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="text-[11px] font-extrabold">{slot.label}</div>
                        <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {slot.time}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-zinc-50/90 rounded-2xl p-4 border border-zinc-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Food Items Total</span>
                  <span className="font-bold text-zinc-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Homely Delivery Fee</span>
                  <span className="font-bold text-emerald-600 uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Eco Packaging & Taxes</span>
                  <span className="font-bold text-emerald-600">₹0</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-black text-zinc-950">
                  <span>Total Payable</span>
                  <span className="text-base text-zinc-950">₹{subtotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-zinc-200/80 bg-white space-y-2">
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-3.5 px-5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-between cursor-pointer group hover:scale-[1.01]"
            >
              <div className="text-left">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Subtotal</div>
                <div className="text-sm font-black">₹{subtotal}</div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe Contactless Home Delivery • 100% Fresh Guarantee</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
