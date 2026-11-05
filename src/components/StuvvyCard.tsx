'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Sparkles, ShieldCheck, QrCode, CheckCircle2, Award, Calendar, MapPin, Zap } from 'lucide-react';
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
        dark: '#18042C',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [displayId, fullName, mobileNumber, planName, startDateStr, endDateStr, status]);

  // Export card to PNG using Canvas with Deep Violet, Electric Purple, and Soft Pink styling
  const handleDownloadCard = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Card Dimensions (Standard High-DPI Credit/Membership Card Ratio: 1050 x 600)
      canvas.width = 1050;
      canvas.height = 600;

      // 1. Deep Violet Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#18042C');
      bgGrad.addColorStop(0.5, '#2E1065');
      bgGrad.addColorStop(1, '#3B0764');
      ctx.fillStyle = bgGrad;
      ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
      ctx.fill();

      // 2. Electric Purple & Soft Pink Border Accents
      const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      borderGrad.addColorStop(0, '#9333EA');
      borderGrad.addColorStop(0.5, '#F472B6');
      borderGrad.addColorStop(1, '#A855F7');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 6;
      ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 36);
      ctx.stroke();

      // Inner subtle glow border
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.25)';
      ctx.lineWidth = 2;
      ctx.roundRect(24, 24, canvas.width - 48, canvas.height - 48, 28);
      ctx.stroke();

      // 3. Header: Brand Logo & Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('STUVVY', 60, 85);

      ctx.fillStyle = '#F472B6';
      ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('• AUTHENTIC SOUTH INDIAN HOME FOOD', 225, 80);

      // Holographic Soft Pink / Electric Purple Chip Visual
      const chipGrad = ctx.createLinearGradient(60, 120, 150, 185);
      chipGrad.addColorStop(0, '#A855F7');
      chipGrad.addColorStop(0.5, '#F472B6');
      chipGrad.addColorStop(1, '#7C3AED');
      ctx.fillStyle = chipGrad;
      ctx.roundRect(60, 125, 95, 65, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('STV-CHIP', 78, 162);

      // 4. Status Badge (Right aligned)
      const badgeText = status === 'Active' ? 'VERIFIED ACTIVE' : status.toUpperCase();
      ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
      ctx.roundRect(canvas.width - 240, 52, 180, 38, 19);
      ctx.fill();
      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = 1.5;
      ctx.roundRect(canvas.width - 240, 52, 180, 38, 19);
      ctx.stroke();

      ctx.fillStyle = '#FBCFE8';
      ctx.font = '900 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`✓ ${badgeText}`, canvas.width - 220, 76);

      // 5. Customer Name & Initials
      ctx.fillStyle = '#FBCFE8';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SUBSCRIBER CARDHOLDER', 60, 235);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(fullName.toUpperCase(), 60, 275);

      // 6. Details Grid
      // Plan Duration
      ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PLAN DURATION', 60, 335);
      ctx.fillStyle = '#F472B6';
      ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(planName.toUpperCase(), 60, 365);

      // Starting Date
      ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('STARTING DATE', 300, 335);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(startDateStr, 300, 365);

      // Ending Date
      ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ENDING DATE', 540, 335);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(endDateStr, 540, 365);

      // Delivery Location
      ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('DELIVERY LOCATION', 60, 425);
      ctx.fillStyle = '#e4e4e7';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      const locDisplay = location.length > 55 ? location.slice(0, 52) + '...' : location;
      ctx.fillText(locDisplay, 60, 452);

      // 7. Divider Line
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 490);
      ctx.lineTo(canvas.width - 60, 490);
      ctx.stroke();

      // 8. Footer: Membership ID & Phone
      ctx.fillStyle = '#A855F7';
      ctx.font = '900 15px monospace';
      ctx.fillText(`MEMBERSHIP ID: ${displayId}`, 60, 530);

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`REGISTERED PHONE: +91 ${mobileNumber || '9626531680'}`, 60, 555);

      // 9. Embed QR Code onto Canvas if ready
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
        });
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(canvas.width - 195, 335, 135, 135, 16);
        ctx.fill();
        ctx.drawImage(qrImg, canvas.width - 190, 340, 125, 125);

        ctx.fillStyle = '#FBCFE8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('SCAN TO VERIFY', canvas.width - 175, 490);
      }

      // Convert Canvas to Download Link
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `stuvvy-subscriber-card-${fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Error generating card download:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* DIGITAL STUVVY CARD: ELECTRIC PURPLE, DEEP VIOLET & SOFT PINK             */}
      {/* ========================================================================= */}
      <div
        ref={cardRef}
        className="w-full rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden transition-all duration-300 border"
        style={{
          background: 'linear-gradient(135deg, #18042C 0%, #2E1065 50%, #3B0764 100%)',
          borderColor: 'rgba(168, 85, 247, 0.45)',
          boxShadow: '0 25px 50px -15px rgba(24, 4, 44, 0.8), inset 0 1px 0 rgba(244, 114, 182, 0.35)'
        }}
      >
        {/* Subtle electric purple & soft pink ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A855F7]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F472B6]/15 rounded-full blur-3xl pointer-events-none" />

        {/* TOP ROW: BRAND & STATUS */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#9333EA] to-[#F472B6] flex items-center justify-center font-black text-xl text-white shadow-lg border border-pink-300/40">
              S
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white flex items-center gap-2">
                <span>STUVVY</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FBCFE8] bg-[#F472B6]/20 px-2.5 py-0.5 rounded-md border border-[#F472B6]/40">
                  SUBSCRIBER PASS
                </span>
              </div>
              <p className="text-[10px] text-purple-200/80 font-medium">Authentic South Indian Homely Food</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#F472B6]/20 text-[#FBCFE8] border border-[#F472B6]/40 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>{status === 'Active' ? 'Verified Active' : status}</span>
          </div>
        </div>

        {/* HOLOGRAPHIC CHIP & PROFILE AVATAR ROW */}
        <div className="my-6 flex items-center justify-between gap-4 relative z-10">
          {/* Holographic Chip */}
          <div className="w-14 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] via-[#F472B6] to-[#7C3AED] p-0.5 flex items-center justify-center shadow-lg border border-pink-300/50">
            <div className="w-full h-full bg-[#18042C]/40 rounded-lg flex items-center justify-center text-[9px] font-mono font-bold text-white tracking-widest">
              STV-CHIP
            </div>
          </div>

          {/* User Initials Badge */}
          <div className="flex items-center gap-2.5 bg-[#18042C]/80 px-4 py-2 rounded-2xl border border-purple-500/30">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#9333EA] to-[#F472B6] text-white font-black text-xs flex items-center justify-center shadow-sm">
              {initials.slice(0, 3)}
            </div>
            <span className="text-xs font-black tracking-wide text-white">
              {fullName}
            </span>
          </div>
        </div>

        {/* SUBSCRIBER CARD DETAILS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-purple-500/20 relative z-10 text-xs">
          <div>
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Plan Opted</div>
            <div className="font-black text-[#F472B6] text-sm mt-0.5">{planName}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Starting Date</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{startDateStr}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Ending Date</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{endDateStr}</div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Delivery Area</div>
            <div className="font-extrabold text-purple-100 text-sm mt-0.5 truncate">{location}</div>
          </div>
        </div>

        {/* BOTTOM ROW: QR & MEMBERSHIP ID */}
        <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-[10px] text-purple-300 font-mono tracking-widest uppercase">ID: {displayId}</div>
            <div className="text-[11px] text-purple-200/90 font-medium mt-0.5">Show this pass for kitchen verification</div>
          </div>

          {qrDataUrl && (
            <div className="bg-white p-1.5 rounded-xl shadow-lg shrink-0">
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
          className="w-full sm:w-auto font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] border"
          style={{
            background: 'linear-gradient(135deg, #2E1065 0%, #9333EA 50%, #F472B6 100%)',
            borderColor: 'rgba(244, 114, 182, 0.4)',
            color: '#ffffff'
          }}
        >
          <Download className="w-4 h-4 text-[#FBCFE8]" />
          <span>{isDownloading ? 'Generating Card...' : 'Download Your Stuvvy Card'}</span>
        </button>
      </div>
    </div>
  );
};
