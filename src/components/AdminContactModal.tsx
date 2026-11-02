'use client';

import React from 'react';
import { X, Phone, Mail, MessageSquare, ShieldCheck, UserCheck, Clock, ArrowRight } from 'lucide-react';

interface AdminContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const AdminContactModal: React.FC<AdminContactModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-zinc-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full text-xs font-black text-zinc-900">
            <ShieldCheck className="w-4 h-4 text-zinc-950" />
            <span>Stuvvy Administrator Support</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-zinc-950 tracking-tight">
            Contact Stuvvy Administrator
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Contact our hotline or support team to get registered, activate a custom subscription plan, or unlock full 7-day menu access.
          </p>
        </div>

        {/* CONTACT DIRECTORY CARDS */}
        <div className="space-y-3">
          {/* PHONE HOTLINE */}
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Admin Hotline</span>
                <span className="text-sm font-black text-zinc-950">+91 9344795832</span>
              </div>
            </div>
            <a
              href="tel:+919344795832"
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Call
            </a>
          </div>

          {/* WHATSAPP SUPPORT */}
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">WhatsApp Direct</span>
                <span className="text-sm font-black text-zinc-950">+91 9344795832</span>
              </div>
            </div>
            <a
              href="https://wa.me/919344795832"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Connect</span>
            </a>
          </div>

          {/* EMAIL SUPPORT */}
          <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email Support</span>
                <span className="text-sm font-black text-zinc-950">admin@stuvvy.com</span>
              </div>
            </div>
            <a
              href="mailto:admin@stuvvy.com"
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Email
            </a>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Log In / Register Now</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-3.5 px-5 rounded-2xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
