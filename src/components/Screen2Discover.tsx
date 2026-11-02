'use client';

import React, { useState } from 'react';
import { 
  Search, MapPin, ChevronDown, ChevronRight, ChevronLeft, Star, Clock, 
  Plus, Minus, Zap, Flame, Dumbbell, Heart, Check, ArrowRight, Sparkles 
} from 'lucide-react';
import { MenuItem, CategoryId, DayOfWeek, UserProfile, CartItem } from '../types';
import { DAYS_OF_WEEK, CATEGORIES } from '../data/mockData';

interface Screen2DiscoverProps {
  items: MenuItem[];
  user: UserProfile;
  cart: CartItem[];
  onAddToCart: (item: MenuItem, day: DayOfWeek) => void;
  onRemoveFromCart: (itemId: string, day: DayOfWeek) => void;
  onSelectItemDetails: (item: MenuItem) => void;
  isLowBandwidth: boolean;
  onToggleLowBandwidth: () => void;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
}

export const Screen2Discover: React.FC<Screen2DiscoverProps> = ({
  items,
  user,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectItemDetails,
  isLowBandwidth,
  onToggleLowBandwidth,
  selectedDay,
  onSelectDay,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyVeg, setShowOnlyVeg] = useState(false);

  // Circular food items for the Swiggy-style top category row
  const circularCategories = [
    { id: 'south', name: 'South Indian', icon: '🍚', bg: 'bg-amber-100' },
    { id: 'north', name: 'North Indian', icon: '🥘', bg: 'bg-orange-100' },
    { id: 'healthy', name: 'Healthy & Gym', icon: '🥗', bg: 'bg-emerald-100' },
    { id: 'thali', name: 'Home Thalis', icon: '🍛', bg: 'bg-yellow-100' },
    { id: 'biryani', name: 'Dum Biryani', icon: '🍲', bg: 'bg-red-100' },
    { id: 'dosa', name: 'Crisp Dosa', icon: '🥞', bg: 'bg-orange-100' },
    { id: 'idli', name: 'Idli Vada', icon: '🥟', bg: 'bg-[#FFF7ED]' },
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.categoryId !== selectedCategory) return false;
    if (!item.days.includes(selectedDay)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }

    if (showOnlyVeg && !item.isVeg) return false;

    return true;
  });

  const getItemQtyInCart = (itemId: string): number => {
    const found = cart.find(
      c => c.item.id === itemId && c.selectedDays.includes(selectedDay)
    );
    return found ? found.quantity : 0;
  };

  return (
    <div className="bg-white min-h-screen pb-24 text-gray-900 font-sans">
      
      {/* 1. HERO SECTION (Swiggy Banner with Generous Spacing) */}
      <div className="bg-[#FC8019] text-white pt-6 sm:pt-8 pb-10 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Hero Heading (Spacious & Distinct from Header) */}
          <div className="text-center sm:text-left pt-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight">
              Nutritious Home Food & Subsidized Meals
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 font-medium mt-1.5">
              Fresh daily tiffins delivered to standard patrons, students & subsidized families.
            </p>
          </div>

          {/* Clean Wide Search Bar Container (No Duplicate Location Dropdown) */}
          <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2 border border-orange-200">
            
            {/* Search Input Field */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dish, South Indian, North Indian, Healthy..."
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm text-gray-900 font-medium bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Pure Veg Filter Toggle Button */}
            <button
              onClick={() => setShowOnlyVeg(!showOnlyVeg)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                showOnlyVeg
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Pure Veg</span>
            </button>
          </div>

          {/* Two Large Swiggy-Style Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            
            {/* Card 1: Food Delivery */}
            <div className="bg-white text-gray-900 rounded-3xl p-4 shadow-md flex items-center justify-between border border-orange-100 group hover:shadow-lg transition-all">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FC8019] bg-orange-50 px-2 py-0.5 rounded-md">
                  Standard Patron Meals
                </span>
                <h3 className="text-lg font-black font-heading mt-1 text-gray-900 truncate">
                  FOOD DELIVERY
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium truncate">
                  Fresh South & North Indian Thalis
                </p>
                <button 
                  onClick={() => onSelectCategory('south')}
                  className="mt-2.5 bg-[#FC8019] hover:bg-orange-600 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs group-hover:gap-1.5 transition-all"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="text-4xl p-2.5 bg-orange-50 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                🍛
              </div>
            </div>

            {/* Card 2: Subsidized & Healthy */}
            <div className="bg-white text-gray-900 rounded-3xl p-4 shadow-md flex items-center justify-between border border-orange-100 group hover:shadow-lg transition-all">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Community Funded
                </span>
                <h3 className="text-lg font-black font-heading mt-1 text-gray-900 truncate">
                  SUBSIDIZED & HEALTHY
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium truncate">
                  Nutritious Gym & Diet meals from $0.00
                </p>
                <button 
                  onClick={() => onSelectCategory('healthy')}
                  className="mt-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs group-hover:gap-1.5 transition-all"
                >
                  <span>View Subsidized</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="text-4xl p-2.5 bg-emerald-50 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                🥗
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* 2. CIRCULAR FOOD CATEGORY ROW ("Order our best food options") */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading text-gray-900 tracking-tight">
                Order our best food options
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Authentic regional cuisines & healthy diet plans
              </p>
            </div>

            {/* Arrow Controls */}
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Circular Items List */}
          <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar py-1">
            {circularCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'south' || cat.id === 'north' || cat.id === 'healthy') {
                      onSelectCategory(cat.id as CategoryId);
                    }
                  }}
                  className="flex flex-col items-center shrink-0 group focus:outline-none"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${cat.bg} border-2 transition-all flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 ${
                    isSelected ? 'border-[#FC8019] ring-3 ring-orange-200' : 'border-transparent'
                  }`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[11px] font-bold mt-1.5 font-heading tracking-tight ${
                    isSelected ? 'text-[#FC8019] font-black' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* 3. HORIZONTAL DAY-OF-THE-WEEK FILTER BAR */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading text-gray-900 tracking-tight">
                Select Delivery Day
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Temporal Menu: Locked to chosen day (Mon - Sun)
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#FC8019] bg-orange-50 px-2.5 py-0.5 rounded-full">
              {selectedDay} Menu
            </span>
          </div>

          {/* Day Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedDay === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => onSelectDay(d.key)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-[#FC8019] text-white border-[#FC8019] shadow-xs ring-2 ring-orange-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  <span>{d.full}</span>
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* 4. POPULAR MEALS & DAILY PLANS GRID */}
        <section className="pb-12">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading text-gray-900 tracking-tight">
                Popular Meals & Subsidized Plans
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {filteredItems.length} items available on {selectedDay}
              </p>
            </div>
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200 my-4">
              <p className="text-xs font-bold text-gray-700">No items available for this filter</p>
              <p className="text-[11px] text-gray-500 mt-1">Try selecting another day or category above.</p>
            </div>
          )}

          {/* Clean Responsive Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const qtyInCart = getItemQtyInCart(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-200 hover:border-orange-300 shadow-xs hover:shadow-lg transition-all p-4 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Food Image Banner Header */}
                  <div 
                    onClick={() => onSelectItemDetails(item)}
                    className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden bg-orange-100 mb-3 cursor-pointer group-hover:opacity-95 transition-opacity shrink-0"
                  >
                    {!isLowBandwidth ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-3xl mb-1">
                          {item.categoryId === 'south' ? '🍚' : item.categoryId === 'north' ? '🥘' : '🥗'}
                        </span>
                        <span className="text-[10px] font-bold uppercase">{item.name}</span>
                      </div>
                    )}

                    {/* Veg Green Dot Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block" />
                    </span>

                    {/* Rating Pill Badge */}
                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-gray-900 px-2 py-0.5 rounded-md shadow-xs text-[11px] font-extrabold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-gray-400 text-[9px]">({item.reviewCount})</span>
                    </div>

                    {/* Prep Time Badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-200" />
                      <span>{item.prepTime}</span>
                    </div>
                  </div>

                  {/* Card Title & Description */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      onClick={() => onSelectItemDetails(item)}
                      className="font-black font-heading text-base text-gray-900 group-hover:text-[#FC8019] transition-colors cursor-pointer line-clamp-1"
                    >
                      {item.name}
                    </h3>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                      {item.description}
                    </p>

                    <p className="text-[11px] text-gray-400 font-semibold mt-1">
                      Portion: {item.portionSize}
                    </p>
                  </div>

                  {/* NUTRITIONAL MACRO STRIP */}
                  <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-2 my-2 flex items-center justify-between text-[11px] shrink-0 overflow-hidden">
                    <div className="flex items-center gap-2 font-extrabold">
                      <span className="text-orange-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                        <span>{item.nutritionalInfo.calories} kcal</span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-emerald-800 flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.nutritionalInfo.protein} Protein</span>
                      </span>
                    </div>
                    {item.nutritionalInfo.isGlutenFree && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-md">
                        Gluten Free
                      </span>
                    )}
                  </div>

                  {/* CARD FOOTER PRICING & ADD BUTTON */}
                  <div className="flex items-end justify-between pt-2 border-t border-gray-100 shrink-0 gap-2">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400 line-through">
                          ${item.standardPrice.toFixed(2)}
                        </span>
                        <span className="font-black text-base text-gray-900 font-heading">
                          {user.beneficiaryStatus === 'Standard'
                            ? `$${item.standardPrice.toFixed(2)}`
                            : item.subsidizedPrice === 0
                            ? '$0.00 Free'
                            : `$${item.subsidizedPrice.toFixed(2)}`}
                        </span>
                      </div>
                      {item.isSubsidizedEligible && (
                        <span className="text-[9px] text-[#FC8019] bg-orange-100 font-extrabold px-1.5 py-0.5 rounded-md inline-block mt-0.5 truncate max-w-full">
                          💛 Subsidized Option Available
                        </span>
                      )}
                    </div>

                    {/* ADD BUTTON */}
                    <div className="shrink-0">
                      {qtyInCart === 0 ? (
                        <button
                          onClick={() => onAddToCart(item, selectedDay)}
                          className="bg-white border-2 border-[#FC8019] text-[#FC8019] hover:bg-[#FC8019] hover:text-white font-extrabold px-4 py-1.5 rounded-xl shadow-xs transition-all text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-[#FC8019] text-white rounded-xl shadow-xs overflow-hidden text-xs font-extrabold">
                          <button
                            onClick={() => onRemoveFromCart(item.id, selectedDay)}
                            className="px-2.5 py-1.5 hover:bg-orange-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5">{qtyInCart}</span>
                          <button
                            onClick={() => onAddToCart(item, selectedDay)}
                            className="px-2.5 py-1.5 hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
