'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, Heart, Phone, MapPin, CheckCircle2, Clock, 
  ShieldCheck, AlertCircle, RefreshCw, UserCheck, MessageSquare, ChevronRight
} from 'lucide-react';
import { UserProfile, CartItem } from '../types';

interface Screen4OrderTrackingProps {
  user: UserProfile;
  cart: CartItem[];
  onNavigate: (screen: number) => void;
}

export const Screen4OrderTracking: React.FC<Screen4OrderTrackingProps> = ({
  user,
  cart,
  onNavigate,
}) => {
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [currentStep, setCurrentStep] = useState<number>(2); // Step 2: Out for Delivery
  const [expectedArrivalTime, setExpectedArrivalTime] = useState('');
  const [orderPlacedTime, setOrderPlacedTime] = useState('');

  // Calculate dynamic arrival time and order placed time based on actual current time
  useEffect(() => {
    const calculateTimes = () => {
      const now = new Date();
      
      // Order placed 12 minutes ago
      const placed = new Date(now.getTime() - 12 * 60000);
      setOrderPlacedTime(placed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Expected arrival now + etaMinutes
      const arrival = new Date(now.getTime() + etaMinutes * 60000);
      setExpectedArrivalTime(arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    calculateTimes();
  }, [etaMinutes]);

  // Simulated ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: 'Order Placed', desc: orderPlacedTime || 'Just now', completed: true },
    { title: 'Kitchen Preparing', desc: 'Fresh & Hot', completed: true },
    { title: 'Out for Delivery', desc: 'Rider En Route', completed: true, active: true },
    { title: 'Delivered', desc: expectedArrivalTime ? `By ${expectedArrivalTime}` : 'Pending', completed: false }
  ];

  const riderInfo = {
    name: 'Ramesh Kumar',
    role: 'Stuvvy Delivery Partner',
    vehicle: 'Ather EV Scooter • KA 05 EV 4412',
    rating: 4.95,
    deliveriesCount: 412,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-gray-800">
      
      {/* Warm Orange Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white pt-6 pb-12 px-4 relative overflow-hidden shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-white/30">
                Live Delivery Order #STV-88192
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">Live Order Tracking</h1>
            <p className="text-xs text-orange-100">
              Fresh hot meal on its way to your home
            </p>
          </div>

          {/* Animated Delivery Truck Icon */}
          <div className="bg-white text-orange-600 p-3 rounded-2xl shadow-lg relative flex items-center justify-center animate-pulse">
            <Truck className="w-8 h-8 text-orange-600" />
            <Heart className="w-4 h-4 text-red-500 absolute -top-1 -right-1 fill-red-500 animate-ping" />
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* Live ETA Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg text-center mb-5">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-extrabold mb-2">
            <Clock className="w-3.5 h-3.5 text-orange-600 animate-spin" />
            <span>ESTIMATED ARRIVAL TIME</span>
          </div>

          <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            {etaMinutes} <span className="text-lg font-bold text-gray-500">Mins</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Expected arrival at <strong className="text-gray-800">{expectedArrivalTime || 'in few mins'}</strong>
          </p>

          {/* VISUAL BADGE: SUBSIDIZED / DONATION ORDER */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>💛 Subsidized / Community Funded Order</span>
            </div>
          </div>
        </div>

        {/* Live Status Progress Bar */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-4">
            Delivery Status Roadmap
          </h3>

          <div className="grid grid-cols-4 gap-2 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                    step.active
                      ? 'bg-orange-500 text-white ring-4 ring-orange-200 scale-110'
                      : step.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={`text-[11px] font-bold mt-2 leading-tight ${step.active ? 'text-orange-600 font-extrabold' : 'text-gray-700'}`}>
                  {step.title}
                </span>
                <span className="text-[9px] text-gray-400 mt-0.5">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Volunteer / Rider Details */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Assigned Delivery Partner
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Verified Volunteer
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-orange-100 border-2 border-orange-400 shrink-0">
              <img
                src={riderInfo.avatar}
                alt={riderInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-gray-900">{riderInfo.name}</h3>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  ★ {riderInfo.rating}
                </span>
              </div>
              <p className="text-xs text-orange-600 font-semibold">{riderInfo.role}</p>
              <p className="text-[11px] text-gray-500">{riderInfo.vehicle}</p>
            </div>
          </div>

          {/* Administrator Contact Section (Requirement: Contact Admin instead of rider) */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <p className="text-[11px] text-gray-500 font-medium">
              For any questions, directions, or meal delivery support, contact the <strong>Stuvvy Administrator</strong> directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="tel:+919344795832"
                className="bg-gray-900 hover:bg-black text-white font-extrabold py-2.5 px-3 rounded-2xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Call Admin (+91 9344795832)</span>
              </a>

              <a
                href="https://wa.me/919344795832?text=Hi%20Stuvvy%20Administrator,%20I%20have%20a%20question%20about%20my%20delivery%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-2xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Connect through WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
              Delivery Destination
            </h4>
          </div>
          <p className="text-xs font-bold text-gray-900">{user.fullName}</p>
          <p className="text-xs text-gray-600">{user.address}</p>
          <p className="text-[11px] text-gray-400 mt-1">Contact: {user.mobileNumber}</p>
        </div>
      </main>
    </div>
  );
};
