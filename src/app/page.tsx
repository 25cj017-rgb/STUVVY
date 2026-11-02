'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { PricingSection, SUBSCRIPTION_PLANS, PlanOption } from '../components/PricingSection';
import { CheckoutFlow } from '../components/CheckoutFlow';
import { AccountDashboard } from '../components/AccountDashboard';
import { CenteredFrameMenu } from '../components/CenteredFrameMenu';
import { PlanMenuModal } from '../components/PlanMenuModal';
import { AdminContactModal } from '../components/AdminContactModal';
import { CartDrawer } from '../components/CartDrawer';
import { MOCK_MENU_ITEMS, INITIAL_USER } from '../data/mockData';
import { MenuItem, DayOfWeek, MealTime, UserProfile, CartItem } from '../types';
import { CheckCircle2, X, Eye, Phone, Lock, Sparkles, Utensils, LogIn, ChevronRight } from 'lucide-react';

import { validateCustomerLogin, setDynamicCustomers } from '../data/customerAuth';
import { CalendarDay } from '../components/SubscriptionCalendar';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'landing' | 'discover' | 'plans' | 'checkout' | 'dashboard'>('landing');
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isAdminContactOpen, setIsAdminContactOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'subscription' | 'cart'>('subscription');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(SUBSCRIPTION_PLANS[1]); // Weekly by default
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(689);
  const [savedCalendar, setSavedCalendar] = useState<CalendarDay[] | undefined>(undefined);

  // Login Card Form State (Starts completely blank until customer enters credentials)
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState('');

  // Plan Menu Modal state
  const [planMenuModal, setPlanMenuModal] = useState<{
    isOpen: boolean;
    planType: 'daily' | 'weekly' | 'monthly';
  }>({
    isOpen: false,
    planType: 'daily'
  });

  // Discover screen state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon');
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>('breakfast');

  // Session persistence & load customers from customers.csv
  useEffect(() => {
    try {
      const savedTab = sessionStorage.getItem('stuvvy_tab') as any;
      if (savedTab && ['landing', 'discover', 'plans', 'checkout', 'dashboard'].includes(savedTab)) {
        setActiveTab(savedTab);
      } else {
        setActiveTab('landing');
      }
      const savedUser = localStorage.getItem('stuvvy_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {}

    // Load customer database directly from customers.csv via API for validation
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.customers) && data.customers.length > 0) {
          setDynamicCustomers(data.customers);
        }
      })
      .catch(err => console.log('Notice: Could not load customers from customers.csv API:', err));
  }, []);

  // Save current active tab whenever it changes
  useEffect(() => {
    try {
      if (activeTab === 'landing') {
        sessionStorage.removeItem('stuvvy_tab');
      } else {
        sessionStorage.setItem('stuvvy_tab', activeTab);
      }
    } catch {}
  }, [activeTab]);

  // Touch/Click anywhere on landing page to reveal login card
  const handleLandingScreenClick = () => {
    if (!showLoginCard) {
      setShowLoginCard(true);
    }
  };

  const handleVerifyAndStart = () => {
    const authResult = validateCustomerLogin(fullName, mobileNumber, dob);
    
    if (!authResult.isValid) {
      setAuthStatusMessage(authResult.message || 'Invalid login details.');
      return;
    }

    setAuthStatusMessage('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setIsGuestUser(false); // Full subscriber mode
      
      setTimeout(() => {
        setUser({
          ...user,
          fullName: authResult.customer?.name || fullName.toUpperCase(),
          mobileNumber: authResult.customer?.mobileNo || mobileNumber,
          dob: dob,
          address: authResult.customer?.address || '',
          isVerified: true
        });
        setActiveTab('discover');
      }, 500);
    }, 800);
  };

  const handleContinueAsGuest = () => {
    setIsGuestUser(true);
    setUser({
      ...user,
      fullName: 'Guest Explorer',
      isVerified: false
    });
    setActiveTab('discover');
  };



  const handleSelectPlan = (plan: PlanOption, customDays?: number, price?: number) => {
    const days = customDays || plan.defaultDays || 7;
    const calcPrice = price || Math.round(days * (plan.ratePerDay || 98.43));
    setSelectedPlan(plan);
    setSelectedDays(days);
    setCalculatedPrice(calcPrice);
    setCheckoutMode('subscription');
    setActiveTab('checkout');
  };

  const handleAddToCart = (item: MenuItem, day: DayOfWeek) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        c => c.item.id === item.id && c.selectedDays.includes(day)
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            item,
            quantity: 1,
            selectedDays: [day],
            pricingOption: user.beneficiaryStatus === 'Standard' ? 'standard' : 'subsidized'
          }
        ];
      }
    });
  };

  const handleRemoveFromCart = (itemId: string, day: DayOfWeek) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        c => c.item.id === itemId && c.selectedDays.includes(day)
      );

      if (existingIdx === -1) return prevCart;

      const itemInCart = prevCart[existingIdx];
      if (itemInCart.quantity > 1) {
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity - 1
        };
        return updated;
      } else {
        return prevCart.filter((_, idx) => idx !== existingIdx);
      }
    });
  };

  const handleLogout = () => {
    setIsGuestUser(true);
    setShowLoginCard(false);
    setUser({
      ...user,
      fullName: 'Guest Explorer',
      isVerified: false
    });
    setActiveTab('landing');
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      
      {/* NAVBAR PRESENT ON ALL MAIN APP SCREENS */}
      {activeTab !== 'landing' && (
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            if (tab === 'landing') {
              setShowLoginCard(false);
              setActiveTab('landing');
            } else {
              setActiveTab(tab);
            }
          }}
          selectedPlan={selectedPlan}
          cartCount={totalCartCount}
          user={user}
          isGuestUser={isGuestUser}
          onOpenCart={() => setIsCartOpen(true)}
          onCheckout={() => {
            if (totalCartCount > 0) {
              setCheckoutMode('cart');
            } else {
              setCheckoutMode('subscription');
            }
            setActiveTab('checkout');
          }}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 flex flex-col relative">
        
        {/* ========================================================= */}
        {/* VIEW 1: LANDING PAGE WITH LOGIN CARD & HERO AFFORDANCE */}
        {/* ========================================================= */}
        {activeTab === 'landing' && (
          <div 
            onClick={handleLandingScreenClick}
            className="w-screen h-screen bg-white relative flex items-center justify-center overflow-hidden select-none cursor-pointer"
          >
            {/* Background Image Artwork Synchronized */}
            <div className={`w-full h-full flex items-center justify-center landing-image-transition ${
              showLoginCard ? 'sm:-translate-x-24 sm:scale-95 opacity-90' : 'translate-x-0 scale-100 opacity-100'
            }`}>
              <img
                src="/landing_page.png"
                alt="Stuvvy Home Food Landing Page"
                className="w-full h-full object-contain max-h-screen p-2 sm:p-4"
              />
            </div>

            {/* FLOATING HERO QUICK ACTIONS & AFFORDANCE HINT (SHOWN BEFORE LOGIN IS EXPANDED) */}
            {!showLoginCard && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col sm:flex-row items-center gap-3 bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-2xl rounded-3xl p-3 px-5 animate-bounce"
              >
                <div className="flex items-center gap-2 text-xs font-black text-zinc-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <span>Tap anywhere to log in, or choose:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleContinueAsGuest}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-300 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Explore as Guest</span>
                  </button>

                  <button
                    onClick={() => setShowLoginCard(true)}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105"
                  >
                    <LogIn className="w-3.5 h-3.5 text-orange-400" />
                    <span>Subscriber Login</span>
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN CARD SLIDES SMOOTHLY IN ON RIGHT MIDDLE */}
            {showLoginCard && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-4 sm:right-12 md:right-24 top-1/2 z-20 w-full max-w-[400px] px-2 sm:px-0 login-card-slide-in"
              >
                <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-2xl rounded-[32px] p-6 sm:p-8 text-center space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h2 className="text-2xl sm:text-3xl font-normal font-serif italic text-zinc-950 tracking-tight">
                        Welcome to Stuvvy
                      </h2>
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                        Authentic South Indian Homely Meals
                      </p>
                    </div>

                    <button
                      onClick={() => setShowLoginCard(false)}
                      className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {authStatusMessage && (
                    <div className="py-2 px-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-black tracking-wider text-center animate-shake uppercase">
                      {authStatusMessage}
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyAndStart();
                    }} 
                    className="space-y-3 pt-1"
                  >
                    <div>
                      <label className="block text-left text-[11px] font-bold text-zinc-700 mb-1">
                        FULL NAME (IN CAPITAL LETTERS)
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value.toUpperCase())}
                        placeholder="NAME IN CAPITAL (e.g. SRI RAM V K)"
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-2xl text-xs font-black tracking-wide uppercase text-zinc-900 placeholder:text-zinc-400 placeholder:normal-case focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-left text-[11px] font-bold text-zinc-700 mb-1">
                        MOBILE NUMBER
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="MOBILE NO (e.g. 9344795832)"
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-2xl text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-left text-[11px] font-bold text-zinc-700 mb-1">
                        DATE OF BIRTH (YYYY/MM/DD)
                      </label>
                      <input
                        type="text"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        placeholder="DOB (YYYY/MM/DD, e.g. 2007/10/26)"
                        className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-2xl text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      {isSuccess ? (
                        <div className="bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md animate-bounce">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Verified! Opening Menu...</span>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={isVerifying}
                          className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                        >
                          <LogIn className="w-4 h-4 text-orange-400" />
                          <span>{isVerifying ? 'Verifying...' : 'Verify and Enter'}</span>
                        </button>
                      )}

                      {/* GUEST PERSPECTIVE SELECTION BUTTON */}
                      <button
                        type="button"
                        onClick={handleContinueAsGuest}
                        className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-extrabold py-2.5 rounded-2xl text-xs border border-zinc-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-zinc-700" />
                        <span>Continue as Guest (Preview Mon–Wed)</span>
                      </button>
                    </div>
                  </form>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-center text-[11px] font-bold text-zinc-500">
                    <button
                      type="button"
                      onClick={() => setIsAdminContactOpen(true)}
                      className="text-zinc-950 underline font-black hover:text-zinc-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Need help? Contact Administrator</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: DISCOVER MENU (EXACT MATCH MENU.PNG DESIGN) */}
        {/* ========================================================= */}
        {activeTab === 'discover' && (
          <div className="w-screen min-h-screen overflow-y-auto page-fade-in">
            {/* GUEST BANNER */}
            {isGuestUser && (
              <div className="bg-zinc-900 text-white px-4 py-2 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <span>Viewing as <strong>Guest Explorer</strong> • Preview available for Monday – Wednesday (Days 4–7 Locked)</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowLoginCard(true);
                      setActiveTab('landing');
                    }}
                    className="bg-white text-zinc-950 px-3 py-1 rounded-xl text-[11px] font-black hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Log In (SRI RAM V K)
                  </button>
                  <button
                    onClick={() => setIsAdminContactOpen(true)}
                    className="text-zinc-300 hover:text-white underline text-[11px] font-bold cursor-pointer"
                  >
                    Contact Admin
                  </button>
                </div>
              </div>
            )}

            <CenteredFrameMenu
              items={MOCK_MENU_ITEMS}
              user={user}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onSelectItemDetails={() => setActiveTab('plans')}
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay(day)}
              selectedMealTime={selectedMealTime}
              onSelectMealTime={(meal) => setSelectedMealTime(meal)}
              onOpenSubscriptions={() => setActiveTab('plans')}
              isGuestUser={isGuestUser}
              onOpenLoginModal={() => {
                setShowLoginCard(true);
                setActiveTab('landing');
              }}
              onOpenAdminContact={() => setIsAdminContactOpen(true)}
              onOpenCart={() => setIsCartOpen(true)}
              onProceedToCheckout={() => {
                setCheckoutMode('cart');
                setActiveTab('checkout');
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: SUBSCRIPTION PLANS */}
        {/* ========================================================= */}
        {activeTab === 'plans' && (
          <div className="w-screen min-h-screen relative flex items-center justify-center bg-white page-fade-in overflow-y-auto py-8">
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-15 sm:opacity-25 sm:-translate-x-24 sm:scale-95">
              <img
                src="/landing_page.png"
                alt="Stuvvy Background Synchronization"
                className="w-full h-full object-contain max-h-screen"
              />
            </div>

            <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
              <PricingSection
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
                onViewMenu={(planType) => setPlanMenuModal({ isOpen: true, planType })}
                isCompactView={false}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: CHECKOUT FLOW */}
        {/* ========================================================= */}
        {activeTab === 'checkout' && (
          <div className="w-screen min-h-screen relative flex items-center justify-center bg-white page-fade-in overflow-y-auto py-8">
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-15 sm:opacity-25 sm:-translate-x-24 sm:scale-95">
              <img
                src="/landing_page.png"
                alt="Stuvvy Background Synchronization"
                className="w-full h-full object-contain max-h-screen"
              />
            </div>

            <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
              <CheckoutFlow
                plan={selectedPlan}
                selectedDays={selectedDays}
                initialPrice={calculatedPrice}
                user={user}
                cart={cart}
                checkoutMode={checkoutMode}
                onBack={() => setActiveTab(checkoutMode === 'cart' ? 'discover' : 'plans')}
                onCompleteCheckout={(calendar) => {
                  if (calendar) {
                    setSavedCalendar(calendar);
                  }
                  setActiveTab('dashboard');
                }}
                onSwitchPlan={(newPlan, newDays, newPrice) => {
                  setSelectedPlan(newPlan);
                  setSelectedDays(newDays);
                  setCalculatedPrice(newPrice);
                }}
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: ACCOUNT DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="w-screen min-h-screen relative flex items-center justify-center bg-white page-fade-in overflow-y-auto py-8">
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-15 sm:opacity-20 sm:-translate-x-24 sm:scale-95">
              <img
                src="/landing_page.png"
                alt="Stuvvy Background Synchronization"
                className="w-full h-full object-contain max-h-screen"
              />
            </div>

            <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6">
              <AccountDashboard
                activePlan={selectedPlan}
                onNavigateToPlans={() => setActiveTab('plans')}
                savedCalendar={savedCalendar}
                user={user}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCheckoutMode('cart');
          setActiveTab('checkout');
        }}
        selectedDay={selectedDay}
      />

      {/* Footer on Subscriptions / Checkout / Dashboard screens */}
      {activeTab !== 'landing' && activeTab !== 'discover' && (
        <footer className="bg-white/90 backdrop-blur-md border-t border-zinc-200/80 py-6 px-6 text-center text-xs text-zinc-400 font-medium relative z-20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-zinc-900 font-heading">
              <div className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] flex items-center justify-center font-black">
                S
              </div>
              <span>Stuvvy Subscriptions</span>
            </div>

            <p>© 2026 Stuvvy Food Platform Inc. All rights reserved.</p>

            <div className="flex items-center gap-4 text-zinc-500 font-bold">
              <button 
                onClick={() => {
                  setShowLoginCard(false);
                  setActiveTab('landing');
                }} 
                className="hover:text-zinc-900 cursor-pointer"
              >
                Landing
              </button>
              <button 
                onClick={() => setActiveTab('discover')} 
                className="hover:text-zinc-900 cursor-pointer"
              >
                Daily Menu
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="hover:text-zinc-900 cursor-pointer"
              >
                Account
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* ADMIN CONTACT MODAL FOR GUESTS & SUBSCRIBERS */}
      <AdminContactModal
        isOpen={isAdminContactOpen}
        onClose={() => setIsAdminContactOpen(false)}
        onOpenLogin={() => {
          setShowLoginCard(true);
          setActiveTab('landing');
        }}
      />

      {/* PLAN MENU MODAL */}
      <PlanMenuModal
        isOpen={planMenuModal.isOpen}
        onClose={() => setPlanMenuModal(prev => ({ ...prev, isOpen: false }))}
        planType={planMenuModal.planType}
        items={MOCK_MENU_ITEMS}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onSelectPlan={(planId) => {
          const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
          handleSelectPlan(plan);
        }}
      />
    </div>
  );
}
