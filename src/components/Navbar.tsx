'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, User, ShoppingBag, Utensils, LogOut, ChevronDown, CreditCard, ShieldCheck, Package } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard' | 'admin') => void;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateToSection = (tab: 'dashboard', sectionId?: string) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
    if (sectionId) {
      if (typeof window !== 'undefined') {
        if (sectionId === 'stuvvy-card-section') {
          window.location.hash = '#stuvvy-cards';
        } else {
          window.location.hash = '#' + sectionId;
        }
      }
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    } else {
      if (typeof window !== 'undefined') {
        window.location.hash = '#dashboard';
      }
    }
  };

  const isAdminActive = activeTab === 'admin';
  const displayName = isAdminActive
    ? 'Admin'
    : (isGuestUser || !user?.isVerified)
    ? 'Guest'
    : (user?.fullName || 'Guest');

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

        {/* Center Navigation Tabs (Hidden in Admin Mode to avoid confusion with Subscriptions) */}
        {!isAdminActive && (
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
        )}

        {/* In Admin Mode: Dedicated Admin Portal Badge */}
        {isAdminActive && (
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-purple-900" />
            <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
              Kitchen Admin Dispatch Portal
            </span>
          </div>
        )}

        {/* Right Section: User Badge with Dropdown, Cart Drawer Trigger, Checkout Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* User Profile Badge with 3-option Dropdown (My Account, Stuvvy Card, Logout) */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200/90 px-3 py-1.5 rounded-full text-[11px] font-black text-zinc-800 border border-zinc-200 cursor-pointer transition-all shadow-2xs"
              title="Click to view Account, Stuvvy Card, or Log Out"
            >
              <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
              <span className="max-w-[100px] truncate hidden sm:inline">
                {displayName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 3-Option Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-zinc-100">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Signed in as</div>
                  <div className="text-xs font-black text-zinc-900 truncate mt-0.5">{displayName}</div>
                </div>

                <div className="p-1 space-y-0.5">
                  {/* In Admin Mode: Dedicated Admin Dropdown Actions */}
                  {isAdminActive ? (
                    <>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-900" />
                        <span>Admin Dispatch Board</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (typeof window !== 'undefined') {
                            sessionStorage.removeItem('stuvvy_admin_auth');
                          }
                          setActiveTab('landing');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100 mt-1 pt-1.5"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Exit Admin Portal</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Option 1: My Account */}
                      <button
                        onClick={() => handleNavigateToSection('dashboard')}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-purple-600" />
                        <span>My Account</span>
                      </button>

                      {/* Option 2: Stuvvy Card */}
                      <button
                        onClick={() => handleNavigateToSection('dashboard', 'stuvvy-card-section')}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span>Stuvvy Card</span>
                      </button>

                      {/* Option 3: My Delivery Logs */}
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.location.hash = '#delivery-logs';
                          }
                          setActiveTab('dashboard');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-blue-600" />
                        <span>My Delivery Logs</span>
                      </button>

                      {/* Option 4: Logout */}
                      {onLogout && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100 mt-1 pt-1.5"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Log Out</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
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
