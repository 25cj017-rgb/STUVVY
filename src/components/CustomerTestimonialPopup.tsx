'use client';

import React, { useEffect, useState } from 'react';
import { X, Star, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { CustomerTestimonialItem } from '@/app/api/testimonials/route';

interface CustomerTestimonialPopupProps {
  isOpen: boolean;
  onCloseAndContinue: () => void;
}

export const CustomerTestimonialPopup: React.FC<CustomerTestimonialPopupProps> = ({
  isOpen,
  onCloseAndContinue,
}) => {
  const [testimonials, setTestimonials] = useState<CustomerTestimonialItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);

    fetch('/api/testimonials', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
          // Rotate starting customer across opens using sessionStorage counter
          try {
            const prevCount = parseInt(sessionStorage.getItem('stuvvy_testimonial_rot') || '0', 10);
            const nextIdx = prevCount % data.testimonials.length;
            setActiveIndex(nextIdx);
            sessionStorage.setItem('stuvvy_testimonial_rot', String(prevCount + 1));
          } catch {
            setActiveIndex(0);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load live testimonials:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const current = testimonials[activeIndex] || null;
  const total = testimonials.length;

  const handlePrev = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      onClick={onCloseAndContinue}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Customer Experience"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white border border-zinc-200/90 rounded-[28px] shadow-2xl p-5 sm:p-6 space-y-4 text-left"
      >
        {/* TOP-RIGHT CLOSE BUTTON (X) */}
        <button
          type="button"
          onClick={onCloseAndContinue}
          aria-label="Close and continue to registration"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SMALL WARM HEADING */}
        <div className="pr-8">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 text-orange-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span>
              {current?.isFirstCustomer
                ? "Our First Customer's Experience ❤️"
                : 'Verified Stuvvy Subscriber ❤️'}
            </span>
          </div>
        </div>

        {/* BODY */}
        {isLoading && !current ? (
          <div className="py-6 text-center text-xs font-semibold text-zinc-500">
            Loading verified subscriber experience...
          </div>
        ) : current ? (
          <div className="space-y-3.5">
            {/* CUSTOMER IDENTITY ROW */}
            <div className="flex items-center gap-3">
              {current.photoUrl ? (
                <img
                  src={current.photoUrl}
                  alt={current.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-200 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {getInitials(current.name)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-black text-zinc-950 truncate">
                    {current.name}
                  </h3>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                {current.locality && (
                  <p className="text-[11px] font-medium text-zinc-500 truncate">
                    {current.locality}
                  </p>
                )}
              </div>

              {/* SHOW 5-STAR RATING ONLY IF ACTUALLY GIVEN */}
              {current.rating === 5 && (
                <div
                  className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-full shrink-0"
                  aria-label="5 out of 5 stars"
                >
                  {[0, 1, 2, 3, 4].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className="w-3 h-3 fill-amber-400 text-amber-500"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* GENUINE REVIEW QUOTE (ONLY WHEN SUBMITTED IN GOOGLE SHEETS) */}
            {current.review ? (
              <blockquote className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed text-zinc-800 font-medium italic">
                &ldquo;{current.review}&rdquo;
              </blockquote>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 text-xs text-zinc-600 font-medium">
                Verified Stuvvy subscriber
                {current.deliveredCount > 0
                  ? ` with ${current.deliveredCount} confirmed meal ${
                      current.deliveredCount === 1 ? 'delivery' : 'deliveries'
                    }.`
                  : '.'}
              </div>
            )}

            {/* NON-OVERWRITTEN SUBSCRIPTION JOURNEY TRAIL */}
            {current.journeySteps.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Subscription Journey
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {current.journeySteps.map((step, i) => {
                    const isDelivered = step.toLowerCase().includes('delivered');
                    const isUpgrade = step.toLowerCase().includes('upgrade');
                    return (
                      <React.Fragment key={`${step}-${i}`}>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            isUpgrade
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-orange-50 text-orange-800 border-orange-200'
                          }`}
                        >
                          {step}
                        </span>
                        {i < current.journeySteps.length - 1 && (
                          <span className="text-zinc-400 text-xs font-bold">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-xs text-zinc-600 font-medium">
            Join real Stuvvy subscribers enjoying authentic South Indian homely meals.
          </div>
        )}

        {/* ROTATION CONTROLS (WHEN MULTIPLE CUSTOMERS EXIST) */}
        {total > 1 && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {testimonials.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View experience ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeIndex ? 'w-5 bg-zinc-950' : 'w-1.5 bg-zinc-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous customer"
                className="w-7 h-7 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next customer"
                className="w-7 h-7 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* CONTINUE TO REGISTRATION CTA */}
        <button
          type="button"
          onClick={onCloseAndContinue}
          className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Registration</span>
          <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
        </button>
      </div>
    </div>
  );
};

