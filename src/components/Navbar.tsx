import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Car,
  FileCheck,
  Receipt,
  AlertTriangle,
  Settings,
  LogOut,
  MapPin,
  ShieldCheck,
  Volume2,
  VolumeX,
  Clock,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { soundService } from '../services/sound';
import { AppleBackButton } from './Common/AppleBackButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSosCount: number;
  isMasterUnlocked?: boolean;
  onLockMaster?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeSosCount,
  isMasterUnlocked = false,
  onLockMaster,
}) => {
  const { currentUser, currentBranch, logout, canAccess, inactivityRemaining, resetInactivityTimer, getDefaultTabForUser } = useAuth();
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
      soundService.stopSosSiren();
    }
  };

  type NavModule = 'dispatch' | 'drivers' | 'ledger' | 'sos' | 'settings';
  interface NavItem {
    id: string;
    label: string;
    icon: any;
    permission: NavModule;
    count?: number;
  }

  // Operational items for field staff (settings is strictly removed from staff view)
  const navItems: NavItem[] = [
    {
      id: 'dispatch',
      label: 'التفويج المباشر والطوابير',
      icon: Car,
      permission: 'dispatch',
    },
    {
      id: 'drivers',
      label: 'اعتماد الكباتن والرخص',
      icon: FileCheck,
      permission: 'drivers',
    },
    {
      id: 'ledger',
      label: 'الدفتر المالي وعمولة 20%',
      icon: Receipt,
      permission: 'ledger',
    },
    {
      id: 'sos',
      label: 'رادار الطوارئ',
      icon: AlertTriangle,
      permission: 'sos',
      count: activeSosCount,
    },
  ];

  // Filter tabs strictly by per-user isolated permissions
  const authorizedNavItems = navItems.filter((item) => canAccess(item.permission));

  // If Master PIN has been unlocked by founder / super admin, append hidden console tab
  if (isMasterUnlocked && currentUser?.role === 'super_admin') {
    authorizedNavItems.push({
      id: 'settings',
      label: 'سحابة Supabase (المطور)',
      icon: Settings,
      permission: 'settings' as const,
    });
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 apple-glass-header shadow-[0_8px_32px_rgba(0,30,61,0.25)] border-b border-white/15">
        {/* Top Banner: Brand, Station, Isolated User Badge, Inactivity Clock, Actions */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Logo & Portal Branding with Apple Squircle Geometry */}
            <div className="flex items-center gap-3">
              <div className="bg-white/95 p-1 apple-squircle-sm shadow-md border border-white/40 flex items-center justify-center overflow-hidden w-11 h-11 shrink-0">
                <img
                  src="/assets/aistudio/IMG_2782_9ea91479.jpeg"
                  alt="شعار وَصْلَة WASLA"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_2778_cbee1f3e.jpeg';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white drop-shadow-xs">
                    وَصْلَة <span className="text-amber-400 font-mono text-sm sm:text-base">WASLA</span>
                  </span>
                  <span className="bg-white/15 text-blue-100 text-[10px] sm:text-xs px-2.5 py-0.5 apple-squircle-xs font-bold border border-white/20">
                    بوابة الموظفين
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100 font-medium">
                  <MapPin className="w-3 h-3 text-amber-300 sf-icon" />
                  <span>{currentBranch.name}</span>
                </div>
              </div>
            </div>

            {/* Center / Right: Isolated User Badge & Security Session */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Isolated Authenticated Staff Badge (No demo switcher) */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 apple-squircle-sm border border-white/20 text-white">
                <div className="w-6 h-6 apple-squircle-xs bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 sf-icon" />
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-xs block leading-none">
                    {currentUser?.fullName}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-blue-200">{currentUser?.roleLabel}</span>
                    <span className="font-mono text-[9px] font-bold bg-amber-400 text-slate-950 px-1 rounded">
                      {currentUser?.badgeNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inactivity Auto-Lock Countdown Pill */}
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 apple-squircle-sm text-xs font-mono font-bold border transition ${
                  inactivityRemaining <= 45
                    ? 'bg-rose-500/30 text-rose-200 border-rose-400/50 animate-pulse'
                    : 'bg-white/10 text-blue-200 border-white/15'
                }`}
                title="مؤقت الأمان الميداني - يقفل الجلسة تلقائياً عند الخمول"
              >
                <Clock className="w-3.5 h-3.5 sf-icon" />
                <span>قفل تلقائي: {formatTimer(inactivityRemaining)}</span>
              </div>

              {/* Siren Audio Toggle */}
              <button
                onClick={toggleSound}
                className={`p-2 apple-squircle-sm text-xs transition border cursor-pointer ${
                  isMuted
                    ? 'bg-slate-800/60 text-slate-400 border-slate-700'
                    : 'bg-white/15 text-white hover:bg-white/25 border-white/20'
                }`}
                title={isMuted ? 'تفعيل صفارات الطوارئ' : 'كتم صفارات الطوارئ'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 sf-icon" /> : <Volume2 className="w-4 h-4 text-emerald-300 sf-icon" />}
              </button>

              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* Developer Lock Indicator if unlocked */}
              {isMasterUnlocked && (
                <button
                  onClick={onLockMaster}
                  className="flex items-center gap-1.5 px-3 py-1.5 apple-squircle-sm bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer hover:bg-amber-300"
                  title="قفل وإخفاء شاشة المطور وسحابة Supabase فوراً"
                >
                  <Lock className="w-3.5 h-3.5 sf-icon" />
                  <span className="hidden sm:inline">قفل شاشة المطور</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 apple-squircle-sm bg-rose-500/20 hover:bg-rose-500/40 text-rose-100 border border-rose-400/30 transition cursor-pointer"
                title="تسجيل الخروج الميداني وقفل الجلسة"
              >
                <LogOut className="w-4 h-4 sf-icon" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation: ONLY shows tabs authorized for this isolated user role */}
        <nav className="bg-[#003B7A]/95 px-2 sm:px-6 border-t border-white/10 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2">
            {/* Universal Back Navigation if navigated away from default workspace */}
            {activeTab !== getDefaultTabForUser() && (
              <AppleBackButton
                onClick={() => setActiveTab(getDefaultTabForUser())}
                label="العودة للرئيسية"
                variant="dark"
                className="my-auto ml-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border-amber-300/40"
                title="الرجوع إلى الشاشة التشغيلية المعتمدة لحسابك"
              />
            )}
            {authorizedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 py-3 px-3.5 sm:px-4 text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-amber-400 text-white bg-white/10'
                      : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 sf-icon ${isActive ? 'text-amber-400' : 'text-blue-300'}`} />
                  <span>{item.label}</span>

                  {item.count !== undefined && item.count > 0 && (
                    <span className="relative flex h-5 min-w-5 items-center justify-center px-1.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse shadow-sm">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Auto-Lock Warning Modal when remaining time <= 30 seconds */}
      {inactivityRemaining <= 30 && inactivityRemaining > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white/98 apple-squircle-xl p-6 max-w-sm w-full text-center shadow-2xl border border-rose-200">
            <div className="w-12 h-12 apple-squircle bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 sf-icon animate-pulse" />
            </div>
            <h3 className="font-black text-slate-900 text-base">تنبيه خمول الشاشة الميدانية</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              لحماية بيانات الفرزة والعمليات المالية، سيتم قفل الجلسة تلقائياً خلال:
            </p>
            <div className="text-3xl font-black font-mono text-rose-600 mb-5">
              {inactivityRemaining} ثانية
            </div>
            <button
              onClick={resetInactivityTimer}
              className="w-full py-3 apple-squircle font-extrabold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 sf-icon" />
              <span>تمديد الجلسة ومتابعة العمل</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
