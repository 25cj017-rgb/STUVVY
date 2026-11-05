'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';

interface StuvvyCardProps {
  fullName: string;
  mobileNumber: string;
  planName: string;
  startDateStr: string;
  endDateStr: string;
  status: 'Active' | 'Upcoming' | 'Expired';
  location: string;
  avatarUrl?: string;
  subscriberId?: string;
}

export const StuvvyCard: React.FC<StuvvyCardProps> = ({
  fullName,
  mobileNumber,
  planName,
  startDateStr,
  endDateStr,
  status,
  location,
  avatarUrl,
  subscriberId
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const displayId = subscriberId || `STV-2026-${mobileNumber ? mobileNumber.slice(-4) : '8899'}`;

  // Extract initials (e.g. "Yamuna J N" -> "Y J N")
  const initials = fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .map(w => w[0]?.toUpperCase())
        .filter(Boolean)
        .join(' ')
    : 'S';

  useEffect(() => {
    // Generate QR Code encoding subscription verification info
    const qrPayload = JSON.stringify({
      brand: 'STUVVY HOME FOOD',
      subscriberId: displayId,
      name: fullName,
      phone: mobileNumber,
      plan: planName,
      validFrom: startDateStr,
      validTo: endDateStr,
      status: status,
      verifyUrl: `https://stuvvy.in/#dashboard`
    });

    QRCode.toDataURL(qrPayload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#24044A',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [displayId, fullName, mobileNumber, planName, startDateStr, endDateStr, status]);

  return (
    <div className="w-full select-none">
      {/* ========================================================================= */}
      {/* DIGITAL STUVVY CARD: VIBRANT ELECTRIC PURPLE, DEEP VIOLET & SOFT PINK    */}
      {/* ========================================================================= */}
      <div
        className="w-full rounded-[32px] p-6 sm:p-9 text-white relative overflow-hidden transition-all duration-300 shadow-2xl border"
        style={{
          background: 'linear-gradient(135deg, #6A13F5 0%, #5B0ED6 50%, #4C09B8 100%)',
          borderColor: 'rgba(242, 202, 226, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(106, 19, 245, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Deep Violet and Soft Pink Ambient Lighting */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(242, 202, 226, 0.25) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" 
          style={{ background: 'radial-gradient(circle, rgba(36, 4, 74, 0.45) 0%, transparent 70%)' }}
        />

        {/* TOP ROW: BRAND LOGO, BADGE & STATUS PILL */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border shrink-0"
              style={{
                background: '#F2CAE2',
                color: '#24044A',
                borderColor: '#ffffff'
              }}
            >
              S
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white flex items-center gap-2.5">
                <span>STUVVY</span>
                <span 
                  className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-xs"
                  style={{
                    background: '#F2CAE2',
                    color: '#24044A'
                  }}
                >
                  SUBSCRIBER PASS
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide" style={{ color: '#F2CAE2' }}>
                Authentic South Indian Homely Food
              </p>
            </div>
          </div>

          {/* STATUS PILL (MATCHING REFERENCE PILL BUTTON) */}
          <div 
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border"
            style={{
              background: 'rgba(36, 4, 74, 0.45)',
              borderColor: '#F2CAE2',
              color: '#F2CAE2'
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#F2CAE2' }} />
            <span>{status === 'Active' ? 'VERIFIED ACTIVE' : status}</span>
          </div>
        </div>

        {/* CHIP & CARDHOLDER NAME ROW */}
        <div className="my-7 flex items-center justify-between gap-4 relative z-10">
          {/* Holographic Chip with Deep Violet Contrast */}
          <div 
            className="w-16 h-11 rounded-xl p-1 flex items-center justify-center shadow-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(242, 202, 226, 0.35) 0%, rgba(36, 4, 74, 0.7) 100%)',
              borderColor: 'rgba(242, 202, 226, 0.5)'
            }}
          >
            <div 
              className="w-full h-full rounded-lg flex items-center justify-center text-[9px] font-mono font-bold tracking-widest"
              style={{
                background: 'rgba(36, 4, 74, 0.65)',
                color: '#F2CAE2'
              }}
            >
              STV-CHIP
            </div>
          </div>

          {/* User Name Badge (Deep Violet container with Soft Pink text) */}
          <div 
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border shadow-md"
            style={{
              background: 'rgba(36, 4, 74, 0.6)',
              borderColor: 'rgba(242, 202, 226, 0.35)'
            }}
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-sm"
              style={{
                background: '#F2CAE2',
                color: '#24044A'
              }}
            >
              {initials.slice(0, 3)}
            </div>
            <span className="text-xs font-black tracking-wider text-white">
              {fullName}
            </span>
          </div>
        </div>

        {/* SUBSCRIBER CARD DETAILS GRID */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t relative z-10 text-xs"
          style={{ borderColor: 'rgba(242, 202, 226, 0.25)' }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#F2CAE2' }}>
              Plan Opted
            </div>
            <div className="font-black text-base mt-1 text-white">
              {planName}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#F2CAE2' }}>
              Starting Date
            </div>
            <div className="font-extrabold text-base mt-1 text-white">
              {startDateStr}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#F2CAE2' }}>
              Ending Date
            </div>
            <div className="font-extrabold text-base mt-1 text-white">
              {endDateStr}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#F2CAE2' }}>
              Delivery Area
            </div>
            <div className="font-extrabold text-sm mt-1 text-white truncate">
              {location}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: QR CODE & PASS VERIFICATION */}
        <div 
          className="mt-6 pt-4 border-t flex items-center justify-between gap-4 relative z-10"
          style={{ borderColor: 'rgba(242, 202, 226, 0.25)' }}
        >
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase font-bold" style={{ color: '#F2CAE2' }}>
              ID: {displayId}
            </div>
            <div className="text-xs text-white/90 font-medium mt-0.5">
              Show this pass for kitchen verification
            </div>
          </div>

          {qrDataUrl && (
            <div className="bg-white p-1.5 rounded-2xl shadow-xl shrink-0">
              <img src={qrDataUrl} alt="Stuvvy Subscriber QR" className="w-12 h-12 object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
