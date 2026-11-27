'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Clock, Truck, 
  Search, Calendar, Filter, Phone, MessageSquare, RefreshCw, 
  MapPin, User, ChevronRight, ChevronLeft, Lock, Key, ArrowLeft, Plus,
  FileText, Sparkles, X, Check, FileSpreadsheet, Ban, RotateCcw,
  BookOpen, ArrowRight, TrendingUp, Layers, Package
} from 'lucide-react';
import { DeliveryLogItem } from '../app/api/admin/delivery-logs/route';
import { parseDateFlexible, getPlanDurationDays } from '../utils/subscriptionUtils';

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
  const [showClosedPlans, setShowClosedPlans] = useState<boolean>(false);
  const [adminNavScreen, setAdminNavScreen] = useState<'dispatches' | 'customer-plans'>('dispatches');
  const [directorySearch, setDirectorySearch] = useState('');
  const [rawSubmissions, setRawSubmissions] = useState<any[]>([]);

  // Issue modal state
  const [activeIssueLog, setActiveIssueLog] = useState<DeliveryLogItem | null>(null);
  const [issueReasonInput, setIssueReasonInput] = useState('');

  // Success toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Instant full CSV export with BOM so Excel opens with all customer data perfectly
  const handleExportCsv = (e: React.MouseEvent) => {
    e.preventDefault();
    const candidateLogs = targetQueueLogs.length > 0 ? targetQueueLogs : logs;
    const dateLogs = candidateLogs.filter((l) => l.date === selectedDate);
    const exportData = dateLogs.length > 0 ? dateLogs : candidateLogs;

    if (exportData.length === 0) {
      showToast('No customer orders found to export for ' + selectedDate);
      return;
    }

    const headers = [
      'CUSTOMER NAME',
      'DATE',
      'STATUS',
      'MOBILE NUMBER',
      'SUBSCRIPTION PLAN',
      'MEAL SESSION',
      'DELIVERY ADDRESS',
      'DELIVERED TIME',
      'DELIVERY / ISSUE NOTE'
    ];

    const escapeCsv = (val?: string) => {
      if (!val) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = exportData.map((l) => {
      let statusFormatted = 'PENDING';
      if (l.status === 'delivered') statusFormatted = 'DELIVERED';
      else if (l.status === 'not_received') statusFormatted = 'NOT DELIVERED';
      else if (l.status === 'paused') statusFormatted = 'CANCELED';
      else if (l.status === 'out_for_delivery') statusFormatted = 'OUT FOR DELIVERY';

      return [
        escapeCsv(l.customerName),
        escapeCsv(l.date || selectedDate),
        escapeCsv(statusFormatted),
        escapeCsv(l.customerMobile),
        escapeCsv(l.planName),
        escapeCsv(l.mealSession),
        escapeCsv(l.deliveryAddress),
        escapeCsv(l.deliveredAt || '-'),
        escapeCsv(l.issueReason || l.recipientNote || '-')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Stuvvy_Delivery_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${exportData.length} delivery records to Excel`);
  };

  // Instant export of Customer Plans Directory to Excel CSV
  const handleExportPlansCsv = () => {
    if (filteredDirectory.length === 0) {
      showToast('No customer plans to export');
      return;
    }

    const headers = [
      'CUSTOMER NAME',
      'MOBILE NUMBER',
      'CURRENT PLAN',
      'PAID STATUS',
      'PAID AMOUNT',
      'START DATE',
      'END DATE',
      'DURATION (DAYS)',
      'PAST PLANS / UPGRADES'
    ];

    const escapeCsv = (val?: string) => {
      if (!val) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = filteredDirectory.map((item) => {
      const pastPlansStr =
        item.previousPlans && item.previousPlans.length > 0
          ? item.previousPlans.map((p) => `${p.name} (${p.startDate || ''})`).join(' -> ')
          : item.isUpgraded
          ? 'Upgraded'
          : 'None (Direct Plan)';

      return [
        escapeCsv(item.name),
        escapeCsv(item.mobile),
        escapeCsv(item.currentPlan.name),
        escapeCsv(item.currentPlan.paymentStatus || 'Paid'),
        escapeCsv(item.currentPlan.paymentAmount || '-'),
        escapeCsv(item.currentPlan.startDate),
        escapeCsv(item.currentPlan.endDate),
        escapeCsv(String(item.currentPlan.durationDays || 30)),
        escapeCsv(pastPlansStr),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Stuvvy_Customer_Plans_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredDirectory.length} customer plan records to Excel`);
  };

  // Quick Date Navigation Helpers
  const handlePrevDay = () => {
    const d = parseDateFlexible(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  };

  const handleNextDay = () => {
    const d = parseDateFlexible(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  };

  const handleToday = () => {
    const now = new Date();
    setSelectedDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  };

  const formattedDateDisplay = useMemo(() => {
    try {
      const d = parseDateFlexible(selectedDate);
      const now = new Date();
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      const formatted = d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      return isToday ? `Today • ${formatted}` : formatted;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Check Admin PIN (8825)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '8825') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('stuvvy_admin_auth', 'true');
      }
      setPinError('');
    } else {
      setPinError('Invalid Admin Passcode. Please enter 8825 to verify.');
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

      let allPlanSubmissions: any[] = [];
      if (custRes && custRes.ok) {
        const custData = await custRes.json();
        if (custData?.success) {
          allPlanSubmissions = Array.isArray(custData.allSubmissions) && custData.allSubmissions.length > 0
            ? custData.allSubmissions
            : (Array.isArray(custData.customers) ? custData.customers : []);
        }
      }

      // Helper to generate unique key combining customer name and 10-digit mobile number
      const makeCustKey = (name?: string, mobile?: string) => {
        const n = (name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const m = (mobile || '').replace(/\D/g, '').slice(-10);
        return `${n}_${m}`;
      };

      // Helper to generate unique plan key so every plan subscription is tracked separately (even when upgraded)
      const makePlanKey = (name?: string, mobile?: string, plan?: string, startDate?: string, sNo?: number | string) => {
        const custKey = makeCustKey(name, mobile);
        const p = (plan || 'plan').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const d = (startDate || '').replace(/\D/g, '') || String(sNo || '');
        return `${custKey}_${p}_${d}`;
      };

      // Map plan details and their opted meals from Google Sheets
      const customerMap = new Map<
        string,
        {
          planKey: string;
          customerKey: string;
          name: string;
          mobile: string;
          plan: string;
          address: string;
          locality: string;
          paymentAmount?: string;
          paymentStatus?: string;
          orderStatus?: string;
          startDate?: string;
          isClosed?: boolean;
          closeReason?: string;
          closeReasonTag?: string;
          isUpcoming?: boolean;
          upcomingReason?: string;
          requestedMeals?: string[];
        }
      >();

      for (let idx = 0; idx < allPlanSubmissions.length; idx++) {
        const c = allPlanSubmissions[idx];
        const mob = (c.mobileNo || '').replace(/\D/g, '').slice(-10);
        if (!mob) continue;
        const custKey = makeCustKey(c.name, mob);
        const planKey = makePlanKey(c.name, mob, c.plan, c.startDate, c.sNo || idx);

        const rawOrderStatus = (c.orderStatus || '').trim().toLowerCase();
        const isExplicitlyClosed =
          rawOrderStatus.includes('closed') ||
          rawOrderStatus === 'delivered' ||
          rawOrderStatus === 'completed' ||
          rawOrderStatus === 'expired' ||
          rawOrderStatus === 'inactive';

        // Automatic Plan Date Check:
        // Daily = 1 day, Weekly = 7 days, Monthly = 30 days
        const duration = getPlanDurationDays(c.plan);
        const startDateObj = parseDateFlexible(c.startDate);
        startDateObj.setHours(0, 0, 0, 0);

        // The last active day of the customer's subscription
        const lastActiveDate = new Date(
          startDateObj.getFullYear(),
          startDateObj.getMonth(),
          startDateObj.getDate() + duration - 1
        );
        lastActiveDate.setHours(23, 59, 59, 999);

        const selDateObj = parseDateFlexible(selectedDate);
        selDateObj.setHours(0, 0, 0, 0);

        // If the selected dispatch date is strictly after the plan's end date, the plan has ended!
        const isDateExpired = selDateObj.getTime() > lastActiveDate.getTime();
        const isUpcoming = selDateObj.getTime() < startDateObj.getTime();
        const isClosed = isExplicitlyClosed || isDateExpired;

        let closeReason = 'This plan is closed & fully delivered. No kitchen dispatch required.';
        let closeReasonTag = 'Plan Closed';

        if (isExplicitlyClosed && (c.subscriberType?.toLowerCase().includes('upgrad') || c.previousPlan)) {
          closeReason = 'This plan was upgraded to a new plan. No dispatch required for this old plan.';
          closeReasonTag = 'Completed / Upgraded';
        } else if (duration === 1) {
          closeReason = `This 1-day Daily Plan ended on ${lastActiveDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. No active dispatch required today.`;
          closeReasonTag = '1-Day Plan Closed';
        } else if (isDateExpired) {
          closeReason = `This ${duration}-day ${c.plan || ''} Plan ended on ${lastActiveDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Plan duration completed.`;
          closeReasonTag = `Plan Ended (${lastActiveDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`;
        } else if (isExplicitlyClosed) {
          closeReason = `Plan marked as Closed in Google Sheets.`;
          closeReasonTag = 'Plan Closed';
        }

        const upcomingReason = isUpcoming
          ? `Plan begins on ${c.startDate || 'scheduled date'}. No delivery required for ${selectedDate}.`
          : undefined;

        customerMap.set(planKey, {
          planKey,
          customerKey: custKey,
          name: c.name,
          mobile: mob,
          plan: c.plan || 'Monthly',
          address: c.address || '',
          locality: c.locality || '',
          paymentAmount: c.paymentAmount,
          paymentStatus: c.paymentStatus,
          orderStatus: c.orderStatus,
          startDate: c.startDate,
          isClosed,
          closeReason,
          closeReasonTag,
          isUpcoming,
          upcomingReason,
          requestedMeals: c.requestedMeals,
        });
      }

      // Avoid duplicate customer cards from existingLogs if the customer is already in customerMap from Google Sheets
      const existingMobileSet = new Set(Array.from(customerMap.values()).map(c => c.mobile));
      for (const l of existingLogs) {
        const mob = (l.customerMobile || '').replace(/\D/g, '').slice(-10);
        if (!mob || existingMobileSet.has(mob)) continue;
        const custKey = makeCustKey(l.customerName, mob);
        const planKey = `OFFLINE_${custKey}_${(l.planName || 'PLAN').toUpperCase()}`;
        if (!customerMap.has(planKey)) {
          customerMap.set(planKey, {
            planKey,
            customerKey: custKey,
            name: l.customerName,
            mobile: mob,
            plan: l.planName || 'Monthly',
            address: l.deliveryAddress,
            locality: l.locality || '',
            isClosed: false,
          });
          existingMobileSet.add(mob);
        }
      }

      const allSessions: Array<'Breakfast' | 'Lunch' | 'Dinner'> = ['Breakfast', 'Lunch', 'Dinner'];
      const mergedLogs: DeliveryLogItem[] = [];

      for (const [planKey, info] of customerMap.entries()) {
        const cleanNameSlug = (info.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanPlanSlug = (info.plan || 'plan').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        // Respect the meals the customer opted for in Google Sheets (e.g. Breakfast, Lunch, Dinner)
        const optedMeals =
          info.requestedMeals && info.requestedMeals.length > 0
            ? (info.requestedMeals.filter((m) =>
                allSessions.includes(m as any)
              ) as Array<'Breakfast' | 'Lunch' | 'Dinner'>)
            : allSessions;

        for (const session of optedMeals) {
          const found = combinedExisting.find((l) => {
            const lMob = (l.customerMobile || '').replace(/\D/g, '').slice(-10);
            const lCustKey = makeCustKey(l.customerName, lMob);
            const sameCust = (lMob === info.mobile) || (lCustKey === info.customerKey);
            if (!sameCust) return false;
            if (l.mealSession !== session) return false;
            if ((l as any).planKey && (l as any).planKey === planKey) return true;
            if (l.planName && info.plan && l.planName.trim().toLowerCase() === info.plan.trim().toLowerCase()) return true;
            return true;
          });

          if (found) {
            mergedLogs.push({
              ...found,
              id: found.id || `LOG-${selectedDate}-${cleanNameSlug}-${info.mobile}-${session.toLowerCase()}-${cleanPlanSlug}`,
              planKey,
              customerName: info.name,
              customerMobile: info.mobile,
              planName: info.plan,
              deliveryAddress: info.address || found.deliveryAddress,
              locality: info.locality || found.locality,
              mealSession: session,
            });
          } else {
            mergedLogs.push({
              id: `LOG-${selectedDate}-${cleanNameSlug}-${info.mobile}-${session.toLowerCase()}-${cleanPlanSlug}`,
              planKey,
              date: selectedDate,
              customerName: info.name,
              customerMobile: info.mobile,
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
      setRawSubmissions(allPlanSubmissions);
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

  // Update order delivery status - completely changeable and reversible
  const handleUpdateStatus = async (
    log: DeliveryLogItem, 
    newStatus: 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused',
    issueText?: string
  ) => {
    try {
      // Reversible toggle: if operator clicks the status that is already active, toggle back to 'pending'!
      const targetStatus: 'delivered' | 'out_for_delivery' | 'pending' | 'not_received' | 'paused' =
        log.status === newStatus ? 'pending' : newStatus;

      // Capture the exact real-time clock from admin's device right at the moment they mark it
      const realTimeNow = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()).toUpperCase();

      const deliveredAtTime = targetStatus === 'delivered' ? (log.deliveredAt || realTimeNow) : undefined;
      const issueReasonText = targetStatus === 'not_received' ? (issueText || 'Customer reported order not received') : undefined;

      const payload: Partial<DeliveryLogItem> = {
        id: log.id,
        date: log.date || selectedDate,
        customerName: log.customerName,
        customerMobile: log.customerMobile,
        planName: log.planName,
        deliveryAddress: log.deliveryAddress,
        locality: log.locality,
        mealSession: log.mealSession,
        status: targetStatus,
        deliveredAt: deliveredAtTime,
        issueReason: issueReasonText,
        markedBy: 'admin'
      };

      // Optimistic update so UI reflects real-time delivered timestamp or reversal instantly
      const optimisticLog: DeliveryLogItem = {
        ...log,
        status: targetStatus,
        deliveredAt: deliveredAtTime,
        issueReason: issueReasonText,
        updatedAt: new Date().toISOString(),
      };
      setLogs((prev) => prev.map((item) => (item.id === log.id ? optimisticLog : item)));

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

        if (targetStatus === 'pending') {
          showToast(`Reverted ${log.customerName} (${log.mealSession}) back to PENDING`);
        } else {
          showToast(`Saved "${targetStatus.replace(/_/g, ' ').toUpperCase()}" for ${log.customerName}`);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update status. Please try again.');
    }
  };

  const getLogPlanKey = (l: DeliveryLogItem) => {
    if ((l as any).planKey) return (l as any).planKey;
    const mob = (l.customerMobile || '').replace(/\D/g, '').slice(-10);
    for (const [pKey, details] of customerDetailsMap.entries()) {
      if (details.mobile === mob) {
        if (!l.planName || details.plan.toLowerCase() === l.planName.toLowerCase()) {
          return pKey;
        }
      }
    }
    return `${l.customerName}_${mob}_${l.planName}`;
  };

  // Categorize logs into active queue vs closed plans
  const closedLogs = useMemo(() => {
    return logs.filter((l) => {
      const pKey = getLogPlanKey(l);
      return customerDetailsMap.get(pKey)?.isClosed;
    });
  }, [logs, customerDetailsMap]);

  const activeLogs = useMemo(() => {
    return logs.filter((l) => {
      const pKey = getLogPlanKey(l);
      return !customerDetailsMap.get(pKey)?.isClosed;
    });
  }, [logs, customerDetailsMap]);

  // Count by number of distinct plans (NOT multiplied by meal sessions!)
  const activePlansCount = useMemo(() => {
    return new Set(activeLogs.map((l) => getLogPlanKey(l))).size;
  }, [activeLogs]);

  const closedPlansCount = useMemo(() => {
    return new Set(closedLogs.map((l) => getLogPlanKey(l))).size;
  }, [closedLogs]);

  // The base set of logs for calculating counts on the current view queue:
  const targetQueueLogs = showClosedPlans ? closedLogs : activeLogs;

  const deliveredCount = targetQueueLogs.filter(l => l.status === 'delivered').length;
  const outForDeliveryCount = targetQueueLogs.filter(l => l.status === 'out_for_delivery').length;
  const pendingCount = targetQueueLogs.filter(l => l.status === 'pending').length;
  const canceledCount = targetQueueLogs.filter(l => l.status === 'paused').length;
  const notReceivedCount = targetQueueLogs.filter(l => l.status === 'not_received').length;

  const deliveredPercent = targetQueueLogs.length > 0 ? Math.round((deliveredCount / targetQueueLogs.length) * 100) : 0;

  // Filtered logs calculation (strictly honors active queue vs closed plans, plus search)
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const pKey = getLogPlanKey(log);
      const planDetails = customerDetailsMap.get(pKey);
      const isClosed = !!planDetails?.isClosed;

      // Exclude closed plans when viewing active queue, and exclude active plans when viewing closed plans
      if (!showClosedPlans && isClosed) return false;
      if (showClosedPlans && !isClosed) return false;

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
        const matchesPlan = (log.planName || '').toLowerCase().includes(q);
        const matchesSession = (log.mealSession || '').toLowerCase().includes(q);
        const matchesStatus = (log.status || '').toLowerCase().includes(q);
        if (!matchesName && !matchesMobile && !matchesAddress && !matchesLocality && !matchesPlan && !matchesSession && !matchesStatus) {
          return false;
        }
      }
      return true;
    });
  }, [logs, selectedMealSession, selectedStatusFilter, searchQuery, showClosedPlans, customerDetailsMap]);

  const totalOrders = logs.length;

  // Assemble horizontal directory of all plans with previous plan / upgrade tracking
  const allPlansDirectory = useMemo(() => {
    const customerGroups = new Map<string, any[]>();

    const makeKey = (name?: string, mobile?: string) => {
      const mob = (mobile || '').replace(/\D/g, '').slice(-10);
      if (mob) return mob;
      return (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    // 1. Group raw submissions
    for (const sub of rawSubmissions) {
      const key = makeKey(sub.name, sub.mobileNo);
      if (!key) continue;
      const list = customerGroups.get(key) || [];
      list.push(sub);
      customerGroups.set(key, list);
    }

    // 2. Fallback to customerDetailsMap if rawSubmissions is empty or missing a customer
    for (const info of customerDetailsMap.values()) {
      const key = makeKey(info.name, info.mobile);
      if (!key) continue;
      if (!customerGroups.has(key)) {
        customerGroups.set(key, [{
          name: info.name,
          mobileNo: info.mobile,
          plan: info.plan,
          startDate: info.startDate,
          address: info.address,
          locality: info.locality,
          paymentAmount: info.paymentAmount,
          paymentStatus: info.paymentStatus,
          orderStatus: info.orderStatus,
          requestedMeals: info.requestedMeals,
        }]);
      }
    }

    const result: Array<{
      customerKey: string;
      name: string;
      mobile: string;
      address: string;
      locality: string;
      currentPlan: {
        name: string;
        startDate: string;
        endDate: string;
        durationDays: number;
        status: 'Active' | 'Closed' | 'Upcoming';
        paymentStatus: string;
        paymentAmount: string;
        requestedMeals: string[];
      };
      isUpgraded: boolean;
      previousPlans: Array<{
        name: string;
        startDate?: string;
        endDate?: string;
        durationDays?: number;
        status: string;
      }>;
    }> = [];

    for (const [key, list] of customerGroups.entries()) {
      // Sort submissions chronologically
      const sorted = [...list].sort((a, b) => {
        const sA = Number(a.sNo || 0);
        const sB = Number(b.sNo || 0);
        if (sA && sB) return sA - sB;
        const dA = parseDateFlexible(a.startDate).getTime();
        const dB = parseDateFlexible(b.startDate).getTime();
        return dA - dB;
      });

      // Latest active plan is current plan (prioritize active over closed)
      const currentSub = sorted.slice().reverse().find(s => {
        const st = (s.orderStatus || '').toLowerCase();
        return !st.includes('closed') && !st.includes('inactive');
      }) || sorted[sorted.length - 1];

      const priorSubs = sorted.filter(s => s !== currentSub);

      const planName = currentSub.plan || 'Monthly Plan';
      const duration = getPlanDurationDays(planName);
      const startObj = parseDateFlexible(currentSub.startDate);
      const endObj = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate() + duration - 1);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rawOrderStatus = (currentSub.orderStatus || '').toLowerCase();
      let currentStatus: 'Active' | 'Closed' | 'Upcoming' = 'Active';
      if (rawOrderStatus.includes('closed') || rawOrderStatus.includes('inactive') || today.getTime() > endObj.getTime()) {
        currentStatus = 'Closed';
      } else if (today.getTime() < startObj.getTime()) {
        currentStatus = 'Upcoming';
      }

      const isUpgraded =
        priorSubs.length > 0 ||
        Boolean(currentSub.previousPlan) ||
        (currentSub.subscriberType || '').toLowerCase().includes('upgrad');

      const previousPlansList: Array<{
        name: string;
        startDate?: string;
        endDate?: string;
        durationDays?: number;
        status: string;
      }> = [];

      for (const p of priorSubs) {
        const pDuration = getPlanDurationDays(p.plan);
        const pStart = parseDateFlexible(p.startDate);
        const pEnd = new Date(pStart.getFullYear(), pStart.getMonth(), pStart.getDate() + pDuration - 1);
        previousPlansList.push({
          name: p.plan || 'Daily / Previous Plan',
          startDate: p.startDate,
          endDate: pEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          durationDays: pDuration,
          status: 'Upgraded & Completed',
        });
      }

      if (currentSub.previousPlan && previousPlansList.length === 0) {
        previousPlansList.push({
          name: currentSub.previousPlan,
          status: 'Previous Plan (Upgraded)',
        });
      }

      result.push({
        customerKey: key,
        name: currentSub.name || 'Subscriber',
        mobile: (currentSub.mobileNo || '').replace(/\D/g, '').slice(-10),
        address: currentSub.address || '',
        locality: currentSub.locality || '',
        currentPlan: {
          name: planName,
          startDate: currentSub.startDate || startObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          endDate: endObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          durationDays: duration,
          status: currentStatus,
          paymentStatus: currentSub.paymentStatus || 'Paid',
          paymentAmount: currentSub.paymentAmount || '',
          requestedMeals: currentSub.requestedMeals || ['Breakfast', 'Lunch', 'Dinner'],
        },
        isUpgraded,
        previousPlans: previousPlansList,
      });
    }

    return result;
  }, [rawSubmissions, customerDetailsMap]);

  const filteredDirectory = useMemo(() => {
    return allPlansDirectory.filter(item => {
      if (directorySearch.trim()) {
        const q = directorySearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesMob = item.mobile.includes(q);
        const matchesPlan = item.currentPlan.name.toLowerCase().includes(q);
        const matchesPrev = item.previousPlans.some(p => p.name.toLowerCase().includes(q));
        const matchesLoc = item.locality.toLowerCase().includes(q) || item.address.toLowerCase().includes(q);
        return matchesName || matchesMob || matchesPlan || matchesPrev || matchesLoc;
      }
      return true;
    });
  }, [allPlansDirectory, directorySearch]);

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
            <span className="font-heading text-xl sm:text-2xl font-black text-purple-950 tracking-tight block">
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
                placeholder="Enter 4-Digit Admin PIN"
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

      {/* SEPARATE SCREEN NAVIGATION TABS */}
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-zinc-200/90 shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setAdminNavScreen('dispatches')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            adminNavScreen === 'dispatches'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Daily Delivery Dispatches</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminNavScreen('customer-plans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            adminNavScreen === 'customer-plans'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Customer Plans</span>
          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
            adminNavScreen === 'customer-plans' ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-900'
          }`}>
            {allPlansDirectory.length}
          </span>
        </button>
      </div>

      {adminNavScreen === 'customer-plans' ? (
        /* DEDICATED SEPARATE SCREEN: CUSTOMER PLANS */
        <div className="space-y-6">
          {/* TOP SUMMARY CARD (STYLED EXACTLY LIKE DELIVERY LOGS IN USER PAGE) */}
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4 text-left">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-zinc-950 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-700" />
                  <span>Customer Plans</span>
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Locate all customer plans, past and current plans, paid status for current plan, contact number, and dates.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                <button
                  type="button"
                  onClick={handleExportPlansCsv}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title="Export all customer plans and upgrade history to Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Plans Excel</span>
                </button>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
                  {allPlansDirectory.length} Total Customers
                </span>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search by customer name, phone number (+91), or plan..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600 focus:bg-white transition-all text-zinc-950"
              />
              {directorySearch && (
                <button
                  onClick={() => setDirectorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* LIST OF SUBSCRIBERS (DELIVERY LOGS STYLE) */}
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-left">
              <div>
                <h3 className="text-base font-black font-heading text-zinc-950">
                  Subscriber Plan Records
                </h3>
                <p className="text-xs text-zinc-500">
                  Showing {filteredDirectory.length} of {allPlansDirectory.length} records.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs text-zinc-500 font-bold">Loading customer plans...</p>
              </div>
            ) : filteredDirectory.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-black text-zinc-900">No Customers Found</h3>
                <p className="text-xs text-zinc-500">Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDirectory.map((item, idx) => (
                  <div
                    key={item.customerKey || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white hover:bg-zinc-50/70 transition-all text-left flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* 1. NAME & NUMBER */}
                    <div className="space-y-1 min-w-[200px]">
                      <div className="text-base font-black font-heading text-zinc-950">
                        {item.name}
                      </div>
                      <a
                        href={`tel:${item.mobile}`}
                        className="text-xs font-mono font-bold text-purple-700 flex items-center gap-1.5 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>+91 {item.mobile}</span>
                      </a>
                    </div>

                    {/* 2. CURRENT PLAN & PAID STATUS (ONLY FOR CURRENT PLAN) */}
                    <div className="space-y-1 min-w-[190px]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Current Plan
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-purple-950 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200">
                          {item.currentPlan.name}
                        </span>
                        {/* Paid status ONLY for current plan */}
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          (item.currentPlan.paymentStatus || '').toLowerCase().includes('paid')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{item.currentPlan.paymentStatus || 'Paid'}</span>
                          {item.currentPlan.paymentAmount && (
                            <span className="font-mono">({item.currentPlan.paymentAmount.includes('₹') ? '' : '₹'}{item.currentPlan.paymentAmount})</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 3. DATES */}
                    <div className="space-y-1 min-w-[190px]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Date
                      </div>
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span>{item.currentPlan.startDate} ➔ {item.currentPlan.endDate}</span>
                      </div>
                    </div>

                    {/* 4. PAST PLANS (HORIZONTAL) */}
                    <div className="space-y-1 flex-1 lg:max-w-md">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Past Plans
                      </div>
                      {item.previousPlans && item.previousPlans.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.previousPlans.map((prev, pIdx) => (
                            <React.Fragment key={pIdx}>
                              <div className="inline-flex items-center gap-1 text-[11px] bg-zinc-100 border border-zinc-200 text-zinc-700 px-2.5 py-1 rounded-lg font-bold">
                                <span>{prev.name}</span>
                                {prev.startDate && (
                                  <span className="text-[9.5px] text-zinc-400 font-mono">({prev.startDate})</span>
                                )}
                                <span className="text-[8.5px] uppercase tracking-wider bg-zinc-200 text-zinc-600 px-1 py-0.2 rounded font-black">
                                  Past
                                </span>
                              </div>
                              {pIdx < item.previousPlans.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : item.isUpgraded ? (
                        <span className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg inline-block">
                          Upgraded from Previous Plan
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">
                          None (Direct Plan)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* TOP HEADER: NORMAL STUVVY HEADING TYPOGRAPHY */}
          <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-zinc-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-heading text-2xl sm:text-3xl text-purple-950 font-black tracking-tight leading-none">
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
          {/* EXCEL EXPORT DIRECT DOWNLOAD */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Download Excel / CSV Dispatch Sheet for this date"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* MANUAL REFRESH BUTTON */}
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchLogs();
            }}
            disabled={refreshing}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-bold text-xs px-3 py-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh logs from Google Sheets & server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

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

      {/* STATS OVERVIEW CARDS (6-CARD COMPREHENSIVE DISPATCH GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Scheduled */}
        <div className="bg-white/95 p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            TOTAL SCHEDULED
          </span>
          <div className="text-2xl font-black font-heading text-zinc-950 mt-1">
            {showClosedPlans ? closedPlansCount : activePlansCount} <span className="text-xs text-zinc-400 font-normal">Plans ({targetQueueLogs.length} Meals)</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
            {showClosedPlans ? 'Closed Plans' : 'Active Queue'}
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            DELIVERED
          </span>
          <div className="text-2xl font-black font-heading text-emerald-950 mt-1 flex items-baseline gap-1.5">
            <span>{deliveredCount}</span>
            <span className="text-xs font-bold text-emerald-700">({deliveredPercent}%)</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Customer Confirmed</div>
        </div>

        {/* Out for Delivery */}
        <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200/90 shadow-2xs">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
            OUT FOR DELIVERY
          </span>
          <div className="text-2xl font-black font-heading text-purple-950 mt-1">
            {outForDeliveryCount}
          </div>
          <div className="text-[10px] text-purple-700 font-medium mt-0.5">With Delivery Rider</div>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            PENDING
          </span>
          <div className="text-2xl font-black font-heading text-zinc-900 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-0.5">In Kitchen Prep</div>
        </div>

        {/* Canceled / Paused */}
        <div className="bg-zinc-100/90 p-4 rounded-2xl border border-zinc-300 shadow-2xs">
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">
            CANCELED
          </span>
          <div className="text-2xl font-black font-heading text-zinc-900 mt-1">
            {canceledCount}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium mt-0.5">Order Paused</div>
        </div>

        {/* Issues / Not Received */}
        <div className={`p-4 rounded-2xl border shadow-2xs ${
          notReceivedCount > 0 ? 'bg-red-50 border-red-300 text-red-950' : 'bg-zinc-50 border-zinc-200/80 text-zinc-500'
        }`}>
          <span className={`font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${notReceivedCount > 0 ? 'text-red-700 font-black' : 'text-zinc-500'}`}>
            NOT RECEIVED
          </span>
          <div className={`text-2xl font-black font-heading mt-1 ${notReceivedCount > 0 ? 'text-red-700' : 'text-zinc-900'}`}>
            {notReceivedCount}
          </div>
          <div className={`text-[10px] font-medium mt-0.5 ${notReceivedCount > 0 ? 'text-red-600 font-bold' : 'text-zinc-400'}`}>
            {notReceivedCount > 0 ? 'Attention Needed' : 'Zero Issues'}
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
              placeholder="Search by customer name, mobile (+91), plan, meal, or address..."
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
            {/* QUICK DATE CONTROLS: PREV, DATE PICKER, NEXT, TODAY */}
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl p-1">
              <button
                type="button"
                onClick={handlePrevDay}
                title="Previous Day"
                className="w-7 h-7 rounded-lg hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-zinc-900 bg-transparent outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                title="Next Day"
                className="w-7 h-7 rounded-lg hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToday}
                className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors cursor-pointer"
              >
                Today
              </button>
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

        {/* STATUS FILTER PILLS & ACTIVE/CLOSED TOGGLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 shrink-0">
              Filter Status:
            </span>

            {[
              { id: 'All', label: `All Orders (${targetQueueLogs.length})` },
              { id: 'delivered', label: `✓ Delivered (${deliveredCount})` },
              { id: 'out_for_delivery', label: `🚚 Out for Delivery (${outForDeliveryCount})` },
              { id: 'pending', label: `⏳ Pending (${pendingCount})` },
              { id: 'paused', label: `🚫 Canceled (${canceledCount})` },
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

          {/* ACTIVE DISPATCHES VS CLOSED PLANS TOGGLE */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                setShowClosedPlans(false);
                setSelectedStatusFilter('All');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                !showClosedPlans
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Active Queue ({activePlansCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setShowClosedPlans(true);
                setSelectedStatusFilter('All');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                showClosedPlans
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Closed Plans ({closedPlansCount})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOGS LIST (DESKTOP TABLE + MOBILE TOUCH CARDS)                         */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
            Showing {new Set(filteredLogs.map(l => getLogPlanKey(l))).size} of {showClosedPlans ? closedPlansCount : activePlansCount} {showClosedPlans ? 'closed' : 'active'} delivery plans
          </span>
          <span className="text-xs text-zinc-500 font-bold flex items-center gap-1.5">
            <span>Dispatch Date:</span>
            <strong className="text-zinc-950 font-black bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200">
              {formattedDateDisplay}
            </strong>
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
                const key = getLogPlanKey(log);
                const list = acc.get(key) || [];
                const existingIdx = list.findIndex(item => item.mealSession === log.mealSession);
                if (existingIdx >= 0) {
                  if (log.status !== 'pending' && list[existingIdx].status === 'pending') {
                    list[existingIdx] = log;
                  }
                } else {
                  list.push(log);
                }
                acc.set(key, list);
                return acc;
              }, new Map<string, DeliveryLogItem[]>())
            ).map(([planKey, custLogs]) => {
              const primary = custLogs[0];
              const mealOrder: Record<string, number> = { Breakfast: 0, Lunch: 1, Dinner: 2 };
              const sortedMeals = [...custLogs].sort(
                (a, b) => (mealOrder[a.mealSession] ?? 9) - (mealOrder[b.mealSession] ?? 9)
              );
              const custDetails = customerDetailsMap.get(planKey);

              return (
                <div
                  key={planKey}
                  className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4"
                >
                  {/* CUSTOMER HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-heading text-base sm:text-lg font-black text-zinc-950 tracking-tight">
                          {primary.customerName}
                        </span>
                        <span className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200">
                          {primary.planName} Plan
                        </span>
                        {/* PAYMENT DISPLAY FROM GOOGLE SHEETS */}
                        {custDetails?.paymentAmount && (
                          <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                            Paid: ₹{custDetails.paymentAmount} ({custDetails.paymentStatus || 'PAID'})
                          </span>
                        )}
                        {/* CLOSED OR UPCOMING PLAN BADGE */}
                        {custDetails?.isClosed && (
                          <span className="text-[10px] font-black uppercase bg-zinc-200 text-zinc-700 border border-zinc-300 px-2.5 py-0.5 rounded-md">
                            ✓ Plan Closed ({custDetails.closeReasonTag || 'Completed'})
                          </span>
                        )}
                        {custDetails?.isUpcoming && (
                          <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md">
                            ⏱ Starts {custDetails.startDate}
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
                    {custDetails?.isClosed ? (
                      <div className="bg-zinc-100/90 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-600 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{custDetails?.closeReason || 'This plan is closed & fully delivered. No kitchen dispatch required.'}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-700 shrink-0 self-start sm:self-center font-black">
                          {custDetails?.closeReasonTag || 'Plan Closed'}
                        </span>
                      </div>
                    ) : custDetails?.isUpcoming ? (
                      <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 font-bold">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{custDetails?.upcomingReason || `Plan scheduled to start on ${custDetails?.startDate}. No delivery required for ${selectedDate}.`}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 shrink-0 self-start sm:self-center font-black">
                          Upcoming Plan
                        </span>
                      </div>
                    ) : (
                      sortedMeals.map((log) => {
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

                            {/* PER-MEAL STATUS BUTTONS (CHANGEABLE & REVERSIBLE) */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(log, 'delivered')}
                                title={isDelivered ? "Active (Click again to revert back to Pending)" : "Mark as Delivered"}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isDelivered
                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Delivered</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(log, 'out_for_delivery')}
                                title={isOutForDelivery ? "Active (Click again to revert back to Pending)" : "Mark as Out for Delivery"}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isOutForDelivery
                                    ? 'bg-purple-900 text-white ring-2 ring-purple-300'
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
                                title="Report Delivery Issue"
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
                                title={log.status === 'paused' ? "Active (Click again to revert back to Pending)" : "Mark as Canceled"}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  log.status === 'paused'
                                    ? 'bg-zinc-800 text-white'
                                    : 'bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Canceled</span>
                              </button>

                              {/* ONE-CLICK REVERT / RESET BUTTON (IF MISTAKENLY CLICKED) */}
                              {log.status !== 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(log, 'pending')}
                                  title="Mistakenly clicked? Click to reset back to Pending"
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 shadow-2xs"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                                  <span className="hidden sm:inline">Reset</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

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

