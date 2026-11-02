'use client';

import React, { useState } from 'react';
import { Heart, Truck, ShieldCheck, ArrowRight, Phone, User, Calendar, CheckCircle2, HeartHandshake } from 'lucide-react';
import { UserProfile, BeneficiaryStatus } from '../types';

interface Screen1AuthProps {
  user: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onCompleteAuth: () => void;
}

export const Screen1Auth: React.FC<Screen1AuthProps> = ({
  user,
  onSaveProfile,
  onCompleteAuth,
}) => {
  const [mobileNumber, setMobileNumber] = useState(user.mobileNumber || '+91 93447 95832');
  const [fullName, setFullName] = useState(user.fullName || 'Aarav Sharma');
  const [dob, setDob] = useState(user.dob || '15/08/1995');
  const [beneficiaryStatus, setBeneficiaryStatus] = useState<BeneficiaryStatus>(user.beneficiaryStatus || 'Subsidized');
  
  // OTP modal state
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() || mobileNumber.length < 8) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      
      const updatedUser: UserProfile = {
        ...user,
        fullName,
        mobileNumber,
        dob,
        beneficiaryStatus,
        isVerified: true,
      };
      
      onSaveProfile(updatedUser);

      setTimeout(() => {
        onCompleteAuth();
      }, 800);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600 text-white py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white text-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 border border-orange-200">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-2xl mb-3 shadow-inner relative">
            <Truck className="w-10 h-10 text-orange-600" />
            <Heart className="w-5 h-5 text-red-500 absolute -top-1 -right-1 fill-red-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stuvvy</h1>
          <p className="text-sm text-gray-600 font-medium mt-1">
            Mobile-First Home Food Delivery & Subsidy Network
          </p>
          <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full mt-2 border border-orange-200 font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-orange-600" />
            <span>Standard • Health • Subsidized Meals</span>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleRequestOtp} className="space-y-4">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mobile Number (For SMS OTP)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 93447 95832"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Date of Birth (DD/MM/YYYY)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="DD/MM/YYYY (e.g. 15/08/1995)"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Beneficiary Status Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select User Beneficiary Account Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Subsidized', 'Needy'] as BeneficiaryStatus[]).map((status) => {
                const isSelected = beneficiaryStatus === status;
                return (
                  <button
                    type="button"
                    key={status}
                    onClick={() => setBeneficiaryStatus(status)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center text-center ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-102'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{status === 'Standard' ? 'Standard' : status === 'Subsidized' ? '💛 Subsidized' : '🤝 Needy ($0)'}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {beneficiaryStatus === 'Standard' && 'Standard full-price patron menu ($3.99 - $6.99)'}
              {beneficiaryStatus === 'Subsidized' && 'Subsidized rate for students/low income ($0 - $1.50)'}
              {beneficiaryStatus === 'Needy' && 'Fully sponsored by Community Care Fund ($0.00)'}
            </p>
          </div>

          {/* Buttons: Request OTP & Direct Start */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group text-sm"
            >
              <span>Request OTP Code</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 px-4 rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify & Start Instantly (Demo Access)</span>
            </button>
          </div>
        </form>

        {/* OTP Simulation Modal */}
        {otpSent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-orange-100 text-center animate-pulse-glow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">SMS Verification Code</h3>
              <p className="text-xs text-gray-600 mt-1">
                Enter 4-digit code sent to <span className="font-bold text-gray-800">{mobileNumber}</span>
              </p>

              {/* 4 Digit Input */}
              <div className="flex justify-center gap-2 my-5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newDigits = [...otpDigits];
                      newDigits[idx] = e.target.value;
                      setOtpDigits(newDigits);
                    }}
                    className="w-12 h-12 text-center text-xl font-bold bg-orange-50 border-2 border-orange-400 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-orange-900"
                  />
                ))}
              </div>

              {verificationSuccess ? (
                <div className="bg-emerald-100 text-emerald-800 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified! Opening Discover Menu...</span>
                </div>
              ) : (
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <span>Verifying OTP...</span>
                  ) : (
                    <>
                      <span>Verify & Start</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="mt-3 text-xs text-gray-500 hover:text-gray-800 underline font-medium"
              >
                Change details or cancel
              </button>
            </div>
          </div>
        )}

        {/* Low-Bandwidth Notice */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 leading-tight">
            ⚡ Stuvvy is optimized for 2G/3G networks & low-cost smartphones.
          </p>
        </div>
      </div>
    </div>
  );
};
