'use client';

import React from 'react';
import { X, CheckCircle2, Heart } from 'lucide-react';

export interface LandingReviewEntry {
  id: string;
  name: string;
  tag: string;
  reviewText: string;
}

// Single genuine customer review for now; additional reviews can be appended here in the future
export const LANDING_REVIEWS: LandingReviewEntry[] = [
  {
    id: 'review-sanjana-1',
    name: 'SANJANA',
    tag: 'Our First Customer',
    reviewText:
      "Hi, The food is really good. And importantly it's exactly like home food. Especially I liked ur packing please keep doing the same. I'm really happy with ur service. I believe and wish you keep doing the same work all the time. I'm honestly happy with the taste and work….. One small request from my side is I personally don't want to include banana due to my dad's health requirements…",
  },
];

interface LandingReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandingReviewPopup: React.FC<LandingReviewPopupProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen || LANDING_REVIEWS.length === 0) return null;

  const currentReview = LANDING_REVIEWS[0];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-xl animate-in fade-in duration-200"
      role="dialog"
      aria-label="Customer Review"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[24px] shadow-2xl p-4 sm:p-5 space-y-3">
        {/* TOP ROW: NAME ON LEFT TOP, X MARK ON RIGHT TOP */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-black text-[11px] flex items-center justify-center shrink-0">
              {currentReview.name.slice(0, 1)}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="text-xs sm:text-sm font-black tracking-wide text-zinc-950">
                {currentReview.name}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full">
                <Heart className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                <span>{currentReview.tag}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review popup"
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* REVIEW PARAGRAPH (STATIC, CLEAN & READABLE) */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-3.5 sm:p-4">
          <p className="text-xs sm:text-[13px] leading-relaxed font-medium text-zinc-800">
            &ldquo;{currentReview.reviewText}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

