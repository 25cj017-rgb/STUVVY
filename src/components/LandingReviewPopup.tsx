'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export interface LandingReviewEntry {
  id: string;
  name: string;
  tag: string;
  reviewText: string;
  rating?: number;
}

// Single genuine customer review for initial baseline
export const DEFAULT_LANDING_REVIEWS: LandingReviewEntry[] = [
  {
    id: 'review-sanjana-1',
    name: 'SANJANA',
    tag: 'Our First Customer',
    rating: 5,
    reviewText:
      "Hi, The food is really good. And importantly it's exactly like home food. Especially I liked ur packing please keep doing the same. I'm really happy with ur service. I believe and wish you keep doing the same work all the time. I'm honestly happy with the taste and work….. One small request from my side is I personally don't want to include banana due to my dad's health requirements…",
  },
  {
    id: 'review-yamuna-1',
    name: 'YAMUNA J N',
    tag: 'Monthly Subscriber',
    rating: 5,
    reviewText:
      "Food exceeded all my expectation.. quality wise, quantity wise, and taste wise. I can't even point out a single standout dish because I genuinely enjoyed every single one. Stuvvy is already doing great work in food delivery. Compared to other delivery services that are costlier and not up to the mark, Stuvvy's service is more than satisfying. I hope you keep up this exact same standard as you grow and gain a huge number of customers. Wishing great heights for Stuvvy!",
  },
  {
    id: 'review-chandran-1',
    name: 'Chandran',
    tag: 'Upgraded Subscriber',
    rating: 5,
    reviewText: 'Good work keep doing the same',
  },
  {
    id: 'review-priyanka-1',
    name: 'PRIYANKA S',
    tag: 'Monthly Subscriber',
    rating: 5,
    reviewText: 'Good start',
  },
];

interface LandingReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  reviews?: LandingReviewEntry[];
}

export const LandingReviewPopup: React.FC<LandingReviewPopupProps> = ({
  isOpen,
  onClose,
  reviews: initialReviews,
}) => {
  const [reviews, setReviews] = useState<LandingReviewEntry[]>(
    initialReviews && initialReviews.length > 0 ? initialReviews : DEFAULT_LANDING_REVIEWS
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync with live testimonials & feedback API
  useEffect(() => {
    let cancelled = false;
    fetch('/api/testimonials', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.testimonials)) {
          const validReviews: LandingReviewEntry[] = [];
          for (const item of data.testimonials) {
            if (item.review && item.review.trim().length > 0) {
              const isSanjana = item.name.toUpperCase().includes('SANJANA') || item.isFirstCustomer;
              const tag = isSanjana
                ? 'Our First Customer'
                : item.hasUpgraded
                ? 'Upgraded Subscriber'
                : 'Verified Subscriber';
              validReviews.push({
                id: item.id,
                name: item.name,
                tag,
                reviewText: item.review,
                rating: item.rating || 5,
              });
            }
          }
          if (validReviews.length > 0) {
            setReviews(validReviews);
          }
        }
      })
      .catch((err) => console.warn('Notice: Could not load live reviews for landing popup:', err));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isOpen || reviews.length === 0) return null;

  const currentReview = reviews[currentIndex] || reviews[0];
  const totalReviews = reviews.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 w-[92vw] max-w-sm animate-in fade-in duration-200"
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

          <div className="flex items-center gap-1 shrink-0">
            {/* If there are multiple reviews, show subtle prev/next controls */}
            {totalReviews > 1 && (
              <div className="flex items-center gap-0.5 mr-1 bg-zinc-100 rounded-full p-0.5 border border-zinc-200">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous review"
                  className="w-5 h-5 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[9px] font-bold text-zinc-500 px-1">
                  {currentIndex + 1}/{totalReviews}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next review"
                  className="w-5 h-5 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close review popup"
              className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* REVIEW PARAGRAPH (CLEAN & READABLE) */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-3.5 sm:p-4 space-y-2 max-h-[52vh] overflow-y-auto">
          {currentReview.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: currentReview.rating }).map((_, idx) => (
                <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              ))}
            </div>
          )}
          <p className="text-xs sm:text-[13px] leading-relaxed font-medium text-zinc-800">
            &ldquo;{currentReview.reviewText}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
