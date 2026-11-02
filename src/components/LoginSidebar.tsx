'use client';

import React, { useState } from 'react';
import { X, Phone, User, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

import { validateCustomerLogin } from '../data/customerAuth';

interface LoginSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginSidebar: React.FC<LoginSidebarProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
}) => {
  const [mobileNumber, setMobileNumber] = useState(user.mobileNumber || '');
  const [fullName, setFullName] = useState(user.fullName || '');
  const [dob, setDob] = useState(user.dob || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    const authResult = validateCustomerLogin(fullName, mobileNumber, dob);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        onLoginSuccess({
          ...user,
          fullName: authResult.customer?.name || fullName,
          mobileNumber: authResult.customer?.mobileNo || mobileNumber,
          dob: authResult.customer?.dob || dob,
          address: authResult.customer?.address || user.address,
          isVerified: true
        });
        onClose();
      }, 700);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-center pointer-events-auto">
      {/* Backdrop overlay with blur */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Right Middle Login Card Container */}
      <div className="relative z-10 w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:my-auto sm:mr-4 md:mr-8 bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-2xl rounded-none sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto transform transition-all duration-300 ease-out animate-in slide-in-from-right">
        
        <div>
          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200/80 shadow-xs flex items-center justify-center shrink-0">
                <img 
                  src="/STUVVY-LOGO.jpeg" 
                  alt="Stuvvy Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xl font-heading tracking-tight text-zinc-900">
                Stuvvy
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Artistic Header Section synchronized with landing page */}
          <div className="text-left space-y-1 mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F97316] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
              Subscriber Sign In
            </span>
            <h2 className="text-2xl font-black font-heading text-zinc-950 tracking-tight pt-1">
              Welcome to Stuvvy
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Enter your Name (CAPITAL), Mobile Number & DOB (YYYY/MM/DD) to verify.
            </p>
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp();
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                FULL NAME (IN CAPITAL LETTERS)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.toUpperCase())}
                  placeholder="NAME IN CAPITAL (e.g. SRI RAM V K)"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-black uppercase focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition-all text-zinc-900 placeholder:normal-case"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                MOBILE NUMBER
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="MOBILE NO (e.g. 9344795832)"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition-all text-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                DATE OF BIRTH (YYYY/MM/DD)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="YYYY/MM/DD (e.g. 2007/10/26)"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition-all text-zinc-900"
                />
              </div>
            </div>

            <div className="pt-2">
              {isSuccess ? (
                <div className="bg-emerald-600 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-xs animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Authenticated! Welcome...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span>{isVerifying ? 'Verifying...' : 'Verify and Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-zinc-100 text-center">
          <p className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>Encrypted & secure passwordless authentication</span>
          </p>
        </div>
      </div>
    </div>
  );
};
