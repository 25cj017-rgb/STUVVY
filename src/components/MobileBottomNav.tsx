'use client';

import React from 'react';
import { Utensils, Sparkles, User, ShoppingBag, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard' | 'admin') => void;
  cartCount: number;
  onOpenCart?: () => void;
  isAdminMode?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  isAdminMode = false
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-zinc-200/90 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-2 py-1.5 select-none">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1">
        
        {/* TAB 1: MENU / MEALS */}
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'discover'
              ? 'text-purple-900 font-black'
              : 'text-zinc-500 hover:text-zinc-900 font-bold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'discover' ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'text-zinc-500'
          }`}>
            <Utensils className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-heading">
            Menu
          </span>
        </button>

        {/* TAB 2: SUBSCRIPTION PLANS */}
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'text-purple-900 font-black'
              : 'text-zinc-500 hover:text-zinc-900 font-bold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'plans' ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'text-zinc-500'
          }`}>
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-heading">
            Plans
          </span>
        </button>

        {/* TAB 3: MY ACCOUNT / STUVVY CARDS */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-purple-900 font-black'
              : 'text-zinc-500 hover:text-zinc-900 font-bold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'text-zinc-500'
          }`}>
            <User className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-heading">
            Account
          </span>
        </button>

        {/* TAB 4: MEAL TRAY (CART) OR ADMIN */}
        {isAdminMode ? (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-purple-900 font-black'
                : 'text-zinc-500 hover:text-zinc-900 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'admin' ? 'bg-purple-900 text-white shadow-2xs' : 'text-zinc-500'
            }`}>
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-heading">
              Admin
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onOpenCart) onOpenCart();
              else setActiveTab('checkout');
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'text-purple-900 font-black'
                : 'text-zinc-500 hover:text-zinc-900 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${
              activeTab === 'checkout' ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'text-zinc-500'
            }`}>
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-heading">
              Tray
            </span>
          </button>
        )}

      </div>
    </nav>
  );
};
