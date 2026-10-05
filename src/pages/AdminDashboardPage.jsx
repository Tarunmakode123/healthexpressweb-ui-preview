import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, DollarSign, ShoppingBag, FileText, Users, 
  RefreshCw, CheckCircle2, AlertCircle, Clock, Search, Filter, 
  ExternalLink, Download, ChevronRight, Eye, Phone, Mail, MapPin, Truck, CreditCard, LogOut, Check, X,
  BarChart2, Activity, Calendar, ArrowUpRight, CheckSquare, Layers, UserCheck, Menu, Settings,
  CreditCard as PaymentIcon, Bell, Tag, Percent, Plus, Layers3, Coins, Gift, History, Award,
  Cpu, Sparkles, Key, EyeOff, Play, Server, Globe, TrendingUp, ArrowUp, ArrowDown
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  verifyAdminAuth,
  fetchAdminOrders, 
  fetchAdminPayments,
  updateAdminOrderStatus, 
  markCodPaymentCollected,
  fetchAdminPrescriptions, 
  updateAdminEnquiryStatus, 
  fetchAdminPatients,
  getPrescriptionSignedUrl,
  fetchCustomerDetails,
  fetchAnalyticsEvents,
  fetchAdminPromoCodes,
  createAdminPromoCode,
  updateAdminPromoCode,
  toggleAdminPromoCodeStatus,
  deleteAdminPromoCode,
  fetchAdminWalletSettings,
  updateAdminWalletSettings,
  fetchAdminWalletAccounts,
  fetchAdminWalletTransactions,
  adjustCustomerCoins
} from '../services/adminService';
import { CATEGORIES, ALL_SERVICES } from '../data/services';
import { openWhatsApp } from '../utils/whatsapp';
import { getGeminiEngineStatus, testAiConnection, getEffectiveApiKey } from '../services/geminiService';

/**
 * Interactive SVG Line & Area Chart for Revenue & Order Growth
 */
function RevenueTrendSvgChart({ trendData }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trendData || trendData.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800 p-6 text-center text-slate-400 text-xs">
        <BarChart2 className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
        <p className="font-bold text-slate-300">No Revenue Data in Range</p>
        <p className="text-[11px] text-slate-500 mt-1">There are no completed or paid order transactions for the selected date filter.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...trendData.map((d) => d.revenue), 100);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 30;

  const points = trendData.map((d, index) => {
    const x = padding + (index / Math.max(trendData.length - 1, 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.revenue / maxRevenue) * (chartHeight - padding * 2);
    return { ...d, x, y };
  });

  const pathD = points.length === 1 
    ? `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`
    : points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  return (
    <div className="relative space-y-2">
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#475569" strokeWidth="1" />

          {areaD && <path d={areaD} fill="url(#revGradient)" />}
          {pathD && <path d={pathD} fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="10" fill="#a855f7" fillOpacity="0" className="hover:fill-opacity-30 transition-all" />
            </g>
          ))}
        </svg>
      </div>

      {hoveredPoint && (
        <div className="p-3 bg-slate-950 border border-purple-500/50 rounded-xl text-xs text-slate-200 space-y-0.5 shadow-2xl animate-in fade-in">
          <div className="font-extrabold text-purple-300">{new Date(hoveredPoint.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Revenue:</span>
            <strong className="text-emerald-400 font-bold">₹{hoveredPoint.revenue.toLocaleString('en-IN')}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Orders:</span>
            <strong className="text-white font-bold">{hoveredPoint.orders} total ({hoveredPoint.paidOrders} paid)</strong>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Cumulative Customer Growth SVG Chart
 */
function CustomerGrowthSvgChart({ patientsList }) {
  if (!patientsList || patientsList.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-medium bg-slate-950/40 rounded-xl border border-slate-800">
        No patient records available.
      </div>
    );
  }

  const mapByDate = {};
  patientsList.forEach(p => {
    if (!p.created_at) return;
    const dKey = new Date(p.created_at).toISOString().slice(0, 10);
    mapByDate[dKey] = (mapByDate[dKey] || 0) + 1;
  });

  const sortedDates = Object.keys(mapByDate).sort();
  let cumulative = 0;
  const cumulativeData = sortedDates.map(d => {
    cumulative += mapByDate[d];
    return { date: d, total: cumulative, newCount: mapByDate[d] };
  });

  const maxCust = Math.max(cumulative, 5);
  const chartHeight = 120;
  const chartWidth = 400;
  const padding = 20;

  const points = cumulativeData.map((d, index) => {
    const x = padding + (index / Math.max(cumulativeData.length - 1, 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.total / maxCust) * (chartHeight - padding * 2);
    return { ...d, x, y };
  });

  const pathD = points.length === 1
    ? `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`
    : points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-28 overflow-visible">
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" strokeWidth="1" />
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}
 
/**
 * ContextAwareKPIGrid Component
 * Dynamically renders module-specific 4 KPI cards based on activeNav
 */
function ContextAwareKPIGrid({ activeNav, metrics, setActiveNav }) {
  const {
    periodRevenue = 0,
    paidOrdersCount = 0,
    revenueGrowthPct = '0',
    periodOrders = [],
    pendingOrdersCount = 0,
    patients = [],
    periodPatientsCount = 0,
    registeredPatientsCount = 0,
    totalAttentionAlerts = 0,
    pendingReviewsCount = 0,
    codPendingCount = 0,
    failedPaymentsCount = 0,
    codOrdersCount = 0,
    codPendingCollection = 0,
    prescriptions = [],
    underReviewPrescriptionsCount = 0,
    completedPrescriptionsCount = 0,
    promoCodes = [],
    activePromoCount = 0,
    totalPromoUses = 0,
    expiringPromosCount = 0,
    walletAccounts = [],
    totalCoinsIssued = 0,
    totalCoinsRedeemed = 0,
    walletRupeeValue = 0,
    totalWalletCoins = 0,
    periodPayments = [],
    successfulPaymentsCount = 0,
    pendingPaymentsCount = 0,
    analyticsEvents = [],
    todayEventsCount = 0,
    adminActionsCount = 0,
    errorEventsCount = 0,
    geminiStatus = {}
  } = metrics || {};

  const KPI_CONFIG = {
    overview: [
      {
        title: 'TOTAL REVENUE',
        value: `₹${periodRevenue.toLocaleString('en-IN')}`,
        sub: `Paid Txns: ${paidOrdersCount} | ${revenueGrowthPct}% vs prior`,
        icon: DollarSign,
        color: 'emerald',
        targetNav: 'analytics'
      },
      {
        title: 'TOTAL ORDERS',
        value: `${periodOrders.length}`,
        sub: `Paid: ${paidOrdersCount} | Pending: ${pendingOrdersCount}`,
        icon: ShoppingBag,
        color: 'purple',
        targetNav: 'orders'
      },
      {
        title: 'CUSTOMERS',
        value: `${patients.length}`,
        sub: `New (Selected): +${periodPatientsCount} | Registered: ${registeredPatientsCount}`,
        icon: Users,
        color: 'sky',
        targetNav: 'customers'
      },
      {
        title: 'NEEDS ATTENTION',
        value: `${totalAttentionAlerts}`,
        sub: `${pendingReviewsCount} Rx | ${codPendingCount} COD | ${failedPaymentsCount} Failed`,
        icon: AlertCircle,
        color: totalAttentionAlerts > 0 ? 'rose' : 'emerald',
        targetNav: 'prescriptions'
      }
    ],
    orders: [
      {
        title: 'TOTAL ORDERS',
        value: `${periodOrders.length}`,
        sub: 'Orders in selected period',
        icon: ShoppingBag,
        color: 'purple'
      },
      {
        title: 'PAID ORDERS',
        value: `${paidOrdersCount}`,
        sub: `Revenue: ₹${periodRevenue.toLocaleString('en-IN')}`,
        icon: CheckCircle2,
        color: 'emerald'
      },
      {
        title: 'PENDING ORDERS',
        value: `${pendingOrdersCount}`,
        sub: 'Awaiting confirmation/payment',
        icon: Clock,
        color: 'amber'
      },
      {
        title: 'COD ORDERS',
        value: `${codOrdersCount}`,
        sub: `Pending Collection: ₹${codPendingCollection.toLocaleString('en-IN')}`,
        icon: Truck,
        color: 'teal'
      }
    ],
    customers: [
      {
        title: 'TOTAL CUSTOMERS',
        value: `${patients.length}`,
        sub: 'Total customer profiles',
        icon: Users,
        color: 'purple'
      },
      {
        title: 'REGISTERED USERS',
        value: `${registeredPatientsCount}`,
        sub: `${patients.length > 0 ? ((registeredPatientsCount / patients.length) * 100).toFixed(0) : 0}% of customer base`,
        icon: UserCheck,
        color: 'emerald'
      },
      {
        title: 'GUEST PROFILES',
        value: `${patients.length - registeredPatientsCount}`,
        sub: 'Guest checkout records',
        icon: Users,
        color: 'indigo'
      },
      {
        title: 'NEW CUSTOMERS',
        value: `+${periodPatientsCount}`,
        sub: 'Created in selected period',
        icon: ArrowUpRight,
        color: 'sky'
      }
    ],
    prescriptions: [
      {
        title: 'TOTAL PRESCRIPTIONS',
        value: `${prescriptions.length}`,
        sub: 'Total uploads & enquiries',
        icon: FileText,
        color: 'purple'
      },
      {
        title: 'PENDING REVIEW',
        value: `${pendingReviewsCount}`,
        sub: 'Awaiting admin action',
        icon: Clock,
        color: 'amber'
      },
      {
        title: 'UNDER REVIEW',
        value: `${underReviewPrescriptionsCount}`,
        sub: 'Currently being processed',
        icon: RefreshCw,
        color: 'sky'
      },
      {
        title: 'COMPLETED',
        value: `${completedPrescriptionsCount}`,
        sub: 'Reviewed & fulfilled',
        icon: CheckCircle2,
        color: 'emerald'
      }
    ],
    promotions: [
      {
        title: 'ACTIVE PROMO CODES',
        value: `${activePromoCount}`,
        sub: `${activePromoCount} of ${promoCodes.length} codes active`,
        icon: Tag,
        color: 'emerald'
      },
      {
        title: 'TOTAL PROMO CODES',
        value: `${promoCodes.length}`,
        sub: 'Total rule configurations',
        icon: Percent,
        color: 'purple'
      },
      {
        title: 'TOTAL REDEMPTIONS',
        value: `${totalPromoUses}`,
        sub: 'Total code usages',
        icon: Layers3,
        color: 'sky'
      },
      {
        title: 'EXPIRING PROMOS',
        value: `${expiringPromosCount}`,
        sub: expiringPromosCount > 0 ? `${expiringPromosCount} codes expire within 7 days` : 'No codes expiring soon',
        icon: AlertCircle,
        color: expiringPromosCount > 0 ? 'amber' : 'slate'
      }
    ],
    coins: [
      {
        title: 'ACTIVE WALLETS',
        value: `${walletAccounts.length}`,
        sub: 'Customer wallet accounts',
        icon: Coins,
        color: 'amber'
      },
      {
        title: 'COINS ISSUED',
        value: `${totalCoinsIssued.toLocaleString('en-IN')}`,
        sub: 'Total credited coins',
        icon: ArrowUp,
        color: 'emerald'
      },
      {
        title: 'COINS REDEEMED',
        value: `${totalCoinsRedeemed.toLocaleString('en-IN')}`,
        sub: 'Total redeemed coins',
        icon: ArrowDown,
        color: 'indigo'
      },
      {
        title: 'OUTSTANDING WALLET VALUE',
        value: `₹${walletRupeeValue.toLocaleString('en-IN')}`,
        sub: `${totalWalletCoins.toLocaleString('en-IN')} Coins (@ 10 coins = ₹1)`,
        icon: DollarSign,
        color: 'purple'
      }
    ],
    health_coins: [
      {
        title: 'ACTIVE WALLETS',
        value: `${walletAccounts.length}`,
        sub: 'Customer wallet accounts',
        icon: Coins,
        color: 'amber'
      },
      {
        title: 'COINS ISSUED',
        value: `${totalCoinsIssued.toLocaleString('en-IN')}`,
        sub: 'Total credited coins',
        icon: ArrowUp,
        color: 'emerald'
      },
      {
        title: 'COINS REDEEMED',
        value: `${totalCoinsRedeemed.toLocaleString('en-IN')}`,
        sub: 'Total redeemed coins',
        icon: ArrowDown,
        color: 'indigo'
      },
      {
        title: 'OUTSTANDING WALLET VALUE',
        value: `₹${walletRupeeValue.toLocaleString('en-IN')}`,
        sub: `${totalWalletCoins.toLocaleString('en-IN')} Coins (@ 10 coins = ₹1)`,
        icon: DollarSign,
        color: 'purple'
      }
    ],
    payments: [
      {
        title: 'TOTAL PAYMENTS',
        value: `${periodPayments.length}`,
        sub: 'Total transactions',
        icon: PaymentIcon,
        color: 'purple'
      },
      {
        title: 'SUCCESSFUL PAYMENTS',
        value: `${successfulPaymentsCount}`,
        sub: `Success Rate: ${periodPayments.length > 0 ? ((successfulPaymentsCount / periodPayments.length) * 100).toFixed(1) : '100'}%`,
        icon: CheckCircle2,
        color: 'emerald'
      },
      {
        title: 'PENDING PAYMENTS',
        value: `${pendingPaymentsCount}`,
        sub: 'Awaiting gateway response',
        icon: Clock,
        color: 'amber'
      },
      {
        title: 'FAILED PAYMENTS',
        value: `${failedPaymentsCount}`,
        sub: 'Failed payment attempts',
        icon: X,
        color: 'rose'
      }
    ],
    analytics: [
      {
        title: 'TOTAL REVENUE',
        value: `₹${periodRevenue.toLocaleString('en-IN')}`,
        sub: 'Paid revenue (selected)',
        icon: DollarSign,
        color: 'emerald'
      },
      {
        title: 'AVERAGE ORDER VALUE',
        value: `₹${paidOrdersCount > 0 ? Math.round(periodRevenue / paidOrdersCount).toLocaleString('en-IN') : 0}`,
        sub: 'Revenue ÷ Paid Orders',
        icon: BarChart2,
        color: 'purple'
      },
      {
        title: 'REVENUE GROWTH',
        value: `${revenueGrowthPct}%`,
        sub: 'vs Previous Period',
        icon: TrendingUp,
        color: Number(revenueGrowthPct) >= 0 ? 'emerald' : 'rose'
      },
      {
        title: 'TOTAL PAID ORDERS',
        value: `${paidOrdersCount}`,
        sub: 'Completed paid orders',
        icon: ShoppingBag,
        color: 'sky'
      }
    ],
    activity: [
      {
        title: 'TOTAL EVENTS',
        value: `${analyticsEvents.length}`,
        sub: 'Recorded audit logs',
        icon: Layers,
        color: 'purple'
      },
      {
        title: "TODAY'S EVENTS",
        value: `${todayEventsCount}`,
        sub: 'Events generated today',
        icon: Calendar,
        color: 'sky'
      },
      {
        title: 'ADMIN ACTIONS',
        value: `${adminActionsCount}`,
        sub: 'Admin management logs',
        icon: ShieldCheck,
        color: 'emerald'
      },
      {
        title: 'ERRORS & ALERTS',
        value: `${errorEventsCount}`,
        sub: 'Failed actions & warnings',
        icon: AlertCircle,
        color: errorEventsCount > 0 ? 'rose' : 'slate'
      }
    ],
    settings: [
      {
        title: 'SYSTEM STATUS',
        value: 'Operational',
        sub: 'All core services active',
        icon: CheckCircle2,
        color: 'emerald'
      },
      {
        title: 'SUPABASE DATABASE',
        value: 'Operational',
        sub: 'Postgres DB & Auth active',
        icon: Server,
        color: 'emerald'
      },
      {
        title: 'HEX AI AGENT',
        value: geminiStatus.isOnline && geminiStatus.hasApiKey ? 'Active' : 'Key Needed',
        sub: `${geminiStatus.engineType || 'Gemini 2.5 Flash'}`,
        icon: Sparkles,
        color: geminiStatus.hasApiKey ? 'purple' : 'amber'
      },
      {
        title: 'STORAGE & RPC',
        value: 'Operational',
        sub: 'Signed Buckets & Coin Ledger',
        icon: Cpu,
        color: 'emerald'
      }
    ]
  };

  const currentCards = KPI_CONFIG[activeNav] || KPI_CONFIG.overview;

  const colorMap = {
    purple: { text: 'text-purple-400', val: 'text-white', border: 'hover:border-purple-500/50' },
    emerald: { text: 'text-emerald-400', val: 'text-emerald-300', border: 'hover:border-emerald-500/50' },
    amber: { text: 'text-amber-400', val: 'text-amber-300', border: 'hover:border-amber-500/50' },
    rose: { text: 'text-rose-400', val: 'text-rose-300', border: 'hover:border-rose-500/50' },
    sky: { text: 'text-sky-400', val: 'text-sky-300', border: 'hover:border-sky-500/50' },
    indigo: { text: 'text-indigo-400', val: 'text-indigo-300', border: 'hover:border-indigo-500/50' },
    teal: { text: 'text-teal-400', val: 'text-teal-300', border: 'hover:border-teal-500/50' },
    slate: { text: 'text-slate-400', val: 'text-slate-200', border: 'hover:border-slate-500/50' }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {currentCards.map((card, idx) => {
        const IconComp = card.icon;
        const styles = colorMap[card.color] || colorMap.purple;
        const isClickable = !!card.targetNav && typeof setActiveNav === 'function';

        return (
          <div
            key={idx}
            onClick={() => {
              if (isClickable) setActiveNav(card.targetNav);
            }}
            className={`bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 space-y-2.5 shadow-xl transition-all ${
              isClickable ? `cursor-pointer hover:bg-slate-800 ${styles.border} group` : ''
            }`}
          >
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <span className={`flex items-center gap-2 ${styles.text}`}>
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{card.title}</span>
              </span>
              {isClickable && (
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              )}
            </div>

            <div>
              <div className={`text-3xl font-black tracking-tight ${styles.val}`}>
                {card.value}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminDashboardPage() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // NAVIGATION & SIDEBAR: 'overview' | 'orders' | 'customers' | 'prescriptions' | 'promotions' | 'payments' | 'analytics' | 'activity' | 'settings'
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // FILTERS & PAGINATION
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // DATASETS
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [analyticsEvents, setAnalyticsEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast & Modals
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [customer360Data, setCustomer360Data] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  
  // Confirmation Modal for COD Collection
  const [codConfirmOrder, setCodConfirmOrder] = useState(null);
  const [isCollectingCod, setIsCollectingCod] = useState(false);

  // PROMO MODAL STATES & DYNAMIC INPUTS
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoSearchItem, setPromoSearchItem] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customItemInput, setCustomItemInput] = useState('');

  const [promoFormData, setPromoFormData] = useState({
    code: '',
    discount_type: 'flat',
    discount_value: '',
    min_order_amount: '299',
    max_discount: '',
    applicable_scope: 'all',
    applicable_categories: [],
    applicable_items: [],
    valid_from: '',
    valid_until: '',
    usage_limit: '',
    is_active: true
  });

  // HEALTH COINS ADMIN STATES
  const [walletSettingsForm, setWalletSettingsForm] = useState({
    signup_reward_enabled: true,
    signup_reward_coins: 1000,
    coins_per_rupee: 10,
    minimum_coins_to_redeem: 100,
    maximum_coins_per_order: 500,
    minimum_order_amount: 299,
    allow_stacking_with_promo: true,
    coin_expiry_enabled: false,
    default_expiry_days: 90,
    redemption_enabled: true,
    applicable_scope: 'all',
    applicable_categories: [],
    applicable_items: []
  });
  const [walletAccounts, setWalletAccounts] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedAdjustPatient, setSelectedAdjustPatient] = useState(null);
  const [adjustFormData, setAdjustFormData] = useState({
    coins: '',
    type: 'admin_credit',
    description: ''
  });

  // ADMIN AI AGENT PROVIDERS & API KEYS
  const [selectedAiProvider, setSelectedAiProvider] = useState(() => localStorage.getItem('hex_admin_active_provider') || 'gemini');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('hex_admin_gemini_key') || localStorage.getItem('hex_admin_ai_key') || '');
  const [claudeKey, setClaudeKey] = useState(() => localStorage.getItem('hex_admin_claude_key') || '');
  const [chatgptKey, setChatgptKey] = useState(() => localStorage.getItem('hex_admin_chatgpt_key') || localStorage.getItem('hex_admin_openai_key') || '');
  const [showAiKeySecret, setShowAiKeySecret] = useState(false);
  const [isTestingAiConnection, setIsTestingAiConnection] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);
  const [geminiStatus, setGeminiStatus] = useState(() => getGeminiEngineStatus());

  const getCurrentProviderKey = () => {
    if (selectedAiProvider === 'anthropic') return claudeKey;
    if (selectedAiProvider === 'openai') return chatgptKey;
    return geminiKey;
  };

  const handleSelectProvider = (prov) => {
    setSelectedAiProvider(prov);
    localStorage.setItem('hex_admin_active_provider', prov);
    setAiTestResult(null);
    setGeminiStatus(getGeminiEngineStatus());
  };

  const handleSaveCurrentKey = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('hex_admin_active_provider', selectedAiProvider);

    if (selectedAiProvider === 'anthropic') {
      const trimmed = claudeKey.trim();
      if (trimmed) localStorage.setItem('hex_admin_claude_key', trimmed);
      else localStorage.removeItem('hex_admin_claude_key');
      showToast('Claude API Key saved successfully.');
    } else if (selectedAiProvider === 'openai') {
      const trimmed = chatgptKey.trim();
      if (trimmed) {
        localStorage.setItem('hex_admin_chatgpt_key', trimmed);
        localStorage.setItem('hex_admin_openai_key', trimmed);
      } else {
        localStorage.removeItem('hex_admin_chatgpt_key');
        localStorage.removeItem('hex_admin_openai_key');
      }
      showToast('ChatGPT (OpenAI) API Key saved successfully.');
    } else {
      const trimmed = geminiKey.trim();
      if (trimmed) {
        localStorage.setItem('hex_admin_gemini_key', trimmed);
        localStorage.setItem('hex_admin_ai_key', trimmed);
      } else {
        localStorage.removeItem('hex_admin_gemini_key');
        localStorage.removeItem('hex_admin_ai_key');
      }
      showToast('Gemini API Key saved successfully.');
    }
    setGeminiStatus(getGeminiEngineStatus());
  };

  const handleTestAiConnection = async () => {
    setAiTestResult(null);
    setIsTestingAiConnection(true);
    const activeKey = getCurrentProviderKey().trim();
    try {
      const res = await testAiConnection(activeKey, selectedAiProvider);
      setAiTestResult(res);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.error, 'error');
      }
    } catch (err) {
      setAiTestResult({ success: false, error: err.message || 'Connection test failed' });
    } finally {
      setIsTestingAiConnection(false);
      setGeminiStatus(getGeminiEngineStatus());
    }
  };

  const handleClearCurrentKey = () => {
    if (selectedAiProvider === 'anthropic') {
      setClaudeKey('');
      localStorage.removeItem('hex_admin_claude_key');
    } else if (selectedAiProvider === 'openai') {
      setChatgptKey('');
      localStorage.removeItem('hex_admin_chatgpt_key');
      localStorage.removeItem('hex_admin_openai_key');
    } else {
      setGeminiKey('');
      localStorage.removeItem('hex_admin_gemini_key');
      localStorage.removeItem('hex_admin_ai_key');
    }
    setAiTestResult(null);
    setGeminiStatus(getGeminiEngineStatus());
    showToast('API Key cleared for selected provider.');
  };

  // Dynamically aggregate all categories across master dataset & live orders
  const allDynamicCategories = Array.from(
    new Set([
      ...CATEGORIES.map((c) => c.name),
      ...ALL_SERVICES.map((s) => s.category_name || s.category).filter(Boolean),
      ...promoFormData.applicable_categories
    ])
  );

  // ROUTE PROTECTION: Check active Supabase Auth session and check_is_admin() RPC on mount
  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSession() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setIsAuthenticated(false);
          setAuthError('Supabase environment is not configured.');
          setIsCheckingSession(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: isAdmin } = await supabase.rpc('check_is_admin');

          if (isMounted) {
            if (isAdmin === true) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
              setAuthError('You do not have permission to access the Health Express Admin Portal.');
              await supabase.auth.signOut();
            }
          }
        } else {
          if (isMounted) setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        if (isMounted) setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    checkCurrentSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setSelectedOrder(null);
        setSelectedPatientId(null);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Admin Login Form Submission
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await verifyAdminAuth(adminEmail, adminPassword);
      if (res.success) {
        setIsAuthenticated(true);
        setAuthError('');
        showToast('Welcome to Health Express Operations Control Center.');
      } else {
        setAuthError(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setSelectedOrder(null);
    setSelectedPatientId(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Signout error:', e);
      }
    }
  };

  // Load Admin Data from Supabase
  const loadAdminData = async () => {
    setIsLoading(true);
    setDataError(null);

    try {
      const [ordRes, payRes, presRes, patRes, promoRes, evtRes, setRes, accRes, txRes] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminPayments(),
        fetchAdminPrescriptions(),
        fetchAdminPatients(),
        fetchAdminPromoCodes(),
        fetchAnalyticsEvents(100),
        fetchAdminWalletSettings(),
        fetchAdminWalletAccounts(),
        fetchAdminWalletTransactions()
      ]);

      const errors = [];
      if (ordRes.success) setOrders(ordRes.data || []);
      else errors.push(ordRes.error || 'Unable to fetch orders.');

      if (payRes.success) setPayments(payRes.data || []);
      else errors.push(payRes.error || 'Unable to fetch payments.');

      if (presRes.success) setPrescriptions(presRes.data || []);
      else errors.push(presRes.error || 'Unable to fetch guest prescriptions.');

      if (patRes.success) setPatients(patRes.data || []);
      else errors.push(patRes.error || 'Unable to fetch registered patients.');

      if (promoRes.success) setPromoCodes(promoRes.data || []);
      else errors.push(promoRes.error || 'Unable to fetch promo codes.');

      if (evtRes.success) setAnalyticsEvents(evtRes.data || []);
      if (setRes.success) setWalletSettingsForm(setRes.data || {});
      if (accRes.success) setWalletAccounts(accRes.data || []);
      if (txRes.success) setWalletTransactions(txRes.data || []);

      if (errors.length > 0) {
        setDataError(errors.join(' | '));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setDataError(err.message || 'Unable to load production telemetry data from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  // PROMO MANAGEMENT HANDLERS
  const handleSavePromo = async (e) => {
    if (e) e.preventDefault();
    if (!promoFormData.code.trim()) {
      showToast('Please enter a promo code.', 'error');
      return;
    }

    if (promoFormData.applicable_scope === 'categories' && promoFormData.applicable_categories.length === 0) {
      showToast('Please select or add at least one applicable category.', 'error');
      return;
    }

    if (promoFormData.applicable_scope === 'items' && promoFormData.applicable_items.length === 0) {
      showToast('Please select or add at least one applicable product/service.', 'error');
      return;
    }

    if (editingPromo) {
      const res = await updateAdminPromoCode(editingPromo.id, promoFormData);
      if (res.success) {
        showToast(`Promo code ${promoFormData.code} updated successfully.`);
        setIsPromoModalOpen(false);
        loadAdminData();
      } else {
        showToast(res.error || 'Failed to update promo code.', 'error');
      }
    } else {
      const res = await createAdminPromoCode(promoFormData);
      if (res.success) {
        showToast(`Promo code ${promoFormData.code} created and published.`);
        setIsPromoModalOpen(false);
        loadAdminData();
      } else {
        showToast(res.error || 'Failed to create promo code.', 'error');
      }
    }
  };

  const handleTogglePromoStatus = async (id, currentStatus) => {
    const res = await toggleAdminPromoCodeStatus(id, currentStatus);
    if (res.success) {
      showToast(`Promo status updated to ${currentStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      loadAdminData();
    } else {
      showToast(res.error || 'Failed to toggle promo status.', 'error');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code? Historical usages will remain saved.')) return;
    const res = await deleteAdminPromoCode(id);
    if (res.success) {
      showToast('Promo code deleted successfully.');
      loadAdminData();
    } else {
      showToast(res.error || 'Failed to delete promo code.', 'error');
    }
  };

  const handleOpenEditPromoModal = (promo) => {
    setEditingPromo(promo);
    const rawCat = Array.isArray(promo.applicable_categories) ? promo.applicable_categories : (typeof promo.applicable_categories === 'string' ? JSON.parse(promo.applicable_categories || '[]') : []);
    const rawItm = Array.isArray(promo.applicable_items) ? promo.applicable_items : (typeof promo.applicable_items === 'string' ? JSON.parse(promo.applicable_items || '[]') : []);

    setPromoFormData({
      code: promo.code || '',
      discount_type: promo.discount_type || 'flat',
      discount_value: promo.discount_value || '',
      min_order_amount: promo.min_order_amount || '0',
      max_discount: promo.max_discount || '',
      applicable_scope: promo.applicable_scope || 'all',
      applicable_categories: rawCat,
      applicable_items: rawItm,
      valid_from: promo.valid_from ? promo.valid_from.slice(0, 10) : '',
      valid_until: promo.valid_until ? promo.valid_until.slice(0, 10) : '',
      usage_limit: promo.usage_limit || '',
      is_active: promo.is_active !== undefined ? promo.is_active : true
    });
    setCustomCategoryInput('');
    setCustomItemInput('');
    setIsPromoModalOpen(true);
  };

  // Toggle Category Checkbox Selection
  const toggleCategorySelection = (catName) => {
    setPromoFormData((prev) => {
      const exists = prev.applicable_categories.includes(catName);
      const updated = exists
        ? prev.applicable_categories.filter((c) => c !== catName)
        : [...prev.applicable_categories, catName];
      return { ...prev, applicable_categories: updated };
    });
  };

  // Add Custom Category write-in
  const handleAddCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    const cleanCat = customCategoryInput.trim();
    if (!promoFormData.applicable_categories.includes(cleanCat)) {
      setPromoFormData((prev) => ({
        ...prev,
        applicable_categories: [...prev.applicable_categories, cleanCat]
      }));
    }
    setCustomCategoryInput('');
  };

  // Toggle Item Checkbox Selection
  const toggleItemSelection = (itemId) => {
    setPromoFormData((prev) => {
      const exists = prev.applicable_items.includes(itemId);
      const updated = exists
        ? prev.applicable_items.filter((i) => i !== itemId)
        : [...prev.applicable_items, itemId];
      return { ...prev, applicable_items: updated };
    });
  };

  // Add Custom Item/Product ID write-in
  const handleAddCustomItem = () => {
    if (!customItemInput.trim()) return;
    const cleanItem = customItemInput.trim();
    if (!promoFormData.applicable_items.includes(cleanItem)) {
      setPromoFormData((prev) => ({
        ...prev,
        applicable_items: [...prev.applicable_items, cleanItem]
      }));
    }
    setCustomItemInput('');
  };

  // Load 360 Customer Detail Modal
  const handleOpenCustomer360 = async (patientId) => {
    setSelectedPatientId(patientId);
    setIsLoadingCustomer(true);
    setCustomer360Data(null);

    try {
      const res = await fetchCustomerDetails(patientId);
      if (res.success) {
        setCustomer360Data(res.data);
      } else {
        showToast(`Error loading customer profile: ${res.error}`, 'error');
      }
    } catch (err) {
      console.error('Customer 360 load exception:', err);
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  // Confirm and Execute COD Payment Collection via RPC
  const executeMarkCodCollected = async () => {
    if (!codConfirmOrder) return;
    setIsCollectingCod(true);

    try {
      const res = await markCodPaymentCollected(codConfirmOrder.id);
      if (res.success) {
        showToast(`COD payment collected for ${codConfirmOrder.order_code}. Status: PAID.`);
        await loadAdminData();
        if (selectedOrder && selectedOrder.id === codConfirmOrder.id) {
          setSelectedOrder((prev) => ({
            ...prev,
            payment_status: 'PAID',
            order_status: 'CONFIRMED'
          }));
        }
      } else {
        showToast(`Error updating COD payment: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`COD Collection exception: ${err.message}`, 'error');
    } finally {
      setIsCollectingCod(false);
      setCodConfirmOrder(null);
    }
  };

  // LAST UPDATED TIMESTAMP TELEMETRY
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Date Filter Logic & Prior Period Comparison
  const isDateInFilter = (dateString, filter) => {
    if (filter === 'ALL') return true;
    if (!dateString) return false;

    const date = new Date(dateString);
    const now = new Date();

    if (filter === 'TODAY') {
      return date.toDateString() === now.toDateString();
    }
    if (filter === 'YESTERDAY') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      return date.toDateString() === yest.toDateString();
    }
    if (filter === 'LAST_7') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 7);
      return date >= d7;
    }
    if (filter === 'LAST_30') {
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 30);
      return date >= d30;
    }
    if (filter === 'THIS_MONTH') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (filter === 'LAST_MONTH') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return date >= lastMonth && date <= endLastMonth;
    }
    return true;
  };

  const isDateInPreviousPeriod = (dateString, filter) => {
    if (filter === 'ALL') return false;
    if (!dateString) return false;

    const date = new Date(dateString);
    const now = new Date();

    if (filter === 'TODAY') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      return date.toDateString() === yest.toDateString();
    }
    if (filter === 'YESTERDAY') {
      const d2 = new Date(now);
      d2.setDate(d2.getDate() - 2);
      return date.toDateString() === d2.toDateString();
    }
    if (filter === 'LAST_7') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 7);
      const d14 = new Date(now);
      d14.setDate(d14.getDate() - 14);
      return date >= d14 && date < d7;
    }
    if (filter === 'LAST_30') {
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 30);
      const d60 = new Date(now);
      d60.setDate(d60.getDate() - 60);
      return date >= d60 && date < d30;
    }
    if (filter === 'THIS_MONTH') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return date >= lastMonth && date <= endLastMonth;
    }
    if (filter === 'LAST_MONTH') {
      const m2Ago = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const endM2Ago = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
      return date >= m2Ago && date <= endM2Ago;
    }
    return false;
  };

  // HEALTH COINS HANDLERS
  const handleSaveWalletSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await updateAdminWalletSettings(walletSettingsForm);
      if (res.success) {
        showToast('Health Coins & Rewards settings updated successfully.');
      } else {
        showToast(`Failed to update wallet settings: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Wallet settings update exception: ${err.message}`, 'error');
    }
  };

  const handleExecuteAdjustCoins = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAdjustPatient || !adjustFormData.coins || !adjustFormData.description.trim()) {
      showToast('Please enter patient, coins amount, and reason.', 'error');
      return;
    }

    try {
      const res = await adjustCustomerCoins({
        patientId: selectedAdjustPatient.id,
        coins: adjustFormData.coins,
        type: adjustFormData.type,
        description: adjustFormData.description
      });

      if (res.success) {
        showToast(`Successfully adjusted ${adjustFormData.coins} coins for ${selectedAdjustPatient.name || 'customer'}.`);
        setIsAdjustModalOpen(false);
        setSelectedAdjustPatient(null);
        setAdjustFormData({ coins: '', type: 'admin_credit', description: '' });
        await loadAdminData();
      } else {
        showToast(`Coin adjustment failed: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast(`Coin adjustment exception: ${err.message}`, 'error');
    }
  };

  // Filtered Orders
  const dateFilteredOrders = (orders || []).filter((o) => isDateInFilter(o?.created_at, dateRangeFilter));
  const filteredOrders = dateFilteredOrders.filter((ord) => {
    if (orderFilter !== 'ALL') {
      if (orderFilter === 'COD') {
        const payMethod = (ord.payments?.[0]?.payment_method || ord.payment_method || '').toUpperCase();
        if (payMethod !== 'COD') return false;
      } else if (orderFilter === 'ONLINE') {
        const payMethod = (ord.payments?.[0]?.payment_method || ord.payment_method || '').toUpperCase();
        if (payMethod === 'COD') return false;
      } else if (orderFilter === 'PAID') {
        if (ord.payment_status !== 'PAID') return false;
      } else if (orderFilter === 'PENDING') {
        if (ord.payment_status !== 'PENDING') return false;
      } else if (orderFilter === 'FAILED') {
        if (ord.payment_status !== 'FAILED') return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = ord.order_code?.toLowerCase() || '';
      const name = ord.customer_name?.toLowerCase() || '';
      const phone = ord.customer_phone?.toLowerCase() || '';
      return code.includes(q) || name.includes(q) || phone.includes(q);
    }
    return true;
  });

  // Orders Pagination
  const totalOrderPages = Math.ceil((filteredOrders.length || 1) / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filtered Patients (Customers Tab)
  const filteredPatients = (patients || []).filter((pat) => {
    if (customerTypeFilter === 'REGISTERED' && !pat?.user_id) return false;
    if (customerTypeFilter === 'GUEST' && pat?.user_id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (pat?.full_name || '').toLowerCase();
      const phone = (pat?.phone_e164 || '').toLowerCase();
      const email = (pat?.email || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    }
    return true;
  });

  // Filtered Prescriptions (Prescriptions Tab)
  const filteredPrescriptions = (prescriptions || []).filter((enq) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (enq?.enquiry_code || '').toLowerCase();
      const name = (enq?.patients?.full_name || '').toLowerCase();
      const phone = (enq?.patients?.phone_e164 || '').toLowerCase();
      return code.includes(q) || name.includes(q) || phone.includes(q);
    }
    return true;
  });

  // Filtered Payments (Payments Tab)
  const filteredPayments = (payments || []).filter((pay) => {
    if (paymentFilter !== 'ALL') {
      if (paymentFilter === 'PAID' && pay?.payment_status !== 'PAID') return false;
      if (paymentFilter === 'PENDING' && pay?.payment_status !== 'PENDING') return false;
      if (paymentFilter === 'FAILED' && pay?.payment_status !== 'FAILED') return false;
      if (paymentFilter === 'COD' && (pay?.payment_method || '').toUpperCase() !== 'COD') return false;
      if (paymentFilter === 'ONLINE' && (pay?.payment_method || '').toUpperCase() === 'COD') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const id = (pay?.id || '').toLowerCase();
      const orderId = (pay?.razorpay_order_id || '').toLowerCase();
      const payId = (pay?.razorpay_payment_id || '').toLowerCase();
      const custName = (pay?.patients?.full_name || pay?.orders?.customer_name || '').toLowerCase();
      return id.includes(q) || orderId.includes(q) || payId.includes(q) || custName.includes(q);
    }
    return true;
  });

  // TELEMETRY & PERIOD STATS FOR OVERVIEW COMMAND CENTER
  const periodOrders = (orders || []).filter((o) => isDateInFilter(o?.created_at, dateRangeFilter));
  const prevPeriodOrders = (orders || []).filter((o) => isDateInPreviousPeriod(o?.created_at, dateRangeFilter));

  const periodRevenue = periodOrders
    .filter((o) => o?.payment_status === 'PAID')
    .reduce((acc, o) => acc + Number(o?.total_amount || 0), 0);

  const prevPeriodRevenue = prevPeriodOrders
    .filter((o) => o?.payment_status === 'PAID')
    .reduce((acc, o) => acc + Number(o?.total_amount || 0), 0);

  const revenueGrowthPct = prevPeriodRevenue > 0
    ? (((periodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100).toFixed(1)
    : (periodRevenue > 0 ? '+100' : '0');

  const periodPayments = (payments || []).filter((p) => isDateInFilter(p?.created_at, dateRangeFilter));
  const periodPatientsCount = (patients || []).filter((p) => isDateInFilter(p?.created_at, dateRangeFilter)).length;

  const totalRevenue = periodRevenue;
  const todayStart = new Date(new Date().setHours(0,0,0,0));
  const todayOrders = (orders || []).filter((o) => new Date(o?.created_at) >= todayStart);
  const todayRevenue = todayOrders
    .filter((o) => o?.payment_status === 'PAID')
    .reduce((acc, o) => acc + Number(o?.total_amount || 0), 0);

  const onlineRevenueCollected = periodOrders
    .filter((o) => {
      const payObj = o?.payments?.[0] || {};
      const payMethod = (payObj.payment_method || o?.payment_method || '').toUpperCase();
      return payMethod !== 'COD' && o?.payment_status === 'PAID';
    })
    .reduce((acc, o) => acc + Number(o?.total_amount || 0), 0);

  const codPendingCollection = periodOrders
    .filter((o) => {
      const payObj = o?.payments?.[0] || {};
      const payMethod = (payObj.payment_method || o?.payment_method || '').toUpperCase();
      const payMode = (payObj.payment_mode || o?.payment_mode || '').toUpperCase();
      return (payMethod === 'COD' || payMode === 'COD') && o?.payment_status === 'PENDING';
    })
    .reduce((acc, o) => acc + Number(o?.total_amount || 0), 0);

  const codCollected = periodOrders
    .filter((o) => {
      const payObj = o?.payments?.[0] || {};
      const payMethod = (payObj.payment_method || o?.payment_method || '').toUpperCase();
      const payMode = (payObj.payment_mode || o?.payment_mode || '').toUpperCase();
      return (payMethod === 'COD' || payMode === 'COD') && o?.payment_status === 'PAID';
    })
    .reduce((acc, o) => acc + Number(o?.total_amount || 0), 0);

  const paidOrdersCount = periodOrders.filter((o) => o?.payment_status === 'PAID').length;
  const pendingOrdersCount = periodOrders.filter((o) => o?.payment_status === 'PENDING').length;
  const codOrdersCount = periodOrders.filter((o) => {
    const payObj = o?.payments?.[0] || {};
    const payMethod = (payObj.payment_method || o?.payment_method || '').toUpperCase();
    const payMode = (payObj.payment_mode || o?.payment_mode || '').toUpperCase();
    return payMethod === 'COD' || payMode === 'COD';
  }).length;
  const codPendingCount = periodOrders.filter((o) => {
    const payObj = o?.payments?.[0] || {};
    const payMethod = (payObj.payment_method || o?.payment_method || '').toUpperCase();
    const payMode = (payObj.payment_mode || o?.payment_mode || '').toUpperCase();
    return (payMethod === 'COD' || payMode === 'COD') && o?.payment_status === 'PENDING';
  }).length;
  const successfulPaymentsCount = paidOrdersCount;
  const pendingPaymentsCount = pendingOrdersCount;
  const failedPaymentsCount = periodOrders.filter((o) => o?.payment_status === 'FAILED').length;
  const cancelledOrdersCount = periodOrders.filter((o) => o?.order_status === 'CANCELLED').length;

  const registeredPatientsCount = (patients || []).filter((p) => p?.user_id).length;
  const guestEnquiriesCount = (prescriptions || []).length;
  const pendingPrescriptionsList = (prescriptions || []).filter((p) => p?.status === 'pending_review');
  const pendingReviewsCount = pendingPrescriptionsList.length;

  const totalPromoUses = (promoCodes || []).reduce((acc, p) => acc + Number(p?.used_count || 0), 0);
  const totalWalletCoins = (walletAccounts || []).reduce((acc, w) => acc + Number(w?.coin_balance || 0), 0);
  const walletRupeeValue = Math.floor(totalWalletCoins / 10);

  const expiringPromosCount = (promoCodes || []).filter((p) => {
    if (!p?.is_active || !p?.valid_until) return false;
    const diffDays = (new Date(p.valid_until) - new Date()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 7;
  }).length;

  const totalAttentionAlerts = pendingReviewsCount + codPendingCount + failedPaymentsCount + expiringPromosCount;

  // DYNAMIC CONTEXT-AWARE KPI METRICS OBJECT
  const kpiMetrics = {
    periodRevenue,
    paidOrdersCount,
    revenueGrowthPct,
    periodOrders,
    pendingOrdersCount,
    patients,
    periodPatientsCount,
    registeredPatientsCount,
    totalAttentionAlerts,
    pendingReviewsCount,
    codPendingCount,
    failedPaymentsCount,
    codOrdersCount,
    codPendingCollection,
    prescriptions,
    underReviewPrescriptionsCount: (prescriptions || []).filter((p) => p?.status === 'under_review' || p?.status === 'processing').length,
    completedPrescriptionsCount: (prescriptions || []).filter((p) => p?.status === 'fulfilled' || p?.status === 'completed' || p?.status === 'approved' || p?.status === 'converted').length,
    promoCodes,
    activePromoCount: (promoCodes || []).filter((p) => p?.is_active).length,
    totalPromoUses,
    expiringPromosCount,
    walletAccounts,
    totalCoinsIssued: (walletTransactions || [])
      .filter((tx) => tx.transaction_type === 'credit' || tx.type === 'admin_credit' || tx.type === 'signup_bonus' || Number(tx.coins || 0) > 0)
      .reduce((acc, tx) => acc + Math.abs(Number(tx.coins || 0)), 0) || totalWalletCoins,
    totalCoinsRedeemed: (walletTransactions || [])
      .filter((tx) => tx.transaction_type === 'debit' || tx.type === 'redemption' || Number(tx.coins || 0) < 0)
      .reduce((acc, tx) => acc + Math.abs(Number(tx.coins || 0)), 0),
    walletRupeeValue,
    totalWalletCoins,
    periodPayments,
    successfulPaymentsCount: paidOrdersCount,
    pendingPaymentsCount: pendingOrdersCount,
    analyticsEvents,
    todayEventsCount: (analyticsEvents || []).filter((e) => e.created_at && isDateInFilter(e.created_at, 'TODAY')).length,
    adminActionsCount: (analyticsEvents || []).filter((e) => (e.event_type || e.action || '').toLowerCase().includes('admin') || (e.category || '').toLowerCase() === 'admin').length,
    errorEventsCount: (analyticsEvents || []).filter((e) => (e.status || '').toLowerCase() === 'error' || (e.event_type || '').toLowerCase().includes('fail') || (e.event_type || '').toLowerCase().includes('error')).length,
    geminiStatus
  };

  const buildDailyTrendData = (ordersList) => {
    if (!ordersList || ordersList.length === 0) return [];
    
    const mapByDate = {};
    ordersList.forEach((ord) => {
      if (!ord.created_at) return;
      const dateKey = new Date(ord.created_at).toISOString().slice(0, 10);
      if (!mapByDate[dateKey]) {
        mapByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0, paidOrders: 0 };
      }
      mapByDate[dateKey].orders += 1;
      if (ord.payment_status === 'PAID') {
        mapByDate[dateKey].revenue += Number(ord.total_amount || 0);
        mapByDate[dateKey].paidOrders += 1;
      }
    });

    const sortedDates = Object.keys(mapByDate).sort();
    return sortedDates.map((d) => mapByDate[d]);
  };

  // SESSION CHECK SPINNER
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-purple-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-xs font-bold tracking-wide">Verifying Admin Session & RBAC...</span>
        </div>
      </div>
    );
  }

  // DEDICATED ADMIN LOGIN UI (UNAUTHENTICATED)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6 text-left border border-purple-200 animate-in fade-in duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto p-2 overflow-hidden shadow-xs">
              <img src="/logo.png" alt="Health Express Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Admin Portal</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Secure access for Health Express operations team
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{authError}</div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                onInput={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full px-4 py-3 rounded-xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onInput={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl border border-purple-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAuthenticating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Admin RBAC...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Sign In to Admin Portal
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row text-left font-sans">
      
      {/* TOAST NOTIFICATION CALLOUT */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-[200000] p-4 rounded-2xl shadow-2xl text-xs font-bold border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toastMessage.type === 'error' ? 'bg-rose-950 text-rose-100 border-rose-800' : 'bg-emerald-950 text-emerald-100 border-emerald-800'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all ${isSidebarOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/80 border border-purple-500/40 p-1.5 overflow-hidden flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Health Express" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">HEALTH EXPRESS</h2>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">OPS CONTROL</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: (orders || []).length },
            { id: 'customers', label: 'Customers', icon: Users, badge: (patients || []).length },
            { id: 'prescriptions', label: 'Prescriptions', icon: FileText, badge: pendingReviewsCount > 0 ? pendingReviewsCount : null },
            { id: 'promotions', label: 'Offers & Promotions', icon: Tag, badge: (promoCodes || []).length },
            { id: 'coins', label: 'Health Coins & Rewards', icon: Coins, badge: (walletAccounts || []).length },
            { id: 'payments', label: 'Payments', icon: PaymentIcon },
            { id: 'analytics', label: 'Revenue Analytics', icon: BarChart2 },
            { id: 'activity', label: 'Activity Logs', icon: Layers },
            { id: 'settings', label: 'System Settings', icon: Settings },
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); setCurrentPage(1); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isActive 
                    ? 'bg-purple-900/60 text-white border border-purple-700/60 shadow-md font-black' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.id === 'prescriptions' && pendingReviewsCount > 0 
                      ? 'bg-amber-500 text-slate-950 font-black animate-pulse' 
                      : 'bg-slate-800 text-purple-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-400">
            <div className="font-bold text-slate-200">Admin Account</div>
            <div className="truncate text-purple-300 font-semibold">{adminEmail || 'admin@healthexpress.in'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TOP APP BAR & GLOBAL CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-900 rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">
                {activeNav === 'overview' && 'Operational Overview'}
                {activeNav === 'orders' && 'Orders & Transactions'}
                {activeNav === 'customers' && 'Customer Directory (360°)'}
                {activeNav === 'prescriptions' && 'Guest Prescriptions'}
                {activeNav === 'promotions' && 'Offers & Promotions Management'}
                {activeNav === 'payments' && 'Payment Gateway Transactions'}
                {activeNav === 'analytics' && 'Revenue & Order Analytics'}
                {activeNav === 'activity' && 'Event Logs'}
                {activeNav === 'settings' && 'System Configuration'}
              </h1>
              <p className="text-xs text-purple-300/80 font-medium">Real-time Supabase Production Data</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={dateRangeFilter}
                onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent focus:outline-none cursor-pointer text-white font-bold"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Time</option>
                <option value="TODAY" className="bg-slate-900 text-white">Today</option>
                <option value="YESTERDAY" className="bg-slate-900 text-white">Yesterday</option>
                <option value="LAST_7" className="bg-slate-900 text-white">Last 7 Days</option>
                <option value="LAST_30" className="bg-slate-900 text-white">Last 30 Days</option>
                <option value="THIS_MONTH" className="bg-slate-900 text-white">This Month</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search name, phone, order code..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* DATABASE ERROR BANNER */}
        {dataError && (
          <div className="p-4 bg-rose-950/80 border border-rose-800/80 rounded-2xl text-xs text-rose-200 font-bold flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{dataError}</span>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-black text-xs cursor-pointer shrink-0 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* CONTEXT-AWARE DYNAMIC KPI GRID FOR ALL MODULES */}
        <ContextAwareKPIGrid activeNav={activeNav} metrics={kpiMetrics} setActiveNav={setActiveNav} />

        {/* NAV SECTION 1: COMPACT OPERATIONAL COMMAND CENTER OVERVIEW */}
        {activeNav === 'overview' && (
          <div className="space-y-6">

            {/* 1. HEADER SUB-BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">Operational Overview</h2>
                  <p className="text-[11px] text-purple-300 font-medium">Real-time snapshot of Health Express operations</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
                  Last Updated: {lastUpdatedTime}
                </span>
                <button
                  onClick={loadAdminData}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-200 border border-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* 2. MAIN ANALYTICS CHART & OPERATIONAL SNAPSHOT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* REVENUE & ORDERS TREND CHART */}
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-purple-400" />
                      <span>Revenue & Orders Trend</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Daily revenue and order volume in period</p>
                  </div>
                  <button onClick={() => setActiveNav('analytics')} className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer">
                    <span>Full Analytics →</span>
                  </button>
                </div>

                <RevenueTrendSvgChart trendData={buildDailyTrendData(periodOrders)} />
              </div>

              {/* OPERATIONAL SNAPSHOT */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="border-b border-slate-700/80 pb-3">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>Operational Snapshot</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Fulfillment & Payment status distribution</p>
                </div>

                {/* ORDER STATUS BARS */}
                <div className="space-y-3 text-xs">
                  <span className="font-extrabold text-slate-300 uppercase text-[10px] tracking-wider">Order Status Distribution:</span>
                  {[
                    { label: 'Paid / Confirmed', count: paidOrdersCount, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                    { label: 'Pending Processing', count: pendingOrdersCount, color: 'bg-amber-500', textColor: 'text-amber-400' },
                    { label: 'Failed / Cancelled', count: failedPaymentsCount + cancelledOrdersCount, color: 'bg-rose-500', textColor: 'text-rose-400' },
                  ].map((st) => {
                    const pct = periodOrders.length > 0 ? ((st.count / periodOrders.length) * 100).toFixed(0) : 0;
                    return (
                      <div key={st.label} className="space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-300">{st.label}</span>
                          <span className={st.textColor}>{st.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${st.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAYMENT HEALTH METRICS */}
                <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                  <span className="font-extrabold text-slate-300 uppercase text-[10px] tracking-wider">Payment Health:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">Online Success:</span>
                      <div className="font-black text-emerald-400 text-sm">₹{onlineRevenueCollected.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-medium">COD Pending:</span>
                      <div className="font-black text-amber-300 text-sm">₹{codPendingCollection.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. NEEDS ATTENTION ALERT BOX */}
            <div id="needs-attention-box" className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${totalAttentionAlerts > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <span>Needs Attention</span>
                </h3>
                {totalAttentionAlerts > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black animate-pulse">
                    {totalAttentionAlerts} Items Pending
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                    ✓ Everything is operational
                  </span>
                )}
              </div>

              {totalAttentionAlerts === 0 ? (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-bold">✓ Everything is operational. No urgent actions require attention right now.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {pendingReviewsCount > 0 && (
                    <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-rose-300">{pendingReviewsCount} Prescriptions Pending</div>
                        <div className="text-[10px] text-slate-400">Awaiting pharmacist review</div>
                      </div>
                      <button
                        onClick={() => setActiveNav('prescriptions')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-[11px] shrink-0 transition-colors cursor-pointer"
                      >
                        Review Rx →
                      </button>
                    </div>
                  )}

                  {codPendingCount > 0 && (
                    <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-amber-300">{codPendingCount} COD Collections Pending</div>
                        <div className="text-[10px] text-slate-400">₹{codPendingCollection.toLocaleString('en-IN')} uncollected</div>
                      </div>
                      <button
                        onClick={() => { setOrderFilter('COD'); setActiveNav('orders'); }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] shrink-0 transition-colors cursor-pointer"
                      >
                        Collect →
                      </button>
                    </div>
                  )}

                  {failedPaymentsCount > 0 && (
                    <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-rose-300">{failedPaymentsCount} Payment Failures</div>
                        <div className="text-[10px] text-slate-400">Transaction errors recorded</div>
                      </div>
                      <button
                        onClick={() => setActiveNav('payments')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-200 border border-rose-700 font-bold text-[11px] shrink-0 cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </div>
                  )}

                  {expiringPromosCount > 0 && (
                    <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-amber-300">{expiringPromosCount} Expiring Promos</div>
                        <div className="text-[10px] text-slate-400">Expires within 7 days</div>
                      </div>
                      <button
                        onClick={() => setActiveNav('promotions')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-700 font-bold text-[11px] shrink-0 cursor-pointer"
                      >
                        Manage →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. RECENT ORDERS STREAM & QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* RECENT ORDERS (LATEST 5) */}
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-black text-white">Recent Orders (Latest 5)</h3>
                  </div>
                  <button onClick={() => setActiveNav('orders')} className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer">
                    <span>View All Orders →</span>
                  </button>
                </div>

                {periodOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No orders recorded for selected period.</p>
                ) : (
                  <div className="space-y-2.5">
                    {periodOrders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-purple-300">{ord.order_code}</span>
                            <span className="font-bold text-white">{ord.customer_name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(ord.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-black text-white">₹{ord.total_amount}</div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            ord.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {ord.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. QUICK ACTIONS */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-700/80 pb-3">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    <span>Quick Actions</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Shortcuts to operations & modals</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <button
                    onClick={() => {
                      setEditingPromo(null);
                      setPromoFormData({
                        code: '',
                        discount_type: 'flat',
                        discount_value: '',
                        min_order_amount: '299',
                        max_discount: '',
                        applicable_scope: 'all',
                        applicable_categories: [],
                        applicable_items: [],
                        valid_from: new Date().toISOString().slice(0, 10),
                        valid_until: '',
                        usage_limit: '',
                        is_active: true
                      });
                      setCustomCategoryInput('');
                      setCustomItemInput('');
                      setIsPromoModalOpen(true);
                    }}
                    className="w-full p-3 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/60 rounded-xl text-left text-xs text-purple-200 font-bold transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-400" />
                      <span>+ Create Promo Code</span>
                    </span>
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveNav('coins')}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>+ Adjust Health Coins</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('prescriptions')}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Review Prescriptions</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('payments')}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <PaymentIcon className="w-4 h-4 text-teal-400" />
                    <span>View Payments</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}



{/* NAV SECTION 2: ORDERS PAGE */}
        {activeNav === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {['ALL', 'COD', 'ONLINE', 'PAID', 'PENDING', 'FAILED', 'COMPLETED', 'CANCELLED'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => { setOrderFilter(chip); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-[11px] ${
                      orderFilter === chip
                        ? 'bg-purple-600 border-purple-500 text-white font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 text-[11px]">Showing {paginatedOrders.length} of {filteredOrders.length} orders</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-purple-300 font-extrabold border-b border-slate-700 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order Code</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items Purchased</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Order Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          {orders.length === 0 ? 'No orders yet.' : 'No transaction records found matching filter criteria.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((ord) => {
                        const payObj = ord.payments?.[0] || {};
                        const payMethod = (payObj.payment_method || ord.payment_method || 'ONLINE').toUpperCase();
                        const payMode = (payObj.payment_mode || ord.payment_mode || 'LIVE').toUpperCase();
                        const isCod = payMethod === 'COD' || payMode === 'COD';

                        return (
                          <tr key={ord.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 font-black text-purple-300 whitespace-nowrap cursor-pointer" onClick={() => setSelectedOrder(ord)}>
                              <div className="hover:underline flex items-center gap-1">
                                <span>{ord.order_code}</span>
                                <Eye className="w-3 h-3 text-purple-400" />
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {new Date(ord.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            </td>

                            <td className="p-4 cursor-pointer" onClick={() => handleOpenCustomer360(ord.patient_id)}>
                              <div className="font-extrabold text-white hover:text-purple-300 flex items-center gap-1">
                                <span>{ord.customer_name}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              </div>
                              <div className="text-[11px] text-slate-300 font-semibold">{ord.customer_phone}</div>
                            </td>

                            <td className="p-4 max-w-xs cursor-pointer" onClick={() => setSelectedOrder(ord)}>
                              <div className="space-y-1">
                                {Array.isArray(ord.items) && ord.items.map((it, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-300 truncate">
                                    • {it.name} <span className="text-purple-300 font-bold">({it.quantity}x)</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="p-4 font-black text-white text-sm whitespace-nowrap">
                              ₹{ord.total_amount}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              {isCod ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1">
                                  <Truck className="w-3 h-3" /> COD
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" /> ONLINE ({payMode})
                                </span>
                              )}
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                                ord.payment_status === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : ord.payment_status === 'FAILED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {ord.payment_status}
                              </span>
                            </td>

                            <td className="p-4 whitespace-nowrap">
                              <select
                                value={ord.order_status}
                                onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>

                            <td className="p-4 whitespace-nowrap space-x-2">
                              {isCod && ord.payment_status === 'PENDING' && (
                                <button
                                  onClick={() => setCodConfirmOrder(ord)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-[11px] cursor-pointer transition-colors shadow-xs"
                                >
                                  Mark COD Collected
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[11px] cursor-pointer transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalOrderPages > 1 && (
                <div className="p-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                  <div>Page <strong>{currentPage}</strong> of <strong>{totalOrderPages}</strong></div>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1 rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700 font-bold cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalOrderPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalOrderPages))}
                      className="px-3 py-1 rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700 font-bold cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        

{/* NAV SECTION 3: CUSTOMERS PAGE */}
        {activeNav === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
                <Filter className="w-3 h-3" /> Account Type:
              </span>
              {['ALL', 'REGISTERED', 'GUEST'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCustomerTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-[11px] ${
                    customerTypeFilter === type
                      ? 'bg-purple-600 border-purple-500 text-white font-black'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {type === 'ALL' ? 'All Customers' : type === 'REGISTERED' ? 'Registered Accounts' : 'Guest Profiles'}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-purple-300 font-extrabold border-b border-slate-700 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">City</th>
                      <th className="p-4">User Type</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          {patients.length === 0 ? 'No registered patients yet.' : 'No registered patients found matching search query.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((pat) => (
                        <tr key={pat.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 font-extrabold text-white cursor-pointer" onClick={() => handleOpenCustomer360(pat.id)}>
                            <div className="hover:text-purple-300 flex items-center gap-1">
                              <span>{pat.full_name}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-200">{pat.phone_e164}</td>
                          <td className="p-4 text-slate-300">{pat.email || '—'}</td>
                          <td className="p-4 text-slate-300">{pat.city || 'Bengaluru'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pat.user_id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}`}>
                              {pat.user_id ? 'REGISTERED USER' : 'GUEST PROFILE'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-[11px]">
                            {new Date(pat.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleOpenCustomer360(pat.id)}
                              className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-bold text-[11px] cursor-pointer transition-colors"
                            >
                              Customer 360° Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        

{/* NAV SECTION 4: PRESCRIPTIONS PAGE */}
        {activeNav === 'prescriptions' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-purple-300 font-extrabold border-b border-slate-700 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Enquiry Code</th>
                    <th className="p-4">Patient Info</th>
                    <th className="p-4">Notes / Requirement</th>
                    <th className="p-4">Uploaded Files</th>
                    <th className="p-4">Review Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-200">
                  {filteredPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        {prescriptions.length === 0 ? 'No prescriptions yet.' : 'No guest prescriptions found matching search query.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPrescriptions.map((enq) => {
                      const pat = enq.patients || {};
                      const files = enq.prescriptions || [];

                      return (
                        <tr key={enq.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 font-black text-amber-300 whitespace-nowrap">
                            <div>{enq.enquiry_code}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {new Date(enq.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-extrabold text-white">{pat.full_name || 'Guest Patient'}</div>
                            <div className="text-[11px] text-slate-300 font-semibold">{pat.phone_e164}</div>
                            {pat.city && <div className="text-[10px] text-slate-400">{pat.city}</div>}
                          </td>

                          <td className="p-4 max-w-xs">
                            <p className="text-slate-300 italic text-[11px]">
                              {enq.notes || 'No notes provided by patient.'}
                            </p>
                          </td>

                          <td className="p-4">
                            <div className="space-y-1">
                              {files.length === 0 ? (
                                <span className="text-slate-500 italic text-[11px]">No file attached</span>
                              ) : (
                                files.map((f, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                                    <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                    <span className="truncate max-w-[140px]">{f.file_name}</span>
                                    <button
                                      onClick={() => handleViewPrescriptionFile(f)}
                                      className="p-1 text-purple-300 hover:text-purple-100 cursor-pointer flex items-center gap-1 bg-purple-900/40 hover:bg-purple-800/60 px-1.5 py-0.5 rounded transition-colors"
                                      title="View / Download Secure File"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span className="text-[10px]">Open</span>
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <select
                              value={enq.status}
                              onChange={(e) => handleEnquiryStatusChange(enq.id, e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer uppercase"
                            >
                              <option value="pending_review">PENDING REVIEW</option>
                              <option value="contacted">CONTACTED</option>
                              <option value="completed">COMPLETED</option>
                            </select>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const msg = `Namaste ${pat.full_name || 'Patient'}! Health Express team received your prescription upload (Ref: ${enq.enquiry_code}). We are ready to assist with your lab tests/medicines.`;
                                openWhatsApp(msg);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>Contact Patient</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        

{/* NAV SECTION: OFFERS & PROMOTIONS */}
        {activeNav === 'promotions' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-400" />
                  <span>Promo Codes & Coupon Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create, edit, activate, or deactivate promotional coupons with explicit category or item eligibility scopes.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPromo(null);
                  setPromoFormData({
                    code: '',
                    discount_type: 'flat',
                    discount_value: '',
                    min_order_amount: '299',
                    max_discount: '',
                    applicable_scope: 'all',
                    applicable_categories: [],
                    applicable_items: [],
                    valid_from: new Date().toISOString().slice(0, 10),
                    valid_until: '',
                    usage_limit: '',
                    is_active: true
                  });
                  setCustomCategoryInput('');
                  setCustomItemInput('');
                  setIsPromoModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Promo Code</span>
              </button>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Applies To</th>
                      <th className="p-4">Min Order</th>
                      <th className="p-4">Usage</th>
                      <th className="p-4">Valid Until</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-400 italic">
                          No promo codes created yet. Click "Create Promo Code" to add a new offer.
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((p) => {
                        const scope = p.applicable_scope || 'all';
                        const cats = Array.isArray(p.applicable_categories) ? p.applicable_categories : (typeof p.applicable_categories === 'string' ? JSON.parse(p.applicable_categories || '[]') : []);
                        const itms = Array.isArray(p.applicable_items) ? p.applicable_items : (typeof p.applicable_items === 'string' ? JSON.parse(p.applicable_items || '[]') : []);

                        return (
                          <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="p-4 font-black text-purple-300 text-sm">{p.code}</td>
                            <td className="p-4 font-extrabold text-white">
                              {p.discount_type === 'flat' ? `₹${p.discount_value} OFF` : `${p.discount_value}% OFF`}
                              {p.max_discount ? ` (Max ₹${p.max_discount})` : ''}
                            </td>
                            <td className="p-4">
                              {scope === 'all' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-950/80 text-purple-300 border border-purple-800">
                                  All Products
                                </span>
                              )}
                              {scope === 'categories' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                                  {cats.length > 0 ? cats.slice(0, 2).join(', ') + (cats.length > 2 ? ` (+${cats.length - 2})` : '') : 'Categories'}
                                </span>
                              )}
                              {scope === 'items' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                                  {itms.length} Selected Services
                                </span>
                              )}
                            </td>
                            <td className="p-4">₹{p.min_order_amount || 0}</td>
                            <td className="p-4">
                              <span className="font-bold text-slate-200">
                                {p.used_count || 0} / {p.usage_limit || '∞'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">
                              {p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-IN') : 'Lifetime'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                p.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-400 border border-slate-600'
                              }`}>
                                {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleTogglePromoStatus(p.id, !p.is_active)}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                                  p.is_active ? 'bg-amber-950/80 text-amber-300 border border-amber-800' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {p.is_active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleOpenEditPromoModal(p)}
                                className="px-3 py-1 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePromo(p.id)}
                                className="px-3 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        

{/* NAV SECTION: HEALTH COINS & REWARDS */}
        {activeNav === 'coins' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-3xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Coins Issued</span>
                <p className="text-2xl font-black text-amber-400">
                  🪙 {walletTransactions.filter(t => t.coins > 0).reduce((acc, t) => acc + Number(t.coins), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Welcome rewards & credits</p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-3xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Coins Redeemed</span>
                <p className="text-2xl font-black text-rose-400">
                  🪙 {Math.abs(walletTransactions.filter(t => t.coins < 0).reduce((acc, t) => acc + Number(t.coins), 0)).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Redeemed on orders</p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-3xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Wallets</span>
                <p className="text-2xl font-black text-purple-300">{walletAccounts.length}</p>
                <p className="text-[10px] text-slate-400">Customer reward accounts</p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-3xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Liability (₹ Equivalent)</span>
                <p className="text-2xl font-black text-emerald-400">
                  ₹{Math.floor(walletAccounts.reduce((acc, w) => acc + Number(w.coin_balance || 0), 0) / (walletSettingsForm.coins_per_rupee || 10)).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Based on active balances</p>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">Health Coins Configuration Settings</h3>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
                  Live Global Rules
                </span>
              </div>

              <form onSubmit={handleSaveWalletSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-amber-300 mb-2">Enable Signup Reward</label>
                    <button
                      type="button"
                      onClick={() => setWalletSettingsForm({ ...walletSettingsForm, signup_reward_enabled: !walletSettingsForm.signup_reward_enabled })}
                      className={`w-full py-2.5 rounded-xl border font-black text-xs transition-all ${
                        walletSettingsForm.signup_reward_enabled ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {walletSettingsForm.signup_reward_enabled ? 'SIGNUP REWARD ON' : 'DISABLED'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">Signup Reward Coins</label>
                    <input
                      type="number"
                      required
                      value={walletSettingsForm.signup_reward_coins}
                      onChange={(e) => setWalletSettingsForm({ ...walletSettingsForm, signup_reward_coins: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">Coins per ₹1 Conversion Rate</label>
                    <input
                      type="number"
                      required
                      value={walletSettingsForm.coins_per_rupee}
                      onChange={(e) => setWalletSettingsForm({ ...walletSettingsForm, coins_per_rupee: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black text-xs"
                    />
                    <span className="text-[10px] text-slate-400 font-medium pt-1 block">e.g. 10 coins = ₹1</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      value={walletSettingsForm.minimum_order_amount}
                      onChange={(e) => setWalletSettingsForm({ ...walletSettingsForm, minimum_order_amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">Max Coins Per Order</label>
                    <input
                      type="number"
                      value={walletSettingsForm.maximum_coins_per_order}
                      onChange={(e) => setWalletSettingsForm({ ...walletSettingsForm, maximum_coins_per_order: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">Min Coins to Redeem</label>
                    <input
                      type="number"
                      value={walletSettingsForm.minimum_coins_to_redeem}
                      onChange={(e) => setWalletSettingsForm({ ...walletSettingsForm, minimum_coins_to_redeem: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-black text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-amber-300 mb-2">Allow Stacking with Promo</label>
                    <button
                      type="button"
                      onClick={() => setWalletSettingsForm({ ...walletSettingsForm, allow_stacking_with_promo: !walletSettingsForm.allow_stacking_with_promo })}
                      className={`w-full py-2.5 rounded-xl border font-black text-xs transition-all ${
                        walletSettingsForm.allow_stacking_with_promo ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {walletSettingsForm.allow_stacking_with_promo ? 'PROMO + COINS ALLOWED' : 'ONE DISCOUNT ONLY'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Save Wallet Settings
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">Customer Wallets & Balances</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Phone / WhatsApp</th>
                      <th className="p-4">Current Coins</th>
                      <th className="p-4">Rupee Equivalent</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {walletAccounts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 italic">No customer wallets created yet.</td>
                      </tr>
                    ) : (
                      walletAccounts.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-700/40 transition-colors">
                          <td className="p-4 font-bold text-white">{w.patients?.name || 'Customer'}</td>
                          <td className="p-4 text-slate-300">{w.patients?.phone || 'N/A'}</td>
                          <td className="p-4 font-black text-amber-400 text-sm">🪙 {Number(w.coin_balance || 0).toLocaleString()}</td>
                          <td className="p-4 font-bold text-emerald-400">₹{Math.floor(Number(w.coin_balance || 0) / (walletSettingsForm.coins_per_rupee || 10))}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedAdjustPatient(w.patients);
                                setIsAdjustModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-extrabold transition-colors cursor-pointer"
                            >
                              Adjust Balance
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        

{/* NAV SECTION 5: PAYMENTS PAGE */}
        {activeNav === 'payments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
                <Filter className="w-3 h-3" /> Payment Filter:
              </span>
              {['ALL', 'PAID', 'PENDING', 'FAILED', 'COD', 'ONLINE'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setPaymentFilter(chip)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-[11px] ${
                    paymentFilter === chip
                      ? 'bg-purple-600 border-purple-500 text-white font-black'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-purple-300 font-extrabold border-b border-slate-700 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Payment ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method & Mode</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Razorpay Identifiers</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-slate-200">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          {payments.length === 0 ? 'No payments yet.' : 'No payment records found matching filter.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 font-mono font-bold text-purple-300">{pay.id.substring(0, 8)}...</td>
                          <td className="p-4 font-bold text-white">{pay.patients?.full_name || pay.orders?.customer_name || 'Customer'}</td>
                          <td className="p-4 font-black text-white text-sm">₹{pay.amount}</td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-extrabold text-slate-200">
                              {pay.payment_method} ({pay.payment_mode})
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              pay.payment_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {pay.payment_status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-300">
                            <div>Order: {pay.razorpay_order_id}</div>
                            {pay.razorpay_payment_id && <div>Pay: {pay.razorpay_payment_id}</div>}
                          </td>
                          <td className="p-4 text-slate-400 text-[11px]">
                            {new Date(pay.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        

{/* NAV SECTION 6: ANALYTICS PAGE */}
        {activeNav === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 text-left space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  <span>Revenue & Order Conversion Analytics</span>
                </h3>
                <p className="text-xs text-slate-400">Calculated database telemetry for range: <strong className="text-purple-300">{dateRangeFilter}</strong></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                  <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">Revenue Breakdown</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">Online Paid Revenue</span>
                        <span className="text-emerald-300">₹{onlineRevenueCollected.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${totalRevenue > 0 ? (onlineRevenueCollected / totalRevenue) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">COD Collected Revenue</span>
                        <span className="text-purple-300">₹{codCollected.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${totalRevenue > 0 ? (codCollected / totalRevenue) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">COD Pending Balance</span>
                        <span className="text-amber-300">₹{codPendingCollection.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(codPendingCollection / (totalRevenue + codPendingCollection || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                  <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">Order Status Volumes</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <div className="text-xl font-black text-emerald-400">{successfulPaymentsCount}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Paid / Successful</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <div className="text-xl font-black text-amber-400">{pendingPaymentsCount}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pending</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <div className="text-xl font-black text-rose-400">{failedPaymentsCount}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Failed Payments</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <div className="text-xl font-black text-slate-300">{cancelledOrdersCount}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cancelled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        

{/* NAV SECTION 7: ACTIVITY LOGS */}
        {activeNav === 'activity' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 text-left space-y-4 shadow-xl">
            <div className="border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>System Activity Logs</span>
              </h3>
              <p className="text-xs text-slate-400">Non-PII Telemetry & User Event Logs</p>
            </div>

            {analyticsEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No system events logged yet.</p>
            ) : (
              <div className="space-y-2">
                {analyticsEvents.map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-purple-300">{evt.event_type}</span>
                      <div className="text-[10px] text-slate-400">Path: {evt.page_path || '/'} • Session: {evt.session_id}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      {new Date(evt.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        

{/* NAV SECTION 8: SYSTEM SETTINGS */}
        {activeNav === 'settings' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 text-left space-y-6 shadow-xl">
            {/* HEX AI AGENT PROVIDER & KEY MANAGEMENT CARD */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-5">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
                    <Key className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>HEX AI Agent API Key Management</span>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </h3>
                    <p className="text-[11px] text-slate-400">Select provider and enter API Key below to enable AI synthesis</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 border ${
                    geminiStatus.isOnline && geminiStatus.hasApiKey
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${geminiStatus.isOnline && geminiStatus.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {geminiStatus.engineType}
                  </span>
                </div>
              </div>

              {/* PROVIDER SELECTION TABS (GEMINI, CLAUDE, CHATGPT) */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-extrabold text-xs uppercase tracking-wider">
                  Select Active AI Engine Provider:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectProvider('gemini')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                      selectedAiProvider === 'gemini'
                        ? 'bg-purple-900/80 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Google Gemini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectProvider('anthropic')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                      selectedAiProvider === 'anthropic'
                        ? 'bg-purple-900/80 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Anthropic Claude</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectProvider('openai')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                      selectedAiProvider === 'openai'
                        ? 'bg-purple-900/80 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>OpenAI ChatGPT</span>
                  </button>
                </div>
              </div>

              {/* SINGLE API KEY INPUT FIELD FOR SELECTED PROVIDER */}
              <form onSubmit={handleSaveCurrentKey} className="space-y-4 text-xs pt-1 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-purple-400" />
                      <span>
                        {selectedAiProvider === 'gemini' && 'Google Gemini API Key *'}
                        {selectedAiProvider === 'anthropic' && 'Anthropic Claude API Key *'}
                        {selectedAiProvider === 'openai' && 'OpenAI / ChatGPT API Key *'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAiKeySecret(!showAiKeySecret)}
                      className="text-purple-400 hover:text-purple-300 text-[11px] flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {showAiKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAiKeySecret ? 'Hide Key' : 'Show Key'}</span>
                    </button>
                  </label>

                  {selectedAiProvider === 'gemini' && (
                    <input
                      type={showAiKeySecret ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Paste your Gemini API key (e.g. AIzaSy...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  )}

                  {selectedAiProvider === 'anthropic' && (
                    <input
                      type={showAiKeySecret ? "text" : "password"}
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                      placeholder="Paste your Anthropic Claude API key (e.g. sk-ant-...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  )}

                  {selectedAiProvider === 'openai' && (
                    <input
                      type={showAiKeySecret ? "text" : "password"}
                      value={chatgptKey}
                      onChange={(e) => setChatgptKey(e.target.value)}
                      placeholder="Paste your OpenAI / ChatGPT API key (e.g. sk-...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  )}
                </div>

                {/* TEST RESULT NOTIFICATION BOX */}
                {aiTestResult && (
                  <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 animate-in fade-in ${
                    aiTestResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  }`}>
                    {aiTestResult.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    <div className="space-y-0.5">
                      <div className="font-bold">{aiTestResult.success ? 'Diagnostic Test Passed!' : 'Connection Test Failed'}</div>
                      <p className="text-[11px] opacity-90">{aiTestResult.message || aiTestResult.error}</p>
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        Save {selectedAiProvider === 'gemini' ? 'Gemini' : selectedAiProvider === 'anthropic' ? 'Claude' : 'ChatGPT'} API Key
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestAiConnection}
                      disabled={isTestingAiConnection || !getCurrentProviderKey().trim()}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isTestingAiConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                      <span>{isTestingAiConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearCurrentKey}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Clear Key
                  </button>
                </div>
              </form>
            </div>

            <div className="border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>System & Security Configuration</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Database RBAC Active</span>
                </div>
                <p className="text-slate-400 text-[11px]">Enforced via public.check_is_admin() SECURITY DEFINER function.</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-extrabold text-purple-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Storage Bucket Protection</span>
                </div>
                <p className="text-slate-400 text-[11px]">Private prescriptions storage bucket using 300s signed URLs.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CREATE / EDIT PROMO MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden text-left space-y-0 my-8">
            <div className="p-5 bg-gradient-to-r from-purple-950 to-slate-900 border-b border-purple-800/40 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-lg font-black text-white">{editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}</h3>
                  <p className="text-xs text-purple-300 font-medium">Set scope eligibility, discount value & validity</p>
                </div>
              </div>
              <button onClick={() => setIsPromoModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Promo Code *</label>
                <input
                  type="text"
                  required
                  value={promoFormData.code}
                  onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., LABTEST20"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-black uppercase text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* APPLIES TO / ELIGIBILITY SCOPE SECTION */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-purple-300 font-extrabold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Layers3 className="w-4 h-4 text-purple-400" />
                  <span>Applies To / Eligibility Scope *</span>
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPromoFormData({ ...promoFormData, applicable_scope: 'all' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      promoFormData.applicable_scope === 'all'
                        ? 'bg-purple-900/80 border-purple-500 text-white font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Entire Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => setPromoFormData({ ...promoFormData, applicable_scope: 'categories' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      promoFormData.applicable_scope === 'categories'
                        ? 'bg-purple-900/80 border-purple-500 text-white font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Categories
                  </button>

                  <button
                    type="button"
                    onClick={() => setPromoFormData({ ...promoFormData, applicable_scope: 'items' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      promoFormData.applicable_scope === 'items'
                        ? 'bg-purple-900/80 border-purple-500 text-white font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Specific Services
                  </button>
                </div>

                {/* Specific Categories Picker + Dynamic Custom Category Write-In */}
                {promoFormData.applicable_scope === 'categories' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Select or Add Eligible Categories:</span>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                      {allDynamicCategories.map((catName) => {
                        const isChecked = promoFormData.applicable_categories.includes(catName);
                        return (
                          <label key={catName} className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-purple-600">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategorySelection(catName)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-xs font-bold text-white truncate">{catName}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* DYNAMIC CUSTOM CATEGORY WRITE-IN INPUT */}
                    <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Add new custom category (e.g. Teleconsultation)..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        disabled={!customCategoryInput.trim()}
                        className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 disabled:opacity-40 text-purple-200 text-xs font-bold transition-colors shrink-0"
                      >
                        + Add Category
                      </button>
                    </div>
                  </div>
                )}

                {/* Specific Services Picker + Dynamic Custom Product ID Write-In */}
                {promoFormData.applicable_scope === 'items' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Select or Add Eligible Services:</span>
                      <input
                        type="text"
                        value={promoSearchItem}
                        onChange={(e) => setPromoSearchItem(e.target.value)}
                        placeholder="Filter catalog..."
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-white"
                      />
                    </div>

                    <div className="space-y-1 max-h-44 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-900">
                      {ALL_SERVICES.filter((s) => !promoSearchItem || s.name.toLowerCase().includes(promoSearchItem.toLowerCase())).map((service) => {
                        const serviceKey = service.id || service.slug;
                        const isChecked = promoFormData.applicable_items.includes(serviceKey);
                        return (
                          <label key={serviceKey} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300">
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItemSelection(serviceKey)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-xs font-semibold text-white">{service.name}</span>
                            </span>
                            <span className="text-[10px] font-bold text-purple-400">₹{service.discount_price || service.price}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* DYNAMIC CUSTOM SERVICE / PRODUCT ID WRITE-IN INPUT */}
                    <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                      <input
                        type="text"
                        value={customItemInput}
                        onChange={(e) => setCustomItemInput(e.target.value)}
                        placeholder="Add new custom service/product ID (e.g. mri-brain)..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomItem}
                        disabled={!customItemInput.trim()}
                        className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 disabled:opacity-40 text-purple-200 text-xs font-bold transition-colors shrink-0"
                      >
                        + Add Service ID
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Type *</label>
                  <select
                    value={promoFormData.discount_type}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="flat">Flat Discount (₹)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promoFormData.discount_value}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discount_value: e.target.value })}
                    placeholder={promoFormData.discount_type === 'flat' ? '50 (₹)' : '10 (%)'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-extrabold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={promoFormData.min_order_amount}
                    onChange={(e) => setPromoFormData({ ...promoFormData, min_order_amount: e.target.value })}
                    placeholder="299"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={promoFormData.max_discount}
                    onChange={(e) => setPromoFormData({ ...promoFormData, max_discount: e.target.value })}
                    placeholder={promoFormData.discount_type === 'percentage' ? '200 (Required for %)' : 'Optional'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={promoFormData.valid_until ? promoFormData.valid_until.slice(0, 10) : ''}
                    onChange={(e) => setPromoFormData({ ...promoFormData, valid_until: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={promoFormData.usage_limit}
                    onChange={(e) => setPromoFormData({ ...promoFormData, usage_limit: e.target.value })}
                    placeholder="e.g., 500 (Blank = ∞)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={promoFormData.is_active}
                  onChange={(e) => setPromoFormData({ ...promoFormData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_active_toggle" className="text-slate-200 font-bold">Promo Code Active Immediately</label>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingPromo ? 'Update Promo Code' : 'Save & Publish Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST HEALTH COINS BALANCE MODAL */}
      {isAdjustModalOpen && selectedAdjustPatient && (
        <div className="fixed inset-0 z-[250000] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Adjust Customer Health Coins</span>
              </h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>Customer: <strong className="text-white font-bold">{selectedAdjustPatient.name || 'Member'}</strong></p>
              <p>Phone: <span className="text-purple-300 font-mono">{selectedAdjustPatient.phone || 'N/A'}</span></p>
            </div>

            <form onSubmit={handleExecuteAdjustCoins} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Adjustment Action *</label>
                <select
                  value={adjustFormData.type}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none"
                >
                  <option value="admin_credit">+ Add Coins (Admin Credit)</option>
                  <option value="admin_debit">- Deduct Coins (Admin Debit)</option>
                  <option value="adjustment">Manual Balance Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Number of Coins *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustFormData.coins}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, coins: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reason / Support Note *</label>
                <textarea
                  required
                  rows="3"
                  value={adjustFormData.description}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, description: e.target.value })}
                  placeholder="e.g., Customer Support Adjustment for delayed sample collection"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Dashboard rendering error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-950 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Ops Control Runtime Exception</h3>
              <p className="text-xs text-slate-400 mt-1">
                A non-fatal interface rendering error occurred while updating the telemetry view.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-950 rounded-xl text-left border border-slate-800 font-mono text-[11px] text-rose-300 break-words">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-purple-900/30"
            >
              Reload Admin Control Center
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminDashboardPageWithErrorBoundary() {
  return (
    <AdminErrorBoundary>
      <AdminDashboardPage />
    </AdminErrorBoundary>
  );
}
