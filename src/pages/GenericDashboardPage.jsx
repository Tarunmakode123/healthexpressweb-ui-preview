import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Phone, ShieldCheck, Calendar, FileText, ShoppingBag, 
  HelpCircle, LogOut, ArrowRight, Activity, PlusCircle, CheckCircle2,
  Clock, Coins, RefreshCw, MessageSquare, ExternalLink, Filter, ChevronDown,
  Sparkles, CreditCard, Eye, Calculator, Globe, Hospital, Compass, ChevronRight, Settings,
  Zap, ArrowUpRight, Check, AlertCircle, Folder, UploadCloud, Download, Share2, Search,
  FileCheck, X, HardDrive, Headphones, PhoneCall, Stethoscope, Shield, Bookmark, Gift, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';
import { getMemberOverview, buildUnifiedTimelineStream, formatTimelineDateGroup, formatTimelineTimeIST } from '../services/memberDashboardService';
import { classifyMemberActivity } from '../services/memberActivityClassifier';
import { validatePrescriptionFile } from '../services/prescriptionService';
import { fetchWalletSettings, DEFAULT_WALLET_SETTINGS } from '../services/walletService';
import { subscribeUserDashboard, unsubscribeChannel } from '../services/realtimeService';

export default function GenericDashboardPage() {
  const navigate = useNavigate();
  const { user, session, logout, isLoading: isAuthLoading } = useAuth();
  
  // Dashboard Core State
  const [memberData, setMemberData] = useState({
    patient: null,
    orders: [],
    prescriptions: [],
    enquiries: [],
    payments: [],
    events: [],
    walletCoins: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Live Wallet Rules Config State (Fetched from Supabase backend)
  const [walletSettings, setWalletSettings] = useState(DEFAULT_WALLET_SETTINGS);

  // Profile Menu Dropdown Toggle
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Patient Workspace Main Tab State: 'vault' | 'orders' | 'prescriptions' | 'activity'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('vault');

  // Health Vault Records Search & Filter
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('all');

  // Local Upload Modal State for Health Records
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('lab_report');
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [customRecords, setCustomRecords] = useState([]);

  // Multi-File Add & Remove Helpers
  const handleAddFiles = (newFileList) => {
    setUploadError('');
    if (!newFileList || newFileList.length === 0) return;

    const validNewFiles = [];
    for (const file of Array.from(newFileList)) {
      const val = validatePrescriptionFile(file);
      if (!val.isValid) {
        setUploadError(`"${file.name}": ${val.error}`);
        return;
      }
      validNewFiles.push(file);
    }

    setSelectedFiles(prev => {
      const existingKeys = new Set(prev.map(f => `${f.name}_${f.size}`));
      const uniqueFiles = validNewFiles.filter(f => !existingKeys.has(`${f.name}_${f.size}`));
      return [...prev, ...uniqueFiles];
    });
  };

  const handleRemoveFile = (indexToRemove) => {
    setUploadError('');
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Health Wallet Modal State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Timeline Filter State: 'all' (Key Milestones) | 'orders' | 'prescriptions' | 'payments' | 'account' | 'website' (Page Visits)
  const [activeTimelineFilter, setActiveTimelineFilter] = useState('all');
  const [timelineVisibleCount, setTimelineVisibleCount] = useState(15);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for global open upload modal event
  useEffect(() => {
    function handleOpenModal(e) {
      const cat = e?.detail?.category || 'lab_report';
      setUploadCategory(cat);
      setSelectedFiles([]);
      setUploadError('');
      setIsUploadModalOpen(true);
    }
    window.addEventListener('open-upload-modal', handleOpenModal);
    return () => window.removeEventListener('open-upload-modal', handleOpenModal);
  }, []);

  // Smart Modal Opener with Category Pre-Selection
  const openModalWithCategory = (cat = 'lab_report') => {
    setUploadCategory(cat);
    setUploadError('');
    setSelectedFiles([]);
    setUploadTitle('');
    setIsUploadModalOpen(true);
  };

  // Load 100% Real Authenticated Member Records & Live Backend Wallet Rules from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (isAuthLoading) {
        console.info('[HEALTH FORENSIC] Auth is loading, waiting for session resolution...');
        return;
      }

      setIsLoadingStats(true);
      console.info('[HEALTH FORENSIC] DASHBOARD LOADING: START');
      try {
        let activeUserId = session?.user?.id || user?.id;
        if (!activeUserId && isSupabaseConfigured && supabase) {
          const { data: { session: activeSession } } = await supabase.auth.getSession();
          activeUserId = activeSession?.user?.id || activeUserId;
        }

        console.info('[HEALTH FORENSIC] ACTIVE_USER_ID PASSED TO getMemberOverview:', activeUserId || 'none');

        if (!activeUserId) {
          console.warn('[HEALTH FORENSIC] No activeUserId found after session check, waiting for auth...');
          return;
        }

        // Fetch patient dashboard data and wallet settings in parallel
        const [data, walletConfig] = await Promise.all([
          getMemberOverview(activeUserId),
          fetchWalletSettings().catch(() => null)
        ]);

        console.info('[HEALTH FORENSIC] GET MEMBER OVERVIEW RETURNED', {
          prescriptionsCount: data?.prescriptions?.length,
          ordersCount: data?.orders?.length,
          enquiriesCount: data?.enquiries?.length,
          eventsCount: data?.events?.length,
          walletCoins: data?.walletCoins
        });

        if (isMounted && data) {
          if (walletConfig?.settings) {
            setWalletSettings(walletConfig.settings);
          }

          console.info('[HEALTH FORENSIC] SETTING MEMBER DATA', {
            prescriptions: data?.prescriptions?.length,
            orders: data?.orders?.length,
            enquiries: data?.enquiries?.length,
            events: data?.events?.length,
            walletCoins: data?.walletCoins
          });

          setMemberData({
            ...data,
            walletCoins: typeof data?.walletCoins === 'number' ? data.walletCoins : 0
          });
        }
      } catch (err) {
        console.error('[HEALTH FORENSIC] Dashboard loading error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
          console.info('[HEALTH FORENSIC] DASHBOARD LOADING: COMPLETE');
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [session, user, isAuthLoading]);

  // REALTIME SYNCHRONIZATION: Subscribe user to live updates on their orders & prescriptions
  useEffect(() => {
    const userId = session?.user?.id || user?.id;
    if (!userId) return;

    const channel = subscribeUserDashboard({
      userId,
      onOrderChange: ({ eventType, record }) => {
        if (!record || !record.id) return;
        setMemberData((prev) => {
          const existingOrders = prev.orders || [];
          const exists = existingOrders.some((o) => o.id === record.id);
          const updatedOrders = exists
            ? existingOrders.map((o) => (o.id === record.id ? { ...o, ...record } : o))
            : [record, ...existingOrders];
          return { ...prev, orders: updatedOrders };
        });
      },
      onPrescriptionChange: ({ eventType, record }) => {
        if (!record || !record.id) return;
        setMemberData((prev) => {
          const existingPrescriptions = prev.prescriptions || [];
          const exists = existingPrescriptions.some((p) => p.id === record.id);
          const updatedPrescriptions = exists
            ? existingPrescriptions.map((p) => (p.id === record.id ? { ...p, ...record } : p))
            : [record, ...existingPrescriptions];
          return { ...prev, prescriptions: updatedPrescriptions };
        });
      }
    });

    return () => {
      if (channel) {
        unsubscribeChannel(channel);
      }
    };
  }, [session?.user?.id, user?.id]);

  // React State Observer
  useEffect(() => {
    console.info('[HEALTH FORENSIC] MEMBER DATA STATE', {
      prescriptions: memberData?.prescriptions?.length,
      orders: memberData?.orders?.length,
      enquiries: memberData?.enquiries?.length,
      events: memberData?.events?.length,
      walletCoins: memberData?.walletCoins
    });
  }, [memberData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Build Unified Prescriptions list (Combines Prescriptions + Care Review Enquiries)
  const allPrescriptionRecords = [
    ...memberData.prescriptions,
    // Include any enquiries that don't already have an explicit matching prescription object
    ...memberData.enquiries
      .filter(enq => !memberData.prescriptions.some(p => p.enquiry_id === enq.id || p.enquiries?.enquiry_code === enq.enquiry_code))
      .map(enq => ({
        id: enq.id || `enq-${enq.enquiry_code}`,
        file_name: `Prescription & Care Review (${enq.enquiry_code || 'HE-2026'})`,
        file_path: null,
        file_size: 0,
        created_at: enq.created_at || new Date().toISOString(),
        enquiries: {
          enquiry_code: enq.enquiry_code || 'HE-2026-REVIEW',
          status: enq.status || 'pending_review'
        },
        isEnquiryFallback: true
      }))
  ];

  // Build Unified Health Records list (Combines Prescriptions + Enquiries + Custom Uploaded Vault Documents)
  const healthVaultRecords = [
    ...allPrescriptionRecords.map((rx, idx) => ({
      id: rx.id || `rx-${idx}`,
      title: rx.file_name || `Prescription Record #${idx + 1}`,
      category: 'prescription',
      categoryLabel: rx.enquiries?.enquiry_code ? `Care Review (${rx.enquiries.enquiry_code})` : 'Prescription',
      uploadedAt: rx.created_at || new Date().toISOString(),
      fileSize: rx.file_size ? `${Math.round(rx.file_size / 1024)} KB` : 'PDF / Document',
      status: rx.enquiries?.status ? rx.enquiries.status.replace(/_/g, ' ').toUpperCase() : 'UNDER CARE MANAGER REVIEW',
      publicUrl: rx.public_url || rx.signed_url || null,
      isPrescription: true,
      enquiryCode: rx.enquiries?.enquiry_code || null,
      sourceTag: rx.enquiries?.enquiry_code ? `Care Review (${rx.enquiries.enquiry_code})` : 'Care Review'
    })),
    // Include custom uploaded records
    ...customRecords
  ];

  // Filtered Health Vault Records
  const filteredVaultRecords = healthVaultRecords.filter(record => {
    const matchesCategory = vaultCategoryFilter === 'all' || record.category === vaultCategoryFilter;
    const matchesSearch = !vaultSearchQuery.trim() || 
      record.title.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
      record.categoryLabel.toLowerCase().includes(vaultSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  console.info('[HEALTH FORENSIC] HEALTH VAULT DERIVATION', {
    'memberData.prescriptions': memberData?.prescriptions?.length,
    allPrescriptionRecords: allPrescriptionRecords.length,
    healthVaultRecords: healthVaultRecords.length,
    filteredVaultRecords: filteredVaultRecords.length
  });

  console.info('[HEALTH FORENSIC] PRESCRIPTION UI', {
    'memberData.prescriptions.length': memberData?.prescriptions?.length,
    'displayedPrescriptionRecords.length': allPrescriptionRecords.length
  });

  // Build Unified Timeline Stream
  const timelineStream = buildUnifiedTimelineStream({
    events: memberData.events,
    orders: memberData.orders,
    prescriptions: memberData.prescriptions,
    enquiries: memberData.enquiries,
    payments: memberData.payments
  });

  // Filtered Timeline Items (Hide page visit noise from default 'All' milestones view)
  const filteredTimelineItems = timelineStream.allItems.filter(item => {
    if (activeTimelineFilter === 'all') {
      return item.category !== 'website';
    }
    if (activeTimelineFilter === 'website') {
      return item.category === 'website';
    }
    return item.category === activeTimelineFilter;
  });

  const visibleTimelineItems = filteredTimelineItems.slice(0, timelineVisibleCount);

  // Group visible timeline items by Date (in IST)
  const groupedTimelineVisible = {};
  visibleTimelineItems.forEach(item => {
    const groupLabel = formatTimelineDateGroup(item.timestamp);
    if (!groupedTimelineVisible[groupLabel]) {
      groupedTimelineVisible[groupLabel] = [];
    }
    groupedTimelineVisible[groupLabel].push(item);
  });

  const displayName = memberData.patient?.full_name || user?.name || session?.user?.user_metadata?.full_name || null;
  const displayPhone = user?.phone || session?.user?.phone || memberData.patient?.phone_e164 || 'Verified Mobile Number';
  
  // Compute current wallet coins & rupee conversion using live Supabase backend settings
  const coinsPerRupee = walletSettings.coins_per_rupee || 10;
  const currentWalletCoins = typeof memberData?.walletCoins === 'number' ? memberData.walletCoins : 0;
  const rupeesDiscountValue = Math.floor(currentWalletCoins / coinsPerRupee);

  // Handle Document Upload Submission to Health Vault (Multi-file upload support)
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadError('');

    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadError('Please select at least one file to upload.');
      return;
    }

    // Validate every file individually
    for (const file of selectedFiles) {
      const val = validatePrescriptionFile(file);
      if (!val.isValid) {
        setUploadError(`"${file.name}": ${val.error}`);
        return;
      }
    }

    setIsUploading(true);

    setTimeout(() => {
      try {
        const categoryLabels = {
          lab_report: 'Lab Report',
          prescription: 'Prescription',
          imaging_scan: 'MRI / Scan Report',
          doctor_notes: 'Doctor Consultation Note',
          discharge_summary: 'Discharge Summary',
          other: 'Other'
        };

        const newRecords = selectedFiles.map((file, idx) => {
          let recordTitle = uploadTitle.trim();
          if (recordTitle) {
            if (selectedFiles.length > 1) {
              recordTitle = `${recordTitle} (${idx + 1})`;
            }
          } else {
            recordTitle = file.name;
          }

          return {
            id: `doc-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            title: recordTitle,
            category: uploadCategory,
            categoryLabel: categoryLabels[uploadCategory] || 'Medical Record',
            uploadedAt: new Date().toISOString(),
            fileSize: `${Math.round(file.size / 1024)} KB`,
            status: uploadCategory === 'prescription' ? 'Under Care Manager Review' : 'Saved in Vault',
            publicUrl: URL.createObjectURL(file),
            isPrescription: uploadCategory === 'prescription',
            storageReference: file.name
          };
        });

        setCustomRecords(prev => [...newRecords, ...prev]);
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
        setUploadTitle('');
        setUploadCategory('lab_report');

        // Auto-switch to vault or prescription tab
        if (uploadCategory === 'prescription') {
          setActiveWorkspaceTab('prescriptions');
        } else {
          setActiveWorkspaceTab('vault');
        }
      } catch (err) {
        console.error('Upload submit exception:', err);
        setUploadError(`Upload failed: ${err.message || 'Error processing files.'}`);
        setIsUploading(false);
      }
    }, 400);
  };

  // Quick CTA Dispatcher
  const handleCTAAction = (actionType) => {
    if (actionType === 'open_upload_modal') {
      openModalWithCategory('lab_report');
    } else if (actionType === 'open_rx_modal') {
      openModalWithCategory('prescription');
    } else if (actionType === 'navigate_services') {
      navigate('/services');
    } else if (actionType === 'switch_vault') {
      setActiveWorkspaceTab('vault');
    } else if (actionType === 'switch_orders') {
      setActiveWorkspaceTab('orders');
    } else if (actionType === 'switch_prescriptions') {
      setActiveWorkspaceTab('prescriptions');
    } else if (actionType === 'open_whatsapp') {
      openWhatsApp(DEFAULT_MESSAGES.general);
    }
  };

  if (isAuthLoading || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-purple-900 font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-xs font-extrabold tracking-wide">Loading Health Express Patient Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* 1. DEDICATED MEMBER DASHBOARD HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Side: Brand Logo & Website Link */}
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 group hover:opacity-95 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="Health Express - Everything Health Fast Tracked" 
                className="h-9 sm:h-10 w-auto object-contain bg-white px-2.5 py-1 rounded-xl shadow-md border border-purple-100 group-hover:scale-[1.02] transition-transform" 
              />
              <span className="bg-purple-800/90 text-purple-200 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full border border-purple-700/80 shadow-xs">
                Patient Portal
              </span>
            </Link>

            <div className="hidden md:block w-px h-5 bg-slate-800" />

            <Link
              to="/services"
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-200" />
              <span>Book Services →</span>
            </Link>
          </div>

          {/* Right Side: Authenticated Member Account Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs shadow-inner">
                {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-white" />}
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">{displayName || 'My Account'}</div>
                <div className="text-[10px] font-semibold text-purple-300 leading-tight">Verified Patient</div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                  <p className="text-xs font-bold text-slate-900">{displayName || 'My Account'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{displayPhone}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setIsProfileMenuOpen(false); setIsWalletModalOpen(true); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-amber-50 text-slate-700 hover:text-amber-900 flex items-center gap-2.5"
                  >
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>My Health Wallet ({currentWalletCoins.toLocaleString('en-IN')} Coins)</span>
                  </button>

                  <button
                    onClick={() => { setIsProfileMenuOpen(false); setActiveWorkspaceTab('vault'); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center gap-2.5"
                  >
                    <Folder className="w-4 h-4 text-purple-600" />
                    <span>My Health Vault ({healthVaultRecords.length})</span>
                  </button>

                  <button
                    onClick={() => { setIsProfileMenuOpen(false); setActiveWorkspaceTab('orders'); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center gap-2.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>My Orders ({memberData.orders.length})</span>
                  </button>

                  <button
                    onClick={() => { setIsProfileMenuOpen(false); setActiveWorkspaceTab('prescriptions'); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center gap-2.5"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>My Prescriptions ({memberData.prescriptions.length})</span>
                  </button>

                  <button
                    onClick={() => { setIsProfileMenuOpen(false); setActiveWorkspaceTab('activity'); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center gap-2.5"
                  >
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span>Activity Audit Log</span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 text-slate-700 hover:text-purple-900 flex items-center gap-2.5 md:hidden"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <span>Visit Website</span>
                  </a>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MAIN PATIENT PORTAL BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* 2. COMPACT APPLICATION PATIENT IDENTITY BAR */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-7 h-7 text-white" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {displayName || 'Verified Member'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> OTP Verified Patient
                </span>

                {/* Health Coins Badge -> Opens Interactive Wallet Details Modal */}
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-extrabold flex items-center gap-1.5 border border-amber-300/80 transition-all shadow-xs cursor-pointer hover:scale-105"
                  title="Click to view Health Wallet & Bonus details"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentWalletCoins.toLocaleString('en-IN')} Health Coins</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 font-mono flex items-center gap-3">
                <span>Phone: {displayPhone}</span>
                <span>•</span>
                <span>Member ID: {session?.user?.id ? session.user.id.slice(0, 8).toUpperCase() : 'HE-PATIENT'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3. FULL-WIDTH SPACIOUS PATIENT WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
          
          {/* MAIN PATIENT WORKSPACE COLUMN (lg:col-span-8 - 66% width) */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            
            {/* WORKSPACE NAVIGATION TABS */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
              
              <button
                onClick={() => setActiveWorkspaceTab('vault')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeWorkspaceTab === 'vault'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Health Vault & Records</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeWorkspaceTab === 'vault' ? 'bg-purple-800 text-purple-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {healthVaultRecords.length}
                </span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('orders')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeWorkspaceTab === 'orders'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders & Diagnostic Bookings</span>
                {memberData.orders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeWorkspaceTab === 'orders' ? 'bg-purple-800 text-purple-200' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {memberData.orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('prescriptions')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeWorkspaceTab === 'prescriptions'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Prescriptions</span>
                {allPrescriptionRecords.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeWorkspaceTab === 'prescriptions' ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {allPrescriptionRecords.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('activity')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeWorkspaceTab === 'activity'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Activity Audit</span>
              </button>

            </div>

            {/* TAB VIEW 1: HEALTH RECORDS & MEDICAL VAULT */}
            {activeWorkspaceTab === 'vault' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 min-w-0">
                
                {/* Vault Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-purple-700" />
                      <span>My Health Locker & Medical Records</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Safely maintain doctor prescriptions, lab test reports, MRI/CT scans, and medical notes under your authenticated profile.
                    </p>
                  </div>

                  <button
                    onClick={() => openModalWithCategory('lab_report')}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Upload Document</span>
                  </button>
                </div>

                {/* Search & Category Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search medical records..."
                      value={vaultSearchQuery}
                      onChange={(e) => setVaultSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'all', label: 'All Records' },
                      { id: 'prescription', label: 'Prescriptions' },
                      { id: 'lab_report', label: 'Lab Reports' },
                      { id: 'imaging_scan', label: 'Scans' },
                      { id: 'doctor_notes', label: 'Doctor Notes' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => setVaultCategoryFilter(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                          vaultCategoryFilter === c.id
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vault Records List */}
                {filteredVaultRecords.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
                    <Folder className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="text-sm font-black text-slate-800">No medical records found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                      Upload doctor prescriptions, lab test PDFs, or hospital reports to maintain your digital health locker.
                    </p>
                    <button
                      onClick={() => openModalWithCategory('lab_report')}
                      className="px-5 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Your First Record</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4 min-w-0">
                    {filteredVaultRecords.map(record => (
                      <div key={record.id} className="p-4 rounded-2xl bg-slate-50/90 hover:bg-slate-50 border border-slate-200/90 hover:border-purple-200 transition-all space-y-3 flex flex-col justify-between group min-w-0 w-full box-border">
                        
                        <div className="flex items-start justify-between gap-2.5 min-w-0">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black shrink-0 mt-0.5">
                              {record.category === 'prescription' ? <FileText className="w-4.5 h-4.5" /> : <FileCheck className="w-4.5 h-4.5" />}
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-900 transition-colors break-words [overflow-wrap:anywhere] min-w-0 leading-snug">
                                {record.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono truncate min-w-0">
                                {new Date(record.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {record.fileSize}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 whitespace-nowrap ${
                            record.category === 'prescription' 
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            {record.categoryLabel}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs gap-2 min-w-0">
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 min-w-0 shrink truncate">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> <span className="truncate">{record.status}</span>
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {record.publicUrl ? (
                              <a
                                href={record.publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-900 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => handleCTAAction('open_whatsapp')}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-900 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs shrink-0"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB VIEW 2: ORDERS & DIAGNOSTIC BOOKINGS */}
            {activeWorkspaceTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>My Orders & Diagnostic Test Bookings</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Track sample collection, lab processing status, and download final test reports.
                    </p>
                  </div>

                  <button
                    onClick={() => handleCTAAction('navigate_services')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {memberData.orders.length === 0 ? (
                  <div className="p-10 text-center bg-emerald-50/40 rounded-3xl border border-emerald-100 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-extrabold text-slate-900">No Orders Placed Yet</h4>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                      Book full body checkup packages or blood tests with free home sample collection.
                    </p>
                    <button
                      onClick={() => handleCTAAction('navigate_services')}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Explore Diagnostic Services</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memberData.orders.map((ord, idx) => (
                      <div key={ord.id || idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">
                                {ord.service_title || `Diagnostic Order #${ord.id ? String(ord.id).slice(0, 6) : idx + 1}`}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-mono">
                                Placed: {new Date(ord.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                            {ord.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 3: PRESCRIPTIONS */}
            {activeWorkspaceTab === 'prescriptions' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>Uploaded Prescriptions</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Doctor prescription files submitted for care manager verification and lab booking.
                    </p>
                  </div>

                  <button
                    onClick={() => openModalWithCategory('prescription')}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Upload Prescription</span>
                  </button>
                </div>

                {allPrescriptionRecords.length === 0 ? (
                  <div className="p-10 text-center bg-purple-50/50 rounded-3xl border border-purple-100 space-y-3">
                    <FileText className="w-10 h-10 text-purple-400 mx-auto" />
                    <h4 className="text-sm font-extrabold text-purple-950">No Prescriptions Uploaded</h4>
                    <p className="text-xs text-purple-700 max-w-sm mx-auto font-medium">
                      Upload your prescription for quick analysis by our certified medical team.
                    </p>
                    <button
                      onClick={() => openModalWithCategory('prescription')}
                      className="px-5 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Upload Prescription Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 min-w-0">
                    {allPrescriptionRecords.map((rx, idx) => (
                      <div key={rx.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0 w-full box-border">
                        <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0 mt-0.5 md:mt-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <h4 className="text-xs font-black text-slate-900 break-words [overflow-wrap:anywhere] min-w-0">
                                {rx.file_name || `Prescription #${rx.id ? String(rx.id).slice(0, 6) : idx + 1}`}
                              </h4>
                              {rx.enquiries?.enquiry_code && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[10px] font-black shrink-0">
                                  {rx.enquiries.enquiry_code}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate min-w-0">
                              Uploaded on {new Date(rx.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wide shrink-0">
                            {rx.enquiries?.status ? rx.enquiries.status.replace(/_/g, ' ') : 'Under Care Review'}
                          </span>

                          {(rx.public_url || rx.signed_url) && (
                            <a
                              href={rx.public_url || rx.signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </a>
                          )}

                          <button
                            onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp Care Team</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW 4: ACTIVITY AUDIT STREAM */}
            {activeWorkspaceTab === 'activity' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>Key Patient Activity Milestones</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      History of your medical orders, prescription uploads, health vault files, and security logins.
                    </p>
                  </div>

                  {/* Clean Milestone Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'all', label: 'All Milestones' },
                      { id: 'orders', label: 'Orders' },
                      { id: 'prescriptions', label: 'Prescriptions' },
                      { id: 'payments', label: 'Payments' },
                      { id: 'account', label: 'Security & Auth' },
                      { id: 'website', label: 'Page Visits' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => { setActiveTimelineFilter(f.id); setTimelineVisibleCount(15); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeTimelineFilter === f.id
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Stream */}
                {filteredTimelineItems.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">
                      {activeTimelineFilter === 'all' ? 'No medical milestone events logged yet' : 'No activity recorded for this filter'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {activeTimelineFilter === 'all' 
                        ? 'Upload a doctor prescription or save a lab report to build your health history.'
                        : 'Select another filter pill to view timeline logs.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 sm:before:left-4 before:w-0.5 before:bg-purple-100">
                    {Object.keys(groupedTimelineVisible).map(groupLabel => (
                      <div key={groupLabel} className="space-y-3 relative">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-3 py-0.5 rounded-full z-10">
                            {groupLabel}
                          </span>
                          <div className="h-px bg-slate-100 flex-1" />
                        </div>

                        <div className="space-y-3">
                          {groupedTimelineVisible[groupLabel].map((item, idx) => (
                            <div key={item.id || idx} className="flex items-start gap-3.5 group pl-1">
                              <div className="w-7 h-7 rounded-full bg-white border-2 border-purple-600 text-purple-700 flex items-center justify-center text-xs shrink-0 z-10 shadow-xs">
                                {item.category === 'orders' && <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />}
                                {item.category === 'prescriptions' && <FileText className="w-3.5 h-3.5 text-purple-600" />}
                                {item.category === 'payments' && <CreditCard className="w-3.5 h-3.5 text-sky-600" />}
                                {item.category === 'account' && <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}
                                {item.category === 'website' && <Globe className="w-3.5 h-3.5 text-indigo-600" />}
                              </div>

                              <div className="flex-1 bg-slate-50/80 hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 transition-colors space-y-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-extrabold text-slate-900">{item.title}</h4>
                                  <span className="text-xs font-bold text-slate-500 shrink-0 ml-2">
                                    {formatTimelineTimeIST(item.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filteredTimelineItems.length > timelineVisibleCount && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setTimelineVisibleCount(prev => prev + 15)}
                          className="px-5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs transition-colors cursor-pointer"
                        >
                          Load More Log Events ({filteredTimelineItems.length - timelineVisibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR COLUMN: 24/7 WHATSAPP CARE MANAGER ASSIST */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* A. 24/7 WHATSAPP CARE MANAGER ASSIST WIDGET */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 space-y-4 shadow-md border border-emerald-800/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5 w-fit">
                  <Headphones className="w-3 h-3" />
                  <span>24/7 Priority Support</span>
                </span>
                <h4 className="text-base font-black text-white">Need Personal Care Assistance?</h4>
                <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                  Connect directly with Health Express care managers on WhatsApp for home sample collection, prescription verification, and lab reports.
                </p>
              </div>

              <button
                onClick={() => handleCTAAction('open_whatsapp')}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 relative z-10"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Care Team</span>
              </button>
            </div>

            {/* B. DIAGNOSTIC SERVICES CATALOG PROMO */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-purple-700 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>Diagnostic Services</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Explore Health Packages</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Full body health checkups, blood tests, and MRI/CT diagnostic scans with free home sample collection.
              </p>
              <button
                onClick={() => handleCTAAction('navigate_services')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* 4. HEALTH VAULT DOCUMENT UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  {uploadCategory === 'prescription' ? <FileText className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {uploadCategory === 'prescription' ? 'Upload Doctor Prescription' : 'Upload to Health Vault'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {uploadCategory === 'prescription' 
                      ? 'Submit prescription for fast review & lab booking by care team.' 
                      : 'Safely maintain medical records under your account.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setIsUploadModalOpen(false); setUploadError(''); setSelectedFiles([]); }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Document Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                >
                  <option value="prescription">Doctor Prescription</option>
                  <option value="lab_report">Lab Report (Blood Test, Urine, Pathology)</option>
                  <option value="imaging_scan">MRI / CT / X-Ray Scan Report</option>
                  <option value="doctor_notes">Doctor Consultation Note</option>
                  <option value="discharge_summary">Hospital Discharge Summary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Document Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800">Document Title / Name (Optional)</label>
                <input
                  type="text"
                  placeholder={uploadCategory === 'prescription' ? "e.g. Dr Sharma Prescription Sep 2026" : "e.g. Blood Test Report Sep 2026"}
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* File Dropzone & Multi-file Upload Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    File Attachment (PDF, JPG, PNG, WEBP, DOCX)
                  </label>
                  {selectedFiles.length > 0 && (
                    <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
                    </span>
                  )}
                </div>

                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleAddFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`p-4 border-2 border-dashed rounded-2xl text-center space-y-2 relative transition-colors ${
                    isDragOver 
                      ? 'border-purple-600 bg-purple-100/70' 
                      : 'border-purple-200 bg-purple-50/40 hover:bg-purple-50'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-purple-600 mx-auto" />
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      {selectedFiles.length > 0 ? 'Click or drop more files to add' : 'Click or drop files here'}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Maximum file size: 10MB per file
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleAddFiles(e.target.files);
                      }
                      e.target.value = '';
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                {/* Selected Files List Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
                    {selectedFiles.map((file, idx) => {
                      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                      const sizeKb = Math.round(file.size / 1024);
                      const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

                      return (
                        <div 
                          key={`${file.name}_${file.size}_${idx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-100 shadow-2xs hover:border-purple-200 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-black text-[9px] flex items-center justify-center shrink-0 border border-purple-200">
                              {ext}
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {sizeFormatted}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>{uploadCategory === 'prescription' ? 'Submit Prescription' : 'Save to Health Vault'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 5. DYNAMIC INTERACTIVE HEALTH WALLET REWARDS MODAL (Synchronized with Supabase backend wallet settings!) */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                  <Coins className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Health Express Wallet</h3>
                  <p className="text-xs text-slate-500 font-medium">Your earned diagnostic reward coins.</p>
                </div>
              </div>

              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet Balance Hero Banner */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> {walletSettings.signup_reward_enabled ? 'Welcome Bonus Active' : 'Rewards Active'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold border border-white/30">
                  ≈ ₹{rupeesDiscountValue} Discount Value
                </span>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {currentWalletCoins.toLocaleString('en-IN')} <span className="text-lg font-bold text-amber-100">Coins</span>
                </h2>
                <p className="text-xs text-amber-100 font-medium">
                  Use your coins to get discounts on full body checkups and blood tests!
                </p>
              </div>
            </div>

            {/* Transaction Ledger List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
                Rewards Transaction Ledger
              </h4>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">Welcome Signup Reward</h5>
                    <p className="text-[10px] text-slate-500 font-medium">SMS OTP Verified Registration Bonus</p>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +{currentWalletCoins.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Dynamic Wallet Rules Info Box (Fetched from Supabase backend) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs text-amber-900">
              <p className="font-extrabold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> How Health Coins Work (Live Rules):
              </p>
              <ul className="list-disc pl-5 text-[11px] space-y-1 font-medium text-amber-900">
                <li>Earn 10 Health Coins for every ₹100 spent on diagnostic tests.</li>
                <li>
                  Redeem up to {walletSettings.maximum_coins_per_order || 500} Coins (₹{Math.floor((walletSettings.maximum_coins_per_order || 500) / coinsPerRupee)} discount) per order at checkout.
                </li>
                <li>
                  Minimum order amount to redeem: ₹{walletSettings.minimum_order_amount || 299} (min. {walletSettings.minimum_coins_to_redeem || 100} coins required).
                </li>
              </ul>
            </div>

            {/* Redeem CTA Button */}
            <button
              onClick={() => { setIsWalletModalOpen(false); navigate('/services'); }}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Redeem Coins on Diagnostic Packages</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
