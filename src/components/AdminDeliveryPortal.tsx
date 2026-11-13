'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Clock, Truck, 
  Search, Calendar, Filter, Phone, MessageSquare, RefreshCw, 
  MapPin, User, ChevronRight, Lock, Key, ArrowLeft, Plus,
  FileText, Sparkles, X, Check, FileSpreadsheet, Ban
} from 'lucide-react';
import { DeliveryLogItem } from '../app/api/admin/delivery-logs/route';

interface AdminDeliveryPortalProps {
  onBackToApp?: () => void;
}

export const AdminDeliveryPortal: React.FC<AdminDeliveryPortalProps> = ({ onBackToApp }) => {
  // Passcode authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('stuvvy_admin_auth') === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Data state
  const [logs, setLogs] = useState<DeliveryLogItem[]>([]);
  const [customerDetailsMap, setCustomerDetailsMap] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [selectedMealSession, setSelectedMealSession] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Issue modal state
  const [activeIssueLog, setActiveIssueLog] = useState<DeliveryLogItem | null>(null);
  const [issueReasonInput, setIssueReasonInput] = useState('');

  // Success toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Check Admin PIN (default 9344 or 1234)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '9344' || pinInput === '1234' || pinInput === 'STUVVY') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('stuvvy_admin_auth', 'true');
      }
      setPinError('');
    } else {
      setPinError('Invalid Admin Passcode. Please enter 9344 to verify.');
    }
  };

  // Fetch delivery logs + active customers so all 3 meals (Breakfast, Lunch, Dinner) are tracked per customer
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, custRes] = await Promise.all([
        fetch(`/api/admin/delivery-logs?date=${selectedDate}`, { cache: 'no-store' }),
        fetch('/api/customers', { cache: 'no-store' }).catch(() => null),
      ]);
      const data = await logsRes.json();
      const existingLogs: DeliveryLogItem[] = data.success && Array.isArray(data.logs) ? data.logs : [];

      // Merge any locally persisted logs for this date (ensures persistence even on serverless cold starts)
      let localLogsForDate: DeliveryLogItem[] = [];
      try {
        const rawLocal = localStorage.getItem('stuvvy_delivery_logs');
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal) as DeliveryLogItem[];
          if (Array.isArray(parsedLocal)) {
            localLogsForDate = parsedLocal.filter((l) => l.date === selectedDate);
          }
        }
      } catch {}

      const mergedById = new Map<string, DeliveryLogItem>();
      for (const l of existingLogs) {
        mergedById.set(l.id, l);
      }
      for (const l of localLogsForDate) {
        const prev = mergedById.get(l.id);
        if (!prev || new Date(l.updatedAt).getTime() >= new Date(prev.updatedAt).getTime()) {
          mergedById.set(l.id, l);
        }
      }
      const combinedExisting = Array.from(mergedById.values());

      let custList: Array<{
        name: string;
        mobileNo: string;
        plan?: string;
        address?: string;
        locality?: string;
        paymentAmount?: string;
        paymentStatus?: string;
        requestedMeals?: string[];
      }> = [];
      if (custRes && custRes.ok) {
        const custData = await custRes.json();
        if (custData?.success && Array.isArray(custData.customers)) {
          custList = custData.customers;
        }
      }

      // Map customer details and their opted meals from Google Sheets
      const customerMap = new Map<
        string,
        {
          name: string;
          mobile: string;
          plan: string;
          address: string;
          locality: string;
          paymentAmount?: string;
          paymentStatus?: string;
          requestedMeals?: string[];
        }
      >();

      for (const c of custList) {
        const mob = (c.mobileNo || '').replace(/\D/g, '').slice(-10);
        if (mob) {
          customerMap.set(mob, {
            name: c.name,
            mobile: mob,
            plan: c.plan || 'Monthly',
            address: c.address || '',
            locality: c.locality || '',
            paymentAmount: c.paymentAmount,
            paymentStatus: c.paymentStatus,
            requestedMeals: c.requestedMeals,
          });
        }
      }

      for (const l of existingLogs) {
        const mob = (l.customerMobile || '').replace(/\D/g, '').slice(-10);
        if (mob && !customerMap.has(mob)) {
          customerMap.set(mob, {
            name: l.customerName,
            mobile: mob,
            plan: l.planName,
            address: l.deliveryAddress,
            locality: l.locality || '',
          });
        }
      }

      const allSessions: Array<'Breakfast' | 'Lunch' | 'Dinner'> = ['Breakfast', 'Lunch', 'Dinner'];
      const mergedLogs: DeliveryLogItem[] = [];

      for (const [mob, info] of customerMap.entries()) {
        // ONLY show the meals the customer opted for in Google Sheets (default to all if not specified)
        const optedMeals =
          info.requestedMeals && info.requestedMeals.length > 0
            ? (info.requestedMeals.filter((m) =>
                allSessions.includes(m as any)
              ) as Array<'Breakfast' | 'Lunch' | 'Dinner'>)
            : allSessions;

        for (const session of optedMeals) {
          const found = combinedExisting.find(
            (l) =>
              (l.customerMobile || '').replace(/\D/g, '').slice(-10) === mob &&
              l.mealSession === session
          );
          if (found) {
            mergedLogs.push(found);
          } else {
            mergedLogs.push({
              id: `LOG-${selectedDate}-${mob}-${session.toLowerCase()}`,
              date: selectedDate,
              customerName: info.name,
              customerMobile: mob,
              planName: info.plan,
              deliveryAddress: info.address,
              locality: info.locality,
              mealSession: session,
              status: 'pending',
              markedBy: 'admin',
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      setCustomerDetailsMap(new Map(customerMap));
      setLogs(mergedLogs.length > 0 ? mergedLogs : combinedExisting);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, selectedDate]);

  // Update order delivery status
  const handleUpdateStatus = async (
    log: DeliveryLogItem, 
    newStatus: 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused',
    issueText?: string
  ) => {
    try {
      const payload: Partial<DeliveryLogItem> = {
        id: log.id,
        date: log.date || selectedDate,
        customerName: log.customerName,
        customerMobile: log.customerMobile,
        planName: log.planName,
        deliveryAddress: log.deliveryAddress,
        locality: log.locality,
        mealSession: log.mealSession,
        status: newStatus,
        issueReason: newStatus === 'not_received' ? (issueText || 'Customer reported order not received') : undefined,
        markedBy: 'admin'
      };

      const res = await fetch('/api/admin/delivery-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.log) {
        setLogs(prev => prev.map(item => item.id === log.id ? data.log : item));
        try {
          const rawLocal = localStorage.getItem('stuvvy_delivery_logs');
          const parsedLocal: DeliveryLogItem[] = rawLocal ? JSON.parse(rawLocal) : [];
          const idx = parsedLocal.findIndex((item) => item.id === data.log.id);
          if (idx >= 0) {
            parsedLocal[idx] = data.log;
          } else {
            parsedLocal.unshift(data.log);
          }
          localStorage.setItem('stuvvy_delivery_logs', JSON.stringify(parsedLocal));
          window.dispatchEvent(new Event('stuvvy-logs-updated'));
        } catch {}
        showToast(`Auto-saved "${newStatus.replace(/_/g, ' ').toUpperCase()}" to Excel for ${log.customerName}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update status. Please try again.');
    }
  };

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Meal session filter
      if (selectedMealSession !== 'All' && log.mealSession !== selectedMealSession) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'All' && log.status !== selectedStatusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (log.customerName || '').toLowerCase().includes(q);
        const matchesMobile = (log.customerMobile || '').includes(q);
        const matchesAddress = (log.deliveryAddress || '').toLowerCase().includes(q);
        const matchesLocality = (log.locality || '').toLowerCase().includes(q);
        if (!matchesName && !matchesMobile && !matchesAddress && !matchesLocality) {
          return false;
        }
      }
      return true;
    });
  }, [logs, selectedMealSession, selectedStatusFilter, searchQuery]);

  // Aggregate statistics
  const totalOrders = logs.length;
  const deliveredCount = logs.filter(l => l.status === 'delivered').length;
  const outForDeliveryCount = logs.filter(l => l.status === 'out_for_delivery').length;
  const pendingCount = logs.filter(l => l.status === 'pending').length;
  const notReceivedCount = logs.filter(l => l.status === 'not_received').length;

  const deliveredPercent = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

  // =========================================================================
  // 1. PIN AUTHENTICATION GATE
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-7 sm:p-9 max-w-md w-full shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-900 text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8 text-purple-200" />
          </div>

          <div>
            <span className="font-ostrich text-2xl tracking-widest text-purple-900 block">
              STUVVY KITCHEN ADMIN
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 mt-1">
              Delivery Logs & Dispatch Portal
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Authorized access only. Enter your Kitchen Admin PIN to verify delivery logs.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                placeholder="Enter 4-Digit Admin PIN (e.g. 9344)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                className="w-full text-center tracking-widest font-mono text-lg font-black px-4 py-3.5 bg-zinc-50 border-2 border-zinc-200 rounded-2xl outline-none focus:border-purple-600 focus:bg-white transition-all text-zinc-950"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-600 font-bold bg-red-50 py-2 px-3 rounded-xl border border-red-200">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-purple-900 hover:bg-purple-950 text-white font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Key className="w-4 h-4 text-purple-300" />
              <span>Unlock Dispatch Portal</span>
            </button>
          </form>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
            >
              ← Return to Stuvvy Customer App
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN ADMIN DELIVERY LOGS & DISPATCH BOARD
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none font-sans">
      
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-zinc-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-bounce border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: OSTRICH SANS TYPOGRAPHY WITH EMPHASIZED HIERARCHY */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-zinc-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-ostrich text-3xl sm:text-4xl text-purple-950 font-black tracking-wider leading-none">
              STUVVY KITCHEN DISPATCH
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
              Live Order Logs
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 mt-1 tracking-tight">
            Customer Meal Delivery Verification & Receipts
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Monitor real-time delivery logs, record customer handovers, and resolve delivery exceptions instantly.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center flex-wrap">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Auto-Saved to Excel</span>
          </div>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Customer App</span>
            </button>
          )}
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Scheduled */}
        <div className="bg-white/95 p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="font-ostrich text-xs text-zinc-400 tracking-wider block">TOTAL SCHEDULED</span>
          <div className="text-2xl font-black font-heading text-zinc-950 mt-1">
            {totalOrders} <span className="text-xs text-zinc-400 font-normal">Meals</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-0.5">Active Subscribers</div>
        </div>

        {/* Delivered */}
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs">
          <span className="font-ostrich text-xs text-emerald-800 tracking-wider block">DELIVERED & RECEIVED</span>
          <div className="text-2xl font-black font-heading text-emerald-950 mt-1 flex items-baseline gap-2">
            <span>{deliveredCount}</span>
            <span className="text-xs font-bold text-emerald-700">({deliveredPercent}%)</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Customer Confirmed</div>
        </div>

        {/* Out for Delivery */}
        <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200/90 shadow-2xs">
          <span className="font-ostrich text-xs text-purple-800 tracking-wider block">OUT FOR DELIVERY</span>
          <div className="text-2xl font-black font-heading text-purple-950 mt-1">
            {outForDeliveryCount}
          </div>
          <div className="text-[10px] text-purple-700 font-medium mt-0.5">With Delivery Rider</div>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="font-ostrich text-xs text-zinc-500 tracking-wider block">PENDING DISPATCH</span>
          <div className="text-2xl font-black font-heading text-zinc-900 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-0.5">In Kitchen Prep</div>
        </div>

        {/* Issues / Not Received */}
        <div className={`p-4 rounded-2xl border shadow-2xs col-span-2 lg:col-span-1 ${
          notReceivedCount > 0 ? 'bg-red-50 border-red-300 text-red-950' : 'bg-zinc-50 border-zinc-200/80 text-zinc-500'
        }`}>
          <span className={`font-ostrich text-xs tracking-wider block ${notReceivedCount > 0 ? 'text-red-700 font-black' : 'text-zinc-400'}`}>
            NOT RECEIVED / ISSUES
          </span>
          <div className={`text-2xl font-black font-heading mt-1 ${notReceivedCount > 0 ? 'text-red-700' : 'text-zinc-900'}`}>
            {notReceivedCount}
          </div>
          <div className={`text-[10px] font-medium mt-0.5 ${notReceivedCount > 0 ? 'text-red-600 font-bold' : 'text-zinc-400'}`}>
            {notReceivedCount > 0 ? 'Immediate Attention Required' : 'Zero Issues Reported'}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-zinc-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, mobile (+91), or address..."
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600 focus:bg-white transition-all text-zinc-950"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* DATE PICKER & MEAL SESSION */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-zinc-900 bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* Session buttons */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs font-bold">
              {(['All', 'Breakfast', 'Lunch', 'Dinner'] as const).map(session => (
                <button
                  key={session}
                  onClick={() => setSelectedMealSession(session)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedMealSession === session 
                      ? 'bg-purple-900 text-white shadow-xs' 
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {session}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STATUS FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-zinc-100 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 shrink-0">
            Filter Status:
          </span>

          {[
            { id: 'All', label: `All Orders (${logs.length})` },
            { id: 'delivered', label: `✓ Delivered (${deliveredCount})` },
            { id: 'out_for_delivery', label: `🚚 Out for Delivery (${outForDeliveryCount})` },
            { id: 'pending', label: `⏳ Pending (${pendingCount})` },
            { id: 'not_received', label: `⚠️ Not Received (${notReceivedCount})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatusFilter(pill.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedStatusFilter === pill.id
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOGS LIST (DESKTOP TABLE + MOBILE TOUCH CARDS)                         */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
            Showing {filteredLogs.length} of {totalOrders} customer delivery logs
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            Date: <strong className="text-zinc-900">{selectedDate}</strong>
          </span>
        </div>

        {loading ? (
          <div className="bg-white/95 rounded-3xl p-12 text-center border border-zinc-200 space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">Loading live customer delivery logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white/95 rounded-3xl p-12 text-center border border-zinc-200 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black font-heading text-zinc-900">No Delivery Logs Found</h3>
            <p className="text-xs text-zinc-500 font-medium">
              No orders matched your active filters for {selectedDate}. Try clearing the search or switching filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(
              filteredLogs.reduce((acc, log) => {
                const key = log.customerMobile || log.customerName;
                const list = acc.get(key) || [];
                list.push(log);
                acc.set(key, list);
                return acc;
              }, new Map<string, DeliveryLogItem[]>())
            ).map(([custKey, custLogs]) => {
              const primary = custLogs[0];
              const mealOrder: Record<string, number> = { Breakfast: 0, Lunch: 1, Dinner: 2 };
              const sortedMeals = [...custLogs].sort(
                (a, b) => (mealOrder[a.mealSession] ?? 9) - (mealOrder[b.mealSession] ?? 9)
              );

              return (
                <div
                  key={custKey}
                  className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4"
                >
                  {/* CUSTOMER HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-ostrich text-lg font-black text-purple-950 tracking-wider">
                          {primary.customerName}
                        </span>
                        <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200">
                          {primary.planName} Plan
                        </span>
                        {/* PAYMENT DISPLAY FROM GOOGLE SHEETS */}
                        {customerDetailsMap.get((primary.customerMobile || '').replace(/\D/g, '').slice(-10))?.paymentAmount && (
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                            Paid: ₹{customerDetailsMap.get((primary.customerMobile || '').replace(/\D/g, '').slice(-10))?.paymentAmount} ({customerDetailsMap.get((primary.customerMobile || '').replace(/\D/g, '').slice(-10))?.paymentStatus || 'PAID'})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 font-medium flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{primary.deliveryAddress}</span>
                      </p>
                    </div>

                    {/* QUICK CALL & WHATSAPP BUTTONS */}
                    <div className="flex items-center gap-1.5 bg-zinc-50 p-1 rounded-xl border border-zinc-200 shrink-0 self-start sm:self-center">
                      <a
                        href={`tel:+91${primary.customerMobile}`}
                        className="px-2.5 py-1.5 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 flex items-center gap-1 transition-all"
                        title="Call Customer"
                      >
                        <Phone className="w-3 h-3 text-orange-400" />
                        <span>+91 {primary.customerMobile}</span>
                      </a>
                      <a
                        href={`https://wa.me/91${primary.customerMobile}?text=${encodeURIComponent(
                          `Hi ${primary.customerName}, this is Stuvvy Kitchen regarding your ${primary.planName} meal delivery today.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 transition-all"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* SEPARATE 3-MEAL STATUS ROWS (BREAKFAST, LUNCH, DINNER) */}
                  <div className="space-y-2.5">
                    {sortedMeals.map((log) => {
                      const isDelivered = log.status === 'delivered';
                      const isOutForDelivery = log.status === 'out_for_delivery';
                      const isPending = log.status === 'pending';
                      const isNotReceived = log.status === 'not_received';

                      return (
                        <div
                          key={log.id}
                          className={`rounded-2xl border p-3 sm:px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all ${
                            isNotReceived
                              ? 'bg-red-50 border-red-200 text-red-950'
                              : isDelivered
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-zinc-50/70 border-zinc-200/80'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 min-w-[76px]">
                                {log.mealSession}
                              </span>

                              {isDelivered && (
                                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Delivered ({log.deliveredAt || 'Confirmed'})</span>
                                </span>
                              )}
                              {isOutForDelivery && (
                                <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-purple-700" />
                                  <span>Out for Delivery</span>
                                </span>
                              )}
                              {isPending && (
                                <span className="text-[10px] font-bold bg-white text-zinc-600 px-2.5 py-0.5 rounded-full border border-zinc-200 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-500" />
                                  <span>Pending</span>
                                </span>
                              )}
                              {isNotReceived && (
                                <span className="text-[10px] font-black uppercase bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span>Not Delivered</span>
                                </span>
                              )}
                              {log.status === 'paused' && (
                                <span className="text-[10px] font-black uppercase bg-zinc-200 text-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-300 flex items-center gap-1">
                                  <Ban className="w-3 h-3 text-zinc-600" />
                                  <span>Canceled</span>
                                </span>
                              )}
                            </div>

                            {log.issueReason && isNotReceived && (
                              <div className="text-[11px] text-red-700 font-semibold">
                                Reason: {log.issueReason}
                              </div>
                            )}
                          </div>

                          {/* PER-MEAL STATUS BUTTONS */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(log, 'delivered')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                isDelivered
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Delivered</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(log, 'out_for_delivery')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                isOutForDelivery
                                  ? 'bg-purple-900 text-white'
                                  : 'bg-white hover:bg-purple-100 text-purple-900 border border-purple-200'
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Out</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveIssueLog(log);
                                setIssueReasonInput(log.issueReason || '');
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                isNotReceived
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white hover:bg-red-100 text-red-800 border border-red-200'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Not Delivered</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(log, 'paused', 'Order paused or canceled by customer/admin')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                log.status === 'paused'
                                  ? 'bg-zinc-800 text-white'
                                  : 'bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Canceled</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. ISSUE / NOT RECEIVED MODAL                                             */}
      {/* ========================================================================= */}
      {activeIssueLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-7 border border-zinc-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading text-zinc-950">
                    Record Delivery Exception
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Order for <strong className="text-zinc-900">{activeIssueLog.customerName}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveIssueLog(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 font-medium">
              Specify why the meal was not received or any delivery obstacle encountered by the rider:
            </p>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Customer unreachable by phone',
                'Security denied entrance',
                'Door locked / Nobody home',
                'Wrong location / moved address',
                'Customer requested pause on door'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setIssueReasonInput(reason)}
                  className="text-[11px] px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-700 font-semibold cursor-pointer"
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={issueReasonInput}
              onChange={(e) => setIssueReasonInput(e.target.value)}
              placeholder="Enter exact details or action taken..."
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-red-500 resize-none text-zinc-950"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveIssueLog(null)}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(activeIssueLog, 'not_received', issueReasonInput);
                  setActiveIssueLog(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Save as Not Received
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

