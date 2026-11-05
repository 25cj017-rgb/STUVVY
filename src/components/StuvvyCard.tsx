'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Sparkles, ShieldCheck, QrCode, CheckCircle2, Award, Calendar, MapPin } from 'lucide-react';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
        dark: '#09090b',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [displayId, fullName, mobileNumber, planName, startDateStr, endDateStr, status]);

  // Export card to PNG using Canvas
  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card Dimensions (Standard High-DPI Credit/Membership Card Ratio: 1050 x 600)
      canvas.width = 1050;
      canvas.height = 600;

      // 1. Dark Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#18181b');
      bgGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = bgGrad;
      ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
      ctx.fill();

      // 2. Subtle Gold / Orange Border Accent
      ctx.strokeStyle = status === 'Active' ? '#f97316' : '#a1a1aa';
      ctx.lineWidth = 6;
      ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 36);
      ctx.stroke();

      // Inner subtle glow border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.roundRect(24, 24, canvas.width - 48, canvas.height - 48, 28);
      ctx.stroke();

      // 3. Header: Brand Logo & Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('STUVVY', 60, 85);

      ctx.fillStyle = '#f97316';
      ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('• AUTHENTIC SOUTH INDIAN HOME FOOD', 215, 80);

      // Gold Chip Visual
      const chipGrad = ctx.createLinearGradient(60, 120, 140, 180);
      chipGrad.addColorStop(0, '#fbbf24');
      chipGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = chipGrad;
      ctx.roundRect(60, 125, 90, 65, 12);
      ctx.fill();

      // Chip internal lines
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeRect(75, 135, 60, 45);

      // Status Badge (Top Right)
      const badgeText = status === 'Active' ? 'VERIFIED SUBSCRIBER' : status.toUpperCase();
      ctx.fillStyle = status === 'Active' ? '#10b981' : '#f59e0b';
      ctx.roundRect(740, 50, 250, 45, 22);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✓ ${badgeText}`, 865, 78);
      ctx.textAlign = 'left';

      // 4. Subscriber Details
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SUBSCRIBER NAME', 60, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(fullName.toUpperCase() || 'STUVVY SUBSCRIBER', 60, 280);

      // Membership ID & Plan row
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MEMBERSHIP ID', 60, 340);
      ctx.fillText('ACTIVE PLAN', 320, 340);
      ctx.fillText('DELIVERY LOCATION', 540, 340);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = '800 20px "Courier New", monospace';
      ctx.fillText(displayId, 60, 370);

      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#fb923c';
      ctx.fillText(planName.toUpperCase(), 320, 370);

      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#f4f4f5';
      const truncatedLoc = location.length > 22 ? location.slice(0, 22) + '...' : location;
      ctx.fillText(truncatedLoc, 540, 370);

      // Dates Row
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('START DATE', 60, 440);
      ctx.fillText('VALID THRU (END DATE)', 320, 440);
      ctx.fillText('CUSTOMER CARE', 540, 440);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(startDateStr, 60, 470);
      ctx.fillText(endDateStr, 320, 470);
      ctx.fillText('+91 9344795832', 540, 470);

      // 5. Watermark Footer
      ctx.fillStyle = '#71717a';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Daily Homely Meals • Zero Preservatives • Coimbatore Hot Kitchen • stuvvy.in', 60, 545);

      // 6. Draw QR Code if loaded
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.onload = () => {
          // Draw white card for QR
          ctx.fillStyle = '#ffffff';
          ctx.roundRect(810, 340, 180, 180, 20);
          ctx.fill();
          ctx.drawImage(qrImg, 820, 350, 160, 160);

          ctx.fillStyle = '#a1a1aa';
          ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN TO VERIFY', 900, 545);
          ctx.textAlign = 'left';

          // Trigger download
          const link = document.createElement('a');
          link.download = `stuvvy-subscriber-card-${fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setIsDownloading(false);
        };
        qrImg.src = qrDataUrl;
      } else {
        const link = document.createElement('a');
        link.download = `stuvvy-subscriber-card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsDownloading(false);
      }
    } catch (err) {
      console.error('Error generating card download:', err);
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* DIGITAL SUBSCRIBER CARD DISPLAY */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 text-white shadow-2xl border border-zinc-800 transition-all hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Subtle orange ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP ROW: BRAND & STATUS */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-xl text-white shadow-md">
              S
            </div>
            <div>
              <div className="text-xl font-black font-heading tracking-tight text-white flex items-center gap-2">
                <span>STUVVY</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-800/60">
                  SUBSCRIBER
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Authentic South Indian Homely Food</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'Active' ? 'Verified Active' : status}</span>
          </div>
        </div>

        {/* GOLD CHIP & PROFILE AVATAR ROW */}
        <div className="my-6 flex items-center justify-between gap-4 relative z-10">
          {/* Holographic Chip */}
          <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-1 flex items-center justify-center shadow-inner border border-amber-200/50">
            <div className="w-full h-full border border-amber-700/40 rounded flex items-center justify-center text-[9px] font-mono font-bold text-amber-900 opacity-70">
              STV-CHIP
            </div>
          </div>

          {/* User Initials Badge */}
          <div className="flex items-center gap-2.5 bg-zinc-900/80 px-3.5 py-1.5 rounded-2xl border border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-zinc-800 text-orange-400 font-black text-xs flex items-center justify-center border border-orange-500/30">
              {initials.slice(0, 3)}
            </div>
            <span className="text-xs font-black tracking-wide text-zinc-200">
              {fullName}
            </span>
          </div>
        </div>

        {/* SUBSCRIBER CARD DETAILS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-zinc-800/80 relative z-10 text-xs">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Plan Duration</div>
            <div className="font-black text-orange-400 text-sm mt-0.5">{planName}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Starting Date</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{startDateStr}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ending Date</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{endDateStr}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Delivery Area</div>
            <div className="font-extrabold text-zinc-200 text-sm mt-0.5 truncate">{location}</div>
          </div>
        </div>

        {/* BOTTOM ROW: QR & MEMBERSHIP ID */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">ID: {displayId}</div>
            <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Show this pass for kitchen verification</div>
          </div>

          {qrDataUrl && (
            <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0">
              <img src={qrDataUrl} alt="Stuvvy Subscriber QR" className="w-12 h-12 object-contain" />
            </div>
          )}
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg border border-orange-500/40 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
        >
          <Download className="w-4 h-4 text-orange-400" />
          <span>{isDownloading ? 'Generating Card...' : 'Download Your Stuvvy Card'}</span>
        </button>
      </div>
    </div>
  );
};
