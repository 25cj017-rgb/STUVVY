'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, Plus, Minus, Star, Sparkles, Sun, Moon, Coffee, Heart, UtensilsCrossed, Lock, Phone, UserCheck, ArrowRight, ShoppingBag
} from 'lucide-react';
import { MenuItem, DayOfWeek, MealTime, UserProfile, CartItem } from '../types';
import { MOCK_MENU_ITEMS } from '../data/mockData';

interface CenteredFrameMenuProps {
  items: MenuItem[];
  user: UserProfile;
  cart: CartItem[];
  onAddToCart: (item: MenuItem, day: DayOfWeek) => void;
  onRemoveFromCart: (itemId: string, day: DayOfWeek) => void;
  onSelectItemDetails: (item: MenuItem) => void;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  selectedMealTime: MealTime;
  onSelectMealTime: (mealTime: MealTime) => void;
  onOpenSubscriptions?: () => void;
  showWeekBar?: boolean;
  isGuestUser?: boolean;
  onOpenLoginModal?: () => void;
  onOpenAdminContact?: () => void;
  onOpenCart?: () => void;
  onProceedToCheckout?: () => void;
}

const DAY_LABELS: Record<DayOfWeek, { label: string; full: string }> = {
  Mon: { label: 'Monday 🌿', full: 'Monday' },
  Tue: { label: 'Tuesday 🌿', full: 'Tuesday' },
  Wed: { label: 'Wednesday 🌿', full: 'Wednesday' },
  Thu: { label: 'Thursday 🌿', full: 'Thursday' },
  Fri: { label: 'Friday 🌿', full: 'Friday' },
  Sat: { label: 'Saturday 🌿', full: 'Saturday' },
  Sun: { label: 'Sunday 🍗', full: 'Sunday (Non-Veg Feast)' },
};

export const CenteredFrameMenu: React.FC<CenteredFrameMenuProps> = ({
  items,
  user,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectItemDetails,
  selectedDay,
  onSelectDay,
  selectedMealTime,
  onSelectMealTime,
  onOpenSubscriptions,
  showWeekBar = true,
  isGuestUser = false,
  onOpenLoginModal,
  onOpenAdminContact,
  onOpenCart,
  onProceedToCheckout,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('breakfast');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const totalCartItems = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalCartPrice = cart.reduce((acc, c) => acc + (c.pricingOption === 'subsidized' ? c.item.subsidizedPrice : c.item.standardPrice) * c.quantity, 0);

  const categories = [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '🍛' },
    { id: 'dinner', name: 'Dinner', icon: '🌙' },
  ];

  // Map category to meal items & filter by active day and week
  const getCategoryItems = (catId: string) => {
    // SUNDAY RULE: Only Lunch is served on Sundays. No Breakfast or Dinner.
    if (selectedDay === 'Sun' && catId !== 'lunch') {
      return [];
    }

    let catFiltered = items;
    if (catId === 'breakfast') {
      catFiltered = items.filter(i => i.mealTimes.includes('breakfast'));
    } else if (catId === 'lunch') {
      catFiltered = items.filter(i => i.mealTimes.includes('lunch'));
    } else if (catId === 'dinner') {
      catFiltered = items.filter(i => i.mealTimes.includes('dinner'));
    }
    
    // Filter items specifically for the selected date/day and week
    const dayFiltered = catFiltered.filter(i => {
      const matchesDay = i.days.includes(selectedDay);
      if (!matchesDay) return false;

      if (selectedWeek === 4) {
        const hasWeek4Items = catFiltered.some(item => item.days.includes(selectedDay) && item.weekNumber === 4);
        if (hasWeek4Items) {
          return i.weekNumber === 4;
        }
        return i.weekNumber === 1 || !i.weekNumber;
      }

      if (selectedWeek === 3) {
        const hasWeek3Items = catFiltered.some(item => item.days.includes(selectedDay) && item.weekNumber === 3);
        if (hasWeek3Items) {
          return i.weekNumber === 3;
        }
        return i.weekNumber === 1 || !i.weekNumber;
      }

      if (selectedWeek === 2) {
        const hasWeek2Items = catFiltered.some(item => item.days.includes(selectedDay) && item.weekNumber === 2);
        if (hasWeek2Items) {
          return i.weekNumber === 2;
        }
        return i.weekNumber === 1 || !i.weekNumber;
      }

      return i.weekNumber === 1 || !i.weekNumber;
    });

    return dayFiltered;
  };

  const currentItems = getCategoryItems(activeCategory);

  const getItemQtyInCart = (itemId: string): number => {
    const found = cart.find(
      c => c.item.id === itemId && c.selectedDays.includes(selectedDay)
    );
    return found ? found.quantity : 0;
  };

  // Heading text mapping
  const getCategoryTitle = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    return found ? `${found.name} Menu` : 'Breakfast Menu';
  };

  const handleDaySelect = (day: DayOfWeek) => {
    onSelectDay(day);
    if (day === 'Sun' && activeCategory !== 'lunch') {
      setActiveCategory('lunch');
      onSelectMealTime('lunch');
    }
  };

  return (
    <div className="w-screen min-h-screen bg-zinc-50/50 text-zinc-950 relative flex flex-col font-sans overflow-x-hidden select-none">
      
      {/* SYNCHRONIZED HAND-DRAWN SKETCH BACKGROUND IMAGE ON LEFT */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-start opacity-30 sm:opacity-40 -translate-x-12 sm:-translate-x-20 scale-100">
        <img
          src="/landing_page.png"
          alt="Stuvvy Home Food Background Sketch"
          className="w-full h-full object-contain max-h-screen"
        />
      </div>

      {/* MAIN CONTENT CONTAINER EXACTLY MATCHING ORIGINAL MENU DESIGN */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-36 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT FLOATING SIDEBAR CATEGORY MENU CARD */}
        {/* ======================================================== */}
        <div className="w-full lg:w-64 bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-xl rounded-[28px] p-3 shrink-0">
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'breakfast' || cat.id === 'lunch' || cat.id === 'dinner') {
                      onSelectMealTime(cat.id as MealTime);
                    }
                  }}
                  className={`w-full px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-md'
                      : 'text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT MAIN SECTION */}
        <div className="flex-1 w-full space-y-6">
          
          {/* TEMPORAL WEEK & DAY SELECTOR BAR (NOV 9 - NOV 22) */}
          {showWeekBar && (
            <div className="space-y-2.5">
              {/* WEEK SELECTOR PILL TABS */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
                  <button
                    onClick={() => setSelectedWeek(1)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedWeek === 1
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <span>Week 1</span>
                  </button>

                  <button
                    onClick={() => setSelectedWeek(2)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedWeek === 2
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span>Week 2</span>
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedWeek(3)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedWeek === 3
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span>Week 3</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedWeek(4)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedWeek === 4
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span>Week 4</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    </span>
                  </button>
                </div>

                <div className="text-[11px] font-extrabold text-zinc-700 bg-white/95 px-3.5 py-1.5 rounded-full border border-zinc-200/90 shadow-2xs">
                  Showing: <strong className="text-zinc-950 font-black">{DAY_LABELS[selectedDay]?.full || selectedDay}</strong>
                </div>
              </div>

              {/* 7-DAY CALENDAR ROW */}
              <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl p-2 shadow-xs flex items-center justify-between gap-1.5 overflow-x-auto">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as DayOfWeek[]).map((day) => {
                  const isSelected = selectedDay === day;
                  const dayInfo = DAY_LABELS[day];

                  return (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-zinc-950 text-white shadow-md scale-[1.02]'
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 bg-white border border-zinc-200/80'
                      }`}
                    >
                      <span className="text-xs font-black">{dayInfo?.label || day}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-transparent'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* HEADER SECTION WITH TITLE & STAMP BADGE */}
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 font-heading tracking-tight">
                  {getCategoryTitle(activeCategory)}
                </h1>
                <span className="text-zinc-400 font-serif italic text-lg sm:text-xl font-bold">
                  \ | /
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                Wholesome · Freshly Prepared · Daily Schedule for <strong className="text-zinc-900 font-black">{
                  DAY_LABELS[selectedDay]?.full || selectedDay
                }</strong>
              </p>
            </div>

            {/* CIRCULAR STAMP BADGE */}
            <div className="hidden sm:flex shrink-0 w-24 h-24 rounded-full border-2 border-zinc-800/80 items-center justify-center p-2 text-center rotate-6 hover:rotate-0 transition-transform">
              <span className="text-[10px] font-serif italic font-bold text-zinc-800 leading-tight">
                Fresh Meals<br />Rotating Weekly<br />No Repeats ♡
              </span>
            </div>
          </div>

          {/* GUEST MODE LOCKED DAY SCREEN VS REGULAR MENU LIST */}
          {isGuestUser && (selectedDay === 'Thu' || selectedDay === 'Fri' || selectedDay === 'Sat' || selectedDay === 'Sun') ? (
            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-zinc-950 text-white mx-auto flex items-center justify-center text-2xl font-black shadow-md">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-zinc-100 px-3.5 py-1 rounded-full border border-zinc-200">
                  Guest View • Days 4 to 7 Locked
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-heading text-zinc-950">
                  {DAY_LABELS[selectedDay]?.full} Menu is Locked
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                  As a Guest Explorer, you have full preview access to the first 3 days of Stuvvy’s fresh home meal schedule (Monday – Wednesday). Thursday to Sunday are reserved for registered subscribers!
                </p>
              </div>

              {/* ADMIN CONTACT HOTLINE BOX */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 max-w-md mx-auto space-y-2.5">
                <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-zinc-900">
                  <Phone className="w-4 h-4 text-zinc-950" />
                  <span>Stuvvy Administrator Support & Registration</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-black text-zinc-950">
                  <a href="tel:+919344795832" className="hover:underline flex items-center gap-1.5 cursor-pointer">
                    📞 Hotline: +91 9344795832
                  </a>
                  <span className="hidden sm:inline text-zinc-300">•</span>
                  <a href="https://wa.me/919344795832" target="_blank" rel="noopener noreferrer" className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer">
                    💬 Connect through WhatsApp
                  </a>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Contact our Administrator to register, subscribe to a plan, or unlock full 7-day menu access.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenLoginModal && (
                  <button
                    onClick={onOpenLoginModal}
                    className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Log In / Register Now</span>
                  </button>
                )}

                {onOpenAdminContact && (
                  <button
                    onClick={onOpenAdminContact}
                    className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-extrabold text-xs py-3.5 px-6 rounded-2xl border border-zinc-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact Administrator</span>
                  </button>
                )}
              </div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-[28px] p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-800 mx-auto flex items-center justify-center text-3xl font-black border border-zinc-200">
                🍗
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black font-heading text-zinc-950">
                  No {activeCategory.toUpperCase()} Service on Sundays
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-md mx-auto">
                  On Sundays, we serve our <strong>Grand Sunday Non-Veg Lunch Celebration Feast</strong> exclusively! Breakfast & Dinner services are not provided on Sundays.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveCategory('lunch');
                    onSelectMealTime('lunch');
                  }}
                  className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span>View Sunday Non-Veg Lunch Feast 🍗</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
            {currentItems.slice(0, 6).map((item) => {
              const qtyInCart = getItemQtyInCart(item.id);
              const dishComponents = item.name.split('+').map(d => d.trim());

              return (
                <div
                  key={item.id}
                  className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[28px] p-5 sm:p-6 shadow-md hover:shadow-xl hover:border-zinc-300 transition-all flex flex-col md:flex-row gap-6 items-stretch group"
                >
                  {/* LEFT: LARGE HORIZONTAL FOOD IMAGE CONTAINER */}
                  <div 
                    onClick={() => onSelectItemDetails(item)}
                    className="relative w-full md:w-80 h-56 md:h-auto min-h-[220px] rounded-2xl overflow-hidden bg-white border border-zinc-200 shrink-0 cursor-pointer shadow-xs group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* RIGHT: DETAILS & DISH BREAKDOWN */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* TAG & NUTRITION BADGES */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                          Fresh Daily Preparation
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-extrabold">
                          <span className="bg-zinc-100 text-zinc-900 border border-zinc-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                            🔥 {item.nutritionalInfo.calories} kcal
                          </span>
                          <span className="bg-zinc-100 text-zinc-900 border border-zinc-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                            💪 {item.nutritionalInfo.protein} Protein
                          </span>
                        </div>
                      </div>

                      {/* MAIN DISH TITLE */}
                      <h3 
                        onClick={() => onSelectItemDetails(item)}
                        className="font-black text-xl sm:text-2xl font-heading text-zinc-950 tracking-tight group-hover:text-zinc-700 transition-colors cursor-pointer leading-snug"
                      >
                        {item.name}
                      </h3>

                      {/* INCLUDED DISHES GRID */}
                      <div className="mt-3.5 bg-zinc-50/90 border border-zinc-200/80 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-zinc-600" />
                            Included Dishes ({dishComponents.length}):
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-400">Fresh & Healthy</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-zinc-800 pt-1">
                          {dishComponents.map((dish, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-zinc-200/70 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-zinc-800 shrink-0" />
                              <span className="truncate">{dish}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM CONTROLLER BAR */}
                    <div className="pt-3 flex items-center justify-between border-t border-zinc-100">
                      <div className="text-xs text-zinc-500 font-medium hidden sm:block">
                        Prepared fresh for <strong className="text-zinc-900">{DAY_LABELS[selectedDay]?.full || selectedDay}</strong>
                      </div>

                      <div className="w-full sm:w-48 ml-auto">
                        {qtyInCart === 0 ? (
                          <button
                            onClick={() => onAddToCart(item, selectedDay)}
                            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Add Meal</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-zinc-950 text-white rounded-2xl shadow-md py-2 px-3 text-xs font-extrabold">
                            <button
                              onClick={() => onRemoveFromCart(item.id, selectedDay)}
                              className="w-7 h-7 rounded-xl hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus className="w-4 h-4 stroke-[3]" />
                            </button>
                            <span className="px-2 font-black text-sm">{qtyInCart}</span>
                            <button
                              onClick={() => onAddToCart(item, selectedDay)}
                              className="w-7 h-7 rounded-xl hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
          )}

        </div>

      </div>

      {/* FLOATING BOTTOM CHECKOUT ACTION BAR WHEN MEALS ARE ADDED */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto animate-slide-up">
          <div className="bg-zinc-950/98 backdrop-blur-xl text-white rounded-2xl p-3 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {totalCartItems}
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-300">
                  {totalCartItems} {totalCartItems === 1 ? 'Meal' : 'Meals'} in Tray
                </div>
                <div className="text-sm font-black text-orange-400 font-heading">
                  ₹{totalCartPrice}
                </div>
              </div>
            </div>

            <button
              id="floating-proceed-checkout-btn"
              onClick={() => {
                if (onProceedToCheckout) {
                  onProceedToCheckout();
                } else if (onOpenCart) {
                  onOpenCart();
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
