'use client';

import React from 'react';
import { UserCheck, Compass, CalendarCheck, MapPin, Database } from 'lucide-react';

interface NavigationProps {
  currentScreen: number;
  onNavigate: (screen: number) => void;
  cartCount: number;
  onOpenSchemaModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  cartCount,
  onOpenSchemaModal
}) => {
  const navItems = [
    {
      id: 1,
      label: 'Auth',
      icon: UserCheck,
      desc: 'Screen 1: Login'
    },
    {
      id: 2,
      label: 'Discover',
      icon: Compass,
      desc: 'Screen 2: Categories'
    },
    {
      id: 3,
      label: 'Subscription',
      icon: CalendarCheck,
      badge: cartCount > 0 ? cartCount : undefined,
      desc: 'Screen 3: Meal Plan'
    },
    {
      id: 4,
      label: 'Tracking',
      icon: MapPin,
      desc: 'Screen 4: Live Order'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-2 py-1.5 max-w-5xl mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-zinc-950 font-black scale-105'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-zinc-950 stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-zinc-950 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Database Quick Button */}
        <button
          onClick={onOpenSchemaModal}
          className="flex flex-col items-center py-1 px-2.5 text-zinc-500 hover:text-zinc-950 transition-colors"
          title="Inspect PostgreSQL Schema & System Spec"
        >
          <Database className="w-5 h-5 text-zinc-500 hover:text-zinc-950" />
          <span className="text-[11px] mt-0.5">Schema</span>
        </button>
      </div>
    </nav>
  );
};
