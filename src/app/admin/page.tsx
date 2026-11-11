'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminDeliveryPortal } from '../../components/AdminDeliveryPortal';

export default function AdminPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-900 relative">
      {/* Background layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/stuvvy-bg-img.jpeg?v=2"
          alt="Stuvvy Background"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 py-6 sm:py-8">
        <AdminDeliveryPortal onBackToApp={() => router.push('/')} />
      </div>
    </main>
  );
}

