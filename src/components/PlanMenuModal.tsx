'use client';

import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, ArrowRight, Plus, Minus, Eye, Sparkles, Utensils, Calendar
} from 'lucide-react';
import { MenuItem, DayOfWeek, UserProfile, CartItem } from '../types';
import { MOCK_MENU_ITEMS, DAYS_OF_WEEK } from '../data/mockData';

interface PlanMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'daily' | 'weekly' | 'monthly';
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem, day: DayOfWeek) => void;
  onRemoveFromCart: (itemId: string, day: DayOfWeek) => void;
  onSelectPlan: (planId: string) => void;
}

export const PlanMenuModal: React.FC<PlanMenuModalProps> = ({
  isOpen,
  onClose,
  planType,
  items,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectPlan
}) => {
  if (!isOpen) return null;

  // Determine current day of week (e.g. 'Sun', 'Mon', etc.)
  const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentTodayDay: DayOfWeek = dayNames[new Date().getDay()] || 'Sun';

  // Active day selection for weekly & monthly plans
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    planType === 'daily' ? currentTodayDay : 'Mon'
  );

  // Active week selection for monthly plan (Week 1, Week 2, Week 3, Week 4)
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleNextWeek = () => {
    setActiveWeek((prev) => (prev % 4) + 1);
  };

  const handlePrevWeek = () => {
    setActiveWeek((prev) => (prev === 1 ? 4 : prev - 1));
  };

  // Filter items based on plan type & active day & active week
  const filteredItems = items.filter((item) => {
    const targetDay = planType === 'daily' ? currentTodayDay : selectedDay;
    // Sunday Rule: Only Lunch is served on Sundays. No Breakfast or Dinner.
    if (targetDay === 'Sun' && !item.mealTimes.includes('lunch')) {
      return false;
    }
    const matchesDay = item.days.includes(targetDay);
    if (!matchesDay) return false;

    if (planType === 'monthly') {
      if (activeWeek === 4) {
        const hasWeek4 = items.some(i => i.days.includes(targetDay) && i.weekNumber === 4);
        if (hasWeek4) {
          if (item.weekNumber !== 4) return false;
        } else {
          if (item.weekNumber && item.weekNumber > 1) return false;
        }
      } else if (activeWeek === 3) {
        const hasWeek3 = items.some(i => i.days.includes(targetDay) && i.weekNumber === 3);
        if (hasWeek3) {
          if (item.weekNumber !== 3) return false;
        } else {
          if (item.weekNumber && item.weekNumber > 1) return false;
        }
      } else if (activeWeek === 2) {
        const hasWeek2 = items.some(i => i.days.includes(targetDay) && i.weekNumber === 2);
        if (hasWeek2) {
          if (item.weekNumber !== 2) return false;
        } else {
          if (item.weekNumber && item.weekNumber > 1) return false;
        }
      } else {
        if (item.weekNumber && item.weekNumber > 1) return false;
      }
    } else {
      if (item.weekNumber && item.weekNumber > 1) return false;
    }
    
    if (activeCategory !== 'all') {
      return item.mealTimes.includes(activeCategory as any);
    }
    return true;
  });

  const getItemQtyInCart = (itemId: string): number => {
    const targetDay = planType === 'daily' ? currentTodayDay : selectedDay;
    const found = cart.find(
      c => c.item.id === itemId && c.selectedDays.includes(targetDay)
    );
    return found ? found.quantity : 0;
  };

  const getPlanTitle = () => {
    if (planType === 'daily') return `Daily Plan Menu (Today: ${currentTodayDay})`;
    if (planType === 'weekly') return 'Weekly Plan Menu (7 Days Selection)';
    return `Monthly Plan Menu (30 Days • Week ${activeWeek} of 4)`;
  };

  const FULL_DAY_NAMES: Record<DayOfWeek, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      <div className="bg-white border border-zinc-200 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-zinc-950 text-white flex items-center justify-between gap-4 border-b border-zinc-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-zinc-800 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-zinc-700">
                {planType.toUpperCase()} SUBSCRIPTION MENU
              </span>
              {planType === 'daily' && (
                <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                  Current Day Only ({FULL_DAY_NAMES[currentTodayDay]})
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
              {getPlanTitle()}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS BAR BASED ON PLAN TYPE */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          
          {/* DAILY PLAN: SHOW CURRENT DAY BADGE ONLY */}
          {planType === 'daily' && (
            <div className="flex items-center gap-2 bg-zinc-100 px-3.5 py-1.5 rounded-xl border border-zinc-300 text-xs font-black text-zinc-900 shadow-2xs">
              <Calendar className="w-4 h-4 text-zinc-900" />
              <span>Menu for Today ({FULL_DAY_NAMES[currentTodayDay]}) Alone</span>
            </div>
          )}

          {/* WEEKLY & MONTHLY PLANS: 7 DAYS MENU TABS */}
          {(planType === 'weekly' || planType === 'monthly') && (
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              {DAYS_OF_WEEK.map((item) => {
                const day = item.key;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-zinc-950 text-white shadow-sm'
                        : 'bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 border border-zinc-200'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* MONTHLY PLAN SPECIFIC: NEXT WEEK ARROW OPTION ON SIDE RIGHT */}
          {planType === 'monthly' && (
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-zinc-300 shadow-2xs">
                <button
                  onClick={handlePrevWeek}
                  className="w-7 h-7 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-2 text-xs font-black text-zinc-900 min-w-[70px] text-center">
                  Week {activeWeek} / 4
                </span>

                <button
                  onClick={handleNextWeek}
                  className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  title="Next Week"
                >
                  <span>Next Week</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MEALS GRID BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white">
          {filteredItems.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-800 mx-auto flex items-center justify-center text-2xl font-black">
                🍗
              </div>
              <h3 className="text-base font-black text-zinc-950">
                Only Special Lunch Feast Provided on Sundays
              </h3>
              <p className="text-xs text-zinc-600 font-medium max-w-sm mx-auto">
                No Breakfast or Dinner service on Sundays. Select <strong>Lunch</strong> or switch to another day to view meal items.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {filteredItems.map((item) => {
              const targetDay = planType === 'daily' ? currentTodayDay : selectedDay;
              const qtyInCart = getItemQtyInCart(item.id);
              const dishComponents = item.name.split('+').map(d => d.trim());

              return (
                <div
                  key={item.id}
                  className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-zinc-400 transition-all flex flex-col sm:flex-row gap-4 items-stretch group"
                >
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto min-h-[140px] rounded-xl overflow-hidden bg-white border border-zinc-200 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                          Fresh Daily Meal
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200">
                            🔥 {item.nutritionalInfo.calories} kcal
                          </span>
                          <span className="bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200">
                            💪 {item.nutritionalInfo.protein} Protein
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-zinc-950 leading-snug">
                        {item.name}
                      </h3>

                      <div className="mt-2 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 space-y-1">
                        <span className="text-[9px] font-black uppercase text-zinc-800 tracking-wider block">
                          🍱 Included Dishes ({dishComponents.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-bold text-zinc-800">
                          {dishComponents.map((dish, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-zinc-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" />
                              <span className="truncate">{dish}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                      <span className="text-xs font-semibold text-zinc-400">
                        {targetDay} Meal Option
                      </span>

                      <div className="w-40">
                        {qtyInCart === 0 ? (
                          <button
                            onClick={() => onAddToCart(item, targetDay)}
                            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add for {targetDay}</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between bg-zinc-950 text-white rounded-xl py-1 px-3 text-xs font-black">
                            <button
                              onClick={() => onRemoveFromCart(item.id, targetDay)}
                              className="w-6 h-6 hover:bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span>{qtyInCart} in plan</span>
                            <button
                              onClick={() => onAddToCart(item, targetDay)}
                              className="w-6 h-6 hover:bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
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

        {/* MODAL FOOTER WITH PLAN SELECTION TRIGGER */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-zinc-500 font-medium">
            Showing <strong className="text-zinc-900">{filteredItems.length} meals</strong> for {planType === 'daily' ? `Today (${FULL_DAY_NAMES[currentTodayDay]})` : `${FULL_DAY_NAMES[selectedDay]} ${planType === 'monthly' ? `• Week ${activeWeek}` : ''}`}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Close
            </button>
            
            <button
              onClick={() => {
                onSelectPlan(planType);
                onClose();
              }}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-5 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Activate {planType.toUpperCase()} Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
