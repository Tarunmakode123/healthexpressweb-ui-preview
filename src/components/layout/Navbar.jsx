import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, MessageSquare, ArrowRight, Upload, User, LogOut, 
  ShoppingBag, ShieldAlert, Search, MapPin, ChevronDown, 
  Package, FileText, Navigation, Loader2, AlertCircle 
} from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../../utils/whatsapp';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import WaitlistModal from '../common/WaitlistModal';

const CITIES_LIST = [
  { name: 'Bengaluru', isLive: true, badge: 'LIVE' },
  { name: 'Delhi NCR', isLive: false, badge: 'Coming Soon' },
  { name: 'Mumbai', isLive: false, badge: 'Coming Soon' },
  { name: 'Hyderabad', isLive: false, badge: 'Coming Soon' },
  { name: 'Chennai', isLive: false, badge: 'Coming Soon' },
  { name: 'Kolkata', isLive: false, badge: 'Coming Soon' },
  { name: 'Pune', isLive: false, badge: 'Coming Soon' },
  { name: 'Indore', isLive: false, badge: 'Coming Soon' }
];

export default function Navbar({ onOpenUploadModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showAdminExitModal, setShowAdminExitModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);

  // Waitlist Modal state
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCity, setWaitlistCity] = useState('Delhi NCR');

  // Search input state
  const [headerSearch, setHeaderSearch] = useState('');

  // Location state (Active location: Bengaluru)
  const [selectedLocation, setSelectedLocation] = useState('Bengaluru');

  // Geolocation states
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { itemCount, openCart } = useCart();

  const isAdminUser = Boolean(
    user && (
      user.name?.toLowerCase() === 'admin' ||
      user.email?.toLowerCase()?.includes('admin') ||
      user.role === 'admin'
    )
  );

  const showCustomerAccount = isLoggedIn && !isAdminUser;

  // Auto-logout admin whenever navigating away from /admin
  useEffect(() => {
    if (location.pathname !== '/admin' && isAdminUser) {
      logout();
    }
  }, [location.pathname, isAdminUser, logout]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intercept navigation links if leaving /admin while signed in
  const handleLinkClick = (e, targetHref) => {
    if (location.pathname === '/admin' && targetHref !== '/admin') {
      e.preventDefault();
      setPendingTarget(targetHref);
      setShowAdminExitModal(true);
    }
  };

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowLocationMenu(false);
    setLocationError(null);
  }, [location]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle header search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/services?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleSelectLocation = (locName) => {
    if (locName === 'Bengaluru' || locName === 'Bangalore') {
      setSelectedLocation('Bengaluru');
      localStorage.setItem('he_user_city', 'Bengaluru');
      setLocationError(null);
      setShowLocationMenu(false);
    } else {
      setShowLocationMenu(false);
      setIsMobileMenuOpen(false);
      setWaitlistCity(locName);
      setIsWaitlistOpen(true);
    }
  };

  // Reverse Geocoding helper to resolve city from GPS coordinates
  const detectCityFromCoords = async (lat, lon) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const rawCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.state;

        if (rawCity) {
          const lowerRaw = rawCity.toLowerCase();
          const matched = CITIES_LIST.find(c => {
            const lowerLoc = c.name.toLowerCase();
            return lowerRaw.includes(lowerLoc) || lowerLoc.includes(lowerRaw) ||
                   (c.name === 'Bengaluru' && (lowerRaw.includes('bangalore') || lowerRaw.includes('bengaluru'))) ||
                   (c.name === 'Delhi NCR' && (lowerRaw.includes('delhi') || lowerRaw.includes('gurgaon') || lowerRaw.includes('noida')));
          });
          return matched ? matched.name : rawCity;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding fallback:', err);
    }
    return null;
  };

  // Handler for "Use Current Location"
  const handleUseCurrentLocation = () => {
    if (isDetectingLocation) return;
    setLocationError(null);

    if (!navigator || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please select your city manually.");
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const resolvedCity = await detectCityFromCoords(latitude, longitude);
        setIsDetectingLocation(false);

        if (resolvedCity) {
          handleSelectLocation(resolvedCity);
        } else {
          setLocationError("Unable to detect your city name. Please select manually.");
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location access was denied. Please select your city manually.");
        } else {
          setLocationError("Unable to detect your location. Please select your city manually.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Menu bar service category navigation links
  const menuBarLinks = [
    { label: 'All Services', href: '/services' },
    { label: 'Lab Tests', href: '/services?category=lab-tests' },
    { label: 'Radiology', href: '/services?category=imaging' },
    { label: 'Health Packages', href: '/services?category=health-packages' },
    { label: 'Home Nursing', href: '/home-nursing-care' },
    { label: 'Genomics', href: '/services?category=genetics' },
    { label: 'Surgeries', href: '/surgeries' },
    { label: 'Telemedicine', href: '/telemedicine', badge: 'Soon' },
    { label: 'Health Library', href: '/health-library' },
    { label: 'Calculators', href: '/health-calculators' },
    { label: 'For Providers', href: '/providers' },
    { label: 'About', href: '/about' }
  ];

  return (
    <header className={`sticky top-0 z-40 bg-white transition-all duration-200 border-b border-slate-200/90 ${
      isScrolled ? 'shadow-md' : 'shadow-2xs'
    }`}>
      
      {/* ================= 1. TOP UTILITY BAR ================= */}
      <div className="bg-white border-b border-slate-100 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Brand Logo & Location Selector */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link to="/" onClick={(e) => handleLinkClick(e, '/')} className="flex items-center group py-0.5">
                <img 
                  src="/logo.png" 
                  alt="Health Express - Everything Health Fast Tracked" 
                  className="h-10 sm:h-12 lg:h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </Link>

              {/* Desktop Location Dropdown */}
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200/90 text-xs font-bold transition-all cursor-pointer"
                  title="Select your delivery location"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span className="truncate max-w-[90px]">{selectedLocation}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showLocationMenu && (
                  <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100 text-left">
                    
                    {/* Prominent "Use Current Location" Action */}
                    <button
                      onClick={handleUseCurrentLocation}
                      disabled={isDetectingLocation}
                      className="w-full text-left p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-60 mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Navigation className={`w-4 h-4 text-purple-700 shrink-0 ${isDetectingLocation ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                        <div>
                          <span className="text-xs font-extrabold block leading-tight">
                            {isDetectingLocation ? 'Detecting your location...' : 'Use Current Location'}
                          </span>
                          <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
                            {isDetectingLocation ? 'Finding your GPS coordinates' : 'Detect my current city'}
                          </span>
                        </div>
                      </div>
                      {isDetectingLocation && <Loader2 className="w-3.5 h-3.5 text-purple-700 animate-spin shrink-0" />}
                    </button>

                    {/* Location Error / Feedback */}
                    {locationError && (
                      <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold flex items-start gap-1.5 leading-snug">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{locationError}</span>
                      </div>
                    )}

                    {/* Manual City Selection List */}
                    <div className="border-t border-slate-100 pt-1">
                      <div className="flex items-center justify-between px-2.5 py-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          SELECT CITY
                        </span>
                        <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          Bengaluru Live
                        </span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {CITIES_LIST.map((cityObj) => (
                          <button
                            key={cityObj.name}
                            onClick={() => handleSelectLocation(cityObj.name)}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              cityObj.isLive
                                ? 'bg-purple-50 text-purple-900 border border-purple-200/80 font-black shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {cityObj.name}
                            </span>
                            {cityObj.isLive ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                                Active Live
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200 hover:bg-purple-100 hover:text-purple-900 transition-colors">
                                Coming Soon 🔔
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Center: Prominent Search Bar (Desktop/Tablet) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 relative">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-purple-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search lab tests, scans, health packages, doctors..."
                  className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right: Auth State, Orders, Cart, WhatsApp */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0 text-xs">

              {/* Logged-In User Actions (Orders & Health Records) */}
              {showCustomerAccount && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={(e) => handleLinkClick(e, '/dashboard')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-bold transition-colors"
                  >
                    <Package className="w-3.5 h-3.5 text-purple-700" />
                    <span>Orders</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={(e) => handleLinkClick(e, '/dashboard')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-bold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>Health Records</span>
                  </Link>
                </>
              )}

              {/* WhatsApp Quick Contact */}
              {!showCustomerAccount && (
                <button
                  onClick={() => openWhatsApp(DEFAULT_MESSAGES.general)}
                  className="font-bold text-slate-700 hover:text-emerald-700 px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Us</span>
                </button>
              )}

              {/* Logged-in Account Dropdown vs Logged-out Sign In */}
              {showCustomerAccount ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 transition-all border border-purple-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                    <ChevronDown className="w-3 h-3 text-purple-700" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100 text-left">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        <span>My Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200 shadow-2xs"
                >
                  Login
                </Link>
              )}

              {/* Cart Icon Button */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4 h-4 text-purple-100" />
                <span className="font-extrabold text-xs">Cart</span>
                {itemCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white text-purple-900 text-[10px] font-black min-w-[18px] text-center shadow-2xs">
                    {itemCount}
                  </span>
                )}
              </button>

            </div>

            {/* Mobile Actions Header Bar */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center cursor-pointer touch-target active:scale-95 transition-transform"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black flex items-center justify-center border border-purple-900 shadow-2xs">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 min-w-[44px] min-h-[44px] text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl cursor-pointer touch-target active:scale-95 transition-transform flex items-center justify-center"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-purple-700" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ================= 2. SECOND LEVEL MENU / SERVICES BAR ================= */}
      <div className="bg-slate-50/90 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-700 whitespace-nowrap">
            {menuBarLinks.map((item) => {
              const isActive = location.pathname + location.search === item.href || (item.href === '/services' && location.pathname === '/services' && !location.search);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-800 text-white shadow-2xs font-extrabold'
                      : 'hover:bg-purple-100/70 hover:text-purple-900 text-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-amber-400 text-purple-950' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Modal */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[105px] bottom-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-150">
          <div className="bg-white border-b border-purple-100 shadow-xl px-5 pt-4 pb-8 max-h-[85vh] overflow-y-auto space-y-4 text-left">
            
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-purple-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search tests, scans, packages..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-700 text-white text-xs font-bold rounded-lg"
              >
                Search
              </button>
            </form>

            {/* Mobile Location & Language Selectors */}
            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              
              {/* Location Box with "Use Current Location" */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-700" />
                    <span className="font-bold text-slate-700">Selected City:</span>
                  </div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => handleSelectLocation(e.target.value)}
                    className="bg-transparent font-extrabold text-purple-900 outline-none cursor-pointer text-xs"
                  >
                    {CITIES_LIST.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} {c.isLive ? '(Active Live)' : '(Coming Soon 🔔)'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingLocation}
                  className="w-full py-2 px-3 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Navigation className={`w-3.5 h-3.5 text-purple-700 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Detecting your location...' : 'Use Current Location'}</span>
                </button>

                {locationError && (
                  <p className="text-[10px] text-amber-800 font-semibold text-center pt-0.5">
                    {locationError}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Services Navigation */}
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Health Express Services
              </span>
              {menuBarLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleLinkClick(e, item.href);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-purple-50 hover:text-purple-900 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {showCustomerAccount ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs flex items-center justify-between"
                  >
                    <span>My Account & Dashboard ({user?.name || 'Patient'})</span>
                    <User className="w-4 h-4 text-purple-700" />
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-between"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-4 h-4 text-rose-600" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-purple-700 text-white font-bold text-xs flex items-center justify-between"
                >
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              )}

              <button
                onClick={() => {
                  onOpenUploadModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-between"
              >
                <span>Upload Prescription / Order</span>
                <Upload className="w-4 h-4 text-purple-200" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Exit Modal */}
      {showAdminExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-5 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Leaving Admin Panel</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  You are navigating away from the Health Express Control Center. Would you like to sign out before returning to the website?
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={async () => {
                  setShowAdminExitModal(false);
                  await logout();
                  const target = pendingTarget || '/';
                  setPendingTarget(null);
                  navigate(target);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-purple-700/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out & Exit</span>
              </button>

              <button
                onClick={() => {
                  setShowAdminExitModal(false);
                  const target = pendingTarget || '/';
                  setPendingTarget(null);
                  navigate(target);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Stay Signed In
              </button>

              <button
                onClick={() => {
                  setShowAdminExitModal(false);
                  setPendingTarget(null);
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. WAITLIST MODAL */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        defaultCity={waitlistCity}
      />

    </header>
  );
}
