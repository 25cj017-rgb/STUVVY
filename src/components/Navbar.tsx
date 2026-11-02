'use client';

import React from 'react';
import { ArrowRight, Sparkles, User, ShoppingBag, Utensils, LogOut, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard';
  setActiveTab: (tab: 'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard') => void;
  selectedPlan: { name: string; price: number; period: string } | null;
  cartCount?: number;
  user?: UserProfile;
  isGuestUser?: boolean;
  onOpenCart?: () => void;
  onCheckout?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  selectedPlan, 
  cartCount = 0,
  user,
  isGuestUser = false,
  onOpenCart,
  onCheckout,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo with authentic Stuvvy horizontal logo asset */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          title="Return to Welcome / Landing Page"
        >
          <img
            src="/stuvvy-logo-horizontal.png"
            alt="STUVVY - Sit & Relax. Let Stuvvy Serve You."
            className="h-10 sm:h-11 w-auto max-w-[200px] object-contain group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Center Navigation Tabs matching menu.png */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-black">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'discover' 
                ? 'bg-white text-orange-600 border border-orange-500 shadow-xs' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <button 
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'plans' 
                ? 'bg-zinc-950 text-white shadow-xs' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Subscriptions</span>
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-zinc-950 text-white shadow-xs' 
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Account</span>
          </button>
        </nav>

        {/* Right Section: User Badge, Cart Drawer Trigger, Checkout Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* User Badge */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="hidden md:flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1 rounded-full text-[11px] font-black text-zinc-800 border border-zinc-200 cursor-pointer transition-all"
          >
            <span className="w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px]">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'G'}
            </span>
            <span className="max-w-[90px] truncate">
              {user?.fullName || 'Guest'}
            </span>
          </div>

          {/* Cart Tray Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer border border-zinc-200/80 bg-white shadow-2xs"
              title="View Meal Tray"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Action Button: Checkout → */}
          <button
            id="navbar-checkout-btn"
            onClick={() => {
              if (onCheckout) {
                onCheckout();
              } else if (cartCount > 0 && onOpenCart) {
                onOpenCart();
              } else {
                setActiveTab('checkout');
              }
            }}
            className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-black px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 cursor-pointer active:scale-95"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </header>
  );
};
