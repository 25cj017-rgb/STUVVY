'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Star, Clock, Flame, Dumbbell, ShieldCheck, Heart, 
  Check, Calendar, Info, ShoppingBag, HeartHandshake, Sparkles 
} from 'lucide-react';
import { MenuItem, DayOfWeek, UserProfile } from '../types';
import { DAYS_OF_WEEK } from '../data/mockData';

interface Screen3MealDetailsProps {
  item: MenuItem | null;
  user: UserProfile;
  onBack: () => void;
  onSubscribePlan: (item: MenuItem, selectedDays: DayOfWeek[], pricingTier: 'standard' | 'subsidized') => void;
  isLowBandwidth: boolean;
}

export const Screen3MealDetails: React.FC<Screen3MealDetailsProps> = ({
  item,
  user,
  onBack,
  onSubscribePlan,
  isLowBandwidth,
}) => {
  // Mon-Sun selection state (default to all available days for the item)
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    item ? item.days : ['Mon', 'Wed', 'Fri']
  );

  // Pricing option toggle: standard vs subsidized
  const [pricingOption, setPricingOption] = useState<'standard' | 'subsidized'>(
    user.beneficiaryStatus !== 'Standard' ? 'subsidized' : 'standard'
  );

  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <h3 className="text-base font-bold text-gray-800">No meal selected</h3>
          <p className="text-xs text-gray-500 mt-1">Please select a meal from the Discover screen.</p>
          <button
            onClick={onBack}
            className="mt-4 bg-orange-600 text-white text-xs font-bold py-2 px-4 rounded-xl"
          >
            Go to Discover
          </button>
        </div>
      </div>
    );
  }

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least 1 day
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const calculateTotalPrice = () => {
    const unitPrice = pricingOption === 'subsidized' ? item.subsidizedPrice : item.standardPrice;
    return unitPrice * selectedDays.length;
  };

  const handleSubscribeSubmit = () => {
    setIsSubscribedSuccess(true);
    onSubscribePlan(item, selectedDays, pricingOption);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-gray-800">
      
      {/* Top Header Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-[52px] z-30 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Screen 3 • Meal & Plan Details
        </span>
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-4">
        
        {/* Large Featured Image */}
        <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-md bg-orange-100 mb-5 border border-gray-200">
          {!isLowBandwidth ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-2">
                {item.categoryId === 'south' ? '🍚' : item.categoryId === 'north' ? '🥘' : '🥗'}
              </span>
              <h2 className="text-xl font-black">{item.name}</h2>
              <span className="text-xs bg-black/20 px-3 py-1 rounded-full mt-2 font-semibold">
                3G Low-Bandwidth Mode
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>{item.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
            </span>
            <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              {item.categoryName}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-gray-900 px-3 py-1.5 rounded-2xl shadow-md text-xs font-bold flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{item.rating} ({item.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Meal Header Info */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{item.name}</h1>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
              <p className="text-xs font-bold text-orange-700 mt-2">Portion Size: {item.portionSize}</p>
            </div>
          </div>

          {/* Nutritional Info Grid */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Nutritional Breakdown</span>
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-orange-50 p-2.5 rounded-2xl border border-orange-100">
                <span className="block text-sm font-black text-orange-700">{item.nutritionalInfo.calories}</span>
                <span className="text-[10px] text-gray-500 font-semibold">Calories</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                <span className="block text-sm font-black text-emerald-700">{item.nutritionalInfo.protein}</span>
                <span className="text-[10px] text-gray-500 font-semibold">Protein</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                <span className="block text-sm font-black text-amber-700">{item.nutritionalInfo.carbs}</span>
                <span className="text-[10px] text-gray-500 font-semibold">Carbs</span>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                <span className="block text-sm font-black text-purple-700">{item.nutritionalInfo.fats}</span>
                <span className="text-[10px] text-gray-500 font-semibold">Healthy Fats</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. MON-SUN SELECTOR FOR WEEKLY PLANNING */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Weekly Delivery Days Selector</span>
              </h3>
              <p className="text-xs text-gray-500">
                Select which days of the week you want this meal delivered.
              </p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {selectedDays.length} Days Selected
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedDays.includes(d.key);
              const isAvailableOnDay = item.days.includes(d.key);
              return (
                <button
                  key={d.key}
                  disabled={!isAvailableOnDay}
                  onClick={() => toggleDay(d.key)}
                  className={`py-2.5 px-1 rounded-2xl text-xs font-extrabold border transition-all flex flex-col items-center justify-center ${
                    !isAvailableOnDay
                      ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                      : isSelected
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm scale-102'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-50'
                  }`}
                >
                  <span className="text-[9px] uppercase font-semibold">{d.key}</span>
                  <span className="text-xs">{d.full.slice(0, 3)}</span>
                  {isSelected && <Check className="w-3 h-3 text-white mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CRITICAL PRICING TOGGLE: STANDARD VS SUBSIDIZED/NEEDY OPTION */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-6">
          <div className="mb-3">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-orange-600" />
              <span>Select Pricing Tier & Subsidy Option</span>
            </h3>
            <p className="text-xs text-gray-500">
              Stuvvy provides transparent tiered pricing supported by patron donations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Standard Pricing Option */}
            <button
              onClick={() => setPricingOption('standard')}
              className={`p-4 rounded-2xl border transition-all text-left relative ${
                pricingOption === 'standard'
                  ? 'bg-orange-50 text-orange-950 border-orange-500 ring-2 ring-orange-400/40 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs uppercase text-orange-800">
                  Standard Patron Price
                </span>
                {pricingOption === 'standard' && <Check className="w-4 h-4 text-orange-600" />}
              </div>
              <div className="text-lg font-black text-gray-900">
                ${item.standardPrice.toFixed(2)} <span className="text-xs font-normal text-gray-500">/ meal</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Full patron cost. Includes $0.50 micro-donation to the Community Meal Fund.
              </p>
            </button>

            {/* Subsidized / Needy Option */}
            <button
              onClick={() => setPricingOption('subsidized')}
              className={`p-4 rounded-2xl border transition-all text-left relative ${
                pricingOption === 'subsidized'
                  ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-md scale-102'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-extrabold text-xs uppercase ${pricingOption === 'subsidized' ? 'text-amber-100' : 'text-orange-700'}`}>
                  💛 Subsidized / Needy Option
                </span>
                {pricingOption === 'subsidized' && <Check className="w-4 h-4 text-white" />}
              </div>
              <div className="text-lg font-black">
                {item.subsidizedPrice === 0 ? '$0.00 Free' : `$${item.subsidizedPrice.toFixed(2)}`}
                <span className={`text-xs font-normal ${pricingOption === 'subsidized' ? 'text-amber-100' : 'text-gray-500'}`}>
                  {' '}/ meal
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${pricingOption === 'subsidized' ? 'text-amber-100' : 'text-gray-500'}`}>
                100% sponsored by Community Fund for verified beneficiaries & needy families.
              </p>
            </button>
          </div>

          {/* Total Calculation Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">Total Weekly Cost ({selectedDays.length} Days)</span>
              <div className="text-xl font-black text-gray-900">
                ${calculateTotalPrice().toFixed(2)}
              </div>
            </div>
            
            {/* Primary Action Button */}
            <button
              onClick={handleSubscribeSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all text-sm flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Subscribe to Weekly Plan</span>
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {isSubscribedSuccess && (
          <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between mb-6 animate-bounce">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
              <div>
                <h4 className="font-extrabold text-sm">Subscription Active!</h4>
                <p className="text-xs text-emerald-100">
                  Added {item.name} for {selectedDays.join(', ')} at ${calculateTotalPrice().toFixed(2)} total.
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-white text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
