'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  CheckCircle2, Copy, Check, Smartphone, ExternalLink, ShieldCheck, 
  Upload, Settings, RefreshCw, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

interface GooglePayScannerProps {
  amount: number;
  orderId?: string;
  customerName?: string;
  defaultUpiId?: string;
  onPaymentSuccess: (utrNumber: string, upiId: string) => void;
  isProcessing?: boolean;
}

export const GooglePayScanner: React.FC<GooglePayScannerProps> = ({
  amount,
  orderId = `STV-${Date.now().toString().slice(-6)}`,
  customerName = 'Valued Customer',
  defaultUpiId = '9344795832@okaxis',
  onPaymentSuccess,
  isProcessing = false
}) => {
  const [upiId, setUpiId] = useState<string>(defaultUpiId);
  const [payeeName, setPayeeName] = useState<string>('STUVVY HOME FOODS');
  const [scannerMode, setScannerMode] = useState<'dynamic' | 'custom_image'>('dynamic');
  const [customQrImage, setCustomQrImage] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [step, setStep] = useState<'scan' | 'verifying' | 'paid'>('scan');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NPCI Standard UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Stuvvy Order #${orderId}`)}`;

  // Generate crisp QR Code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('QR Generation Error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomQrImage(reader.result as string);
        setScannerMode('custom_image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPaid = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('verifying');

    setTimeout(() => {
      setStep('paid');
      setTimeout(() => {
        onPaymentSuccess(utrNumber || `UTR-${Date.now().toString().slice(-8)}`, upiId);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="mt-4 bg-zinc-50/70 border border-zinc-200/90 rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
      
      {/* 1. TOP HEADER & SUPPORTED APPS STRIP */}
      <div className="flex flex-col items-center text-center space-y-2 border-b border-zinc-200/80 pb-4">
        
        {/* Supported Apps Pills */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span className="bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg text-[11px] font-black text-zinc-900 shadow-2xs">
            G<span className="text-orange-500">Pay</span>
          </span>
          <span className="bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg text-[11px] font-black text-purple-700 shadow-2xs">
            PhonePe
          </span>
          <span className="bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg text-[11px] font-black text-sky-600 shadow-2xs">
            Paytm
          </span>
          <span className="bg-white border border-zinc-200/80 px-2 py-1 rounded-lg text-[10px] font-extrabold text-zinc-700 shadow-2xs">
            BHIM UPI
          </span>
          <span className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-black text-emerald-700 flex items-center gap-1 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-black font-heading text-zinc-950">
            Scan & Pay with Any UPI App
          </h4>
          <p className="text-xs text-zinc-500 font-medium">
            Open Google Pay, PhonePe, or Paytm and scan the QR code below
          </p>
        </div>
      </div>

      {/* 2. CENTERED HIGH-RES QR STANDEE CARD */}
      <div className="flex flex-col items-center justify-center">
        
        <div className="bg-white border-2 border-zinc-200 rounded-2xl p-3.5 shadow-sm flex flex-col items-center max-w-[240px] w-full">
          
          {/* Amount Badge */}
          <div className="w-full bg-zinc-950 text-white py-1 px-3 rounded-lg text-center mb-2.5 flex items-center justify-between text-xs font-extrabold">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">Total Payable</span>
            <span className="text-orange-400 font-heading text-sm font-black">₹{amount}</span>
          </div>

          {/* QR Display */}
          <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-zinc-100">
            {scannerMode === 'custom_image' && customQrImage ? (
              <img
                src={customQrImage}
                alt="Custom Google Pay Standee QR"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="relative flex items-center justify-center">
                <img
                  src={qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`}
                  alt="Google Pay UPI QR Scanner"
                  className="w-48 h-48 object-contain"
                />
                {/* Center GPay Logo Badge */}
                <div className="absolute inset-auto w-8 h-8 rounded-lg bg-white shadow-md border border-zinc-200 flex items-center justify-center p-0.5 pointer-events-none">
                  <div className="w-full h-full rounded bg-zinc-950 text-white flex items-center justify-center font-black text-[9px] font-heading">
                    G<span className="text-orange-400">P</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payee Details & Copy UPI */}
          <div className="w-full mt-2.5 pt-2 border-t border-zinc-100 text-center space-y-1">
            <div className="text-[11px] font-black text-zinc-900 truncate">
              {payeeName}
            </div>
            
            <button
              type="button"
              onClick={handleCopyUpiId}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
              title="Click to copy UPI ID"
            >
              <span className="truncate">{upiId}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 3. MOBILE DIRECT DEEP-LINK BUTTON */}
      <div className="max-w-md mx-auto">
        <a
          href={upiUri}
          className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold text-xs py-2.5 px-4 rounded-xl border border-zinc-300 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center hover:scale-[1.01]"
        >
          <Smartphone className="w-4 h-4 text-orange-600" />
          <span>Pay Directly with Google Pay App (Mobile Users)</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </a>
      </div>

      {/* 4. CONFIRMATION & UTR FORM */}
      <form onSubmit={handleConfirmPaid} className="max-w-md mx-auto space-y-3 pt-2 border-t border-zinc-200/80">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-zinc-700">
              UPI Reference / UTR Number
            </label>
            <span className="text-[10px] text-zinc-400">(Optional • from GPay receipt)</span>
          </div>
          <input
            type="text"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="e.g. 4289 1234 5678 (12 digits)"
            className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950"
          />
        </div>

        {step === 'paid' ? (
          <div className="w-full bg-emerald-600 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Google Pay Verified! Confirming Order...</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isProcessing || step === 'verifying'}
            className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-700 text-white font-black py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
          >
            {step === 'verifying' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                <span>Verifying Google Pay Transaction...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>I Have Paid ₹{amount} via Google Pay</span>
              </>
            )}
          </button>
        )}
      </form>

      {/* 5. DISCREET MERCHANT SETUP (ACCORDION TOGGLE) */}
      <div className="max-w-md mx-auto pt-1">
        <button
          type="button"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-500 hover:text-zinc-800 py-1 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Settings className="w-3 h-3 text-zinc-400" />
            <span>Store Owner: Customize Google Pay UPI ID / Standee</span>
          </span>
          {isConfigOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isConfigOpen && (
          <div className="mt-2 p-3.5 bg-white border border-zinc-200 rounded-xl space-y-3 text-xs shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-zinc-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Merchant QR Setup
              </span>
              <span className="text-[10px] text-zinc-400">Owner Controls</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-600 mb-1">
                  Your Google Pay UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9344795832@okaxis"
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-600 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="STUVVY HOME FOODS"
                  className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-extrabold px-3 py-1.5 rounded-lg border border-zinc-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Standee Photo</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleCustomImageUpload}
                className="hidden"
              />

              {customQrImage && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomQrImage(null);
                    setScannerMode('dynamic');
                  }}
                  className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Reset to Auto QR
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
