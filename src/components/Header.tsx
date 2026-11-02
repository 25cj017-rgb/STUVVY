'use client';

import React from 'react';
import { Heart, Truck, Zap, ShoppingBag, Database, MapPin, User, ChevronDown } from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface HeaderProps {
  user: UserProfile;
  cart: CartItem[];
  currentScreen: number;
  onNavigate: (screen: number) => void;
  isLowBandwidth: boolean;
  onToggleLowBandwidth: () => void;
  onOpenSchemaModal: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  cart,
  currentScreen,
  onNavigate,
  isLowBandwidth,
  onToggleLowBandwidth,
  onOpenSchemaModal,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-[#FC8019] text-white sticky top-0 z-50 shadow-md">
      {/* Top Navbar Container */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* Brand Logo & Location */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <div 
            onClick={() => onNavigate(2)}
            className="flex items-center gap-1.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center relative shrink-0">
              <img 
                src="/STUVVY-LOGO.jpeg" 
                alt="Stuvvy Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white font-heading">
              Stuvvy
            </span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-orange-100 font-semibold cursor-pointer hover:text-white bg-black/15 px-2.5 py-1 rounded-full border border-white/20 shrink-0 max-w-[150px] sm:max-w-none truncate">
            <MapPin className="w-3 h-3 text-white shrink-0" />
            <span className="font-bold text-white truncate">Indiranagar</span>
            <span className="text-orange-200 hidden sm:inline">Bengaluru</span>
            <ChevronDown className="w-3 h-3 text-white shrink-0" />
          </div>
        </div>

        {/* Right Navigation Links (Compact & Non-overflowing) */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-bold shrink-0">
          
          {/* Low Bandwidth Mode Pill */}
          <button
            onClick={onToggleLowBandwidth}
            title="Toggle 3G / Low Bandwidth Mode"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all text-[11px] sm:text-xs font-extrabold shrink-0 ${
              isLowBandwidth
                ? 'bg-amber-300 text-gray-950 shadow-xs'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            <Zap className={`w-3 h-3 ${isLowBandwidth ? 'text-gray-950 fill-gray-950' : 'text-amber-200'}`} />
            <span>{isLowBandwidth ? '3G ON' : '3G Data'}</span>
          </button>

          {/* Database Specs Button */}
          <button
            onClick={onOpenSchemaModal}
            className="hidden sm:flex items-center gap-1 text-white/90 hover:text-white transition-colors text-xs shrink-0"
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB</span>
          </button>

          {/* Account Button */}
          <button
            onClick={() => onNavigate(1)}
            className="hidden sm:flex items-center gap-1.5 bg-black/20 hover:bg-black/30 pl-1 pr-2.5 py-1 rounded-full text-white transition-all border border-white/20 text-xs shrink-0 cursor-pointer"
          >
            <img src="/user-avatar.jpg" alt="User Avatar" className="w-5 h-5 rounded-full object-cover" />
            <span>{user.fullName.split(' ')[0]}</span>
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={() => onNavigate(3)}
            className="relative bg-white text-[#FC8019] px-3 py-1 rounded-full font-extrabold shadow-xs hover:bg-orange-50 transition-colors flex items-center gap-1 text-xs shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
