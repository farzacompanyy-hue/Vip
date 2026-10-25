import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StaffLoginAuth } from './components/Auth/StaffLoginAuth';
import { Navbar } from './components/Navbar';
import { LiveDispatchQueue } from './components/Dispatch/LiveDispatchQueue';
import { DriverApprovalPanel } from './components/Drivers/DriverApprovalPanel';
import { TerminalLedgerView } from './components/Ledger/TerminalLedgerView';
import { EmergencySosMonitor } from './components/SOS/EmergencySosMonitor';
import { SupabaseSettingsModal } from './components/Settings/SupabaseSettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { storageService } from './services/storage';
import { soundService } from './services/sound';
import { Vehicle, DriverApplication, FinancialTransaction, EmergencySosAlert } from './types';
import { ShieldAlert, KeyRound, Lock, X, CheckCircle2 } from 'lucide-react';

const SECRET_MASTER_PIN = '9900'; // الكود السري الخاص بالمطور ومالك المنظومة

const MainStaffApp: React.FC = () => {
  const { currentUser, canAccess, getDefaultTabForUser, currentBranch, logAudit } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => getDefaultTabForUser());

  // Secret Master Access State
  const [isMasterUnlocked, setIsMasterUnlocked] = useState(false);
  const [showMasterPinModal, setShowMasterPinModal] = useState(false);
  const [masterPinInput, setMasterPinInput] = useState('');
  const [masterPinError, setMasterPinError] = useState('');

  // Shared state with live persistence
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storageService.getVehicles());
  const [drivers, setDrivers] = useState<DriverApplication[]>(() => storageService.getDrivers());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => storageService.getTransactions());
  const [sosAlerts, setSosAlerts] = useState<EmergencySosAlert[]>(() => storageService.getSosAlerts());

  // Count active SOS alerts for navbar badge
  const activeSosCount = sosAlerts.filter((a) => a.status === 'active').length;

  // Strict per-user landing tab sync & route guard
  useEffect(() => {
    if (currentUser) {
      if (activeTab === 'settings' && (!isMasterUnlocked || currentUser.role !== 'super_admin')) {
        setActiveTab(getDefaultTabForUser());
      } else {
        const allowed = canAccess(activeTab as any);
        if (!allowed && activeTab !== 'settings') {
          setActiveTab(getDefaultTabForUser());
        }
      }
    }
  }, [currentUser?.role, currentUser?.id, activeTab, isMasterUnlocked, canAccess, getDefaultTabForUser]);

  const handleVerifyMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPinError('');

    if (masterPinInput.trim() === SECRET_MASTER_PIN || masterPinInput.trim() === 'WASLA-9900') {
      setIsMasterUnlocked(true);
      setShowMasterPinModal(false);
      setMasterPinInput('');
      setActiveTab('settings');
      soundService.playSuccessTone();
      logAudit(
        'فتح إعدادات السحابة السرية (Master Mode)',
        'auth',
        'تم إدخال كود المطور السري وتفعيل شاشة إعدادات Supabase وجداول البيانات'
      );
    } else {
      setMasterPinError('الكود السري للمطور غير صحيح');
    }
  };

  const handleLockMaster = () => {
    setIsMasterUnlocked(false);
    setActiveTab(getDefaultTabForUser());
    soundService.playSuccessTone();
  };

  if (!currentUser) {
    return <StaffLoginAuth />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-cairo selection:bg-[#0056B3] selection:text-white">
      {/* Top Navbar with Apple HIG styling and strict tab isolation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSosCount={activeSosCount}
        isMasterUnlocked={isMasterUnlocked}
        onLockMaster={handleLockMaster}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24">
        {activeTab === 'dispatch' && canAccess('dispatch') && (
          <LiveDispatchQueue
            vehicles={vehicles}
            onUpdateVehicles={(updated) => {
              setVehicles(updated);
              storageService.saveVehicles(updated);
            }}
          />
        )}

        {activeTab === 'drivers' && canAccess('drivers') && (
          <DriverApprovalPanel
            drivers={drivers}
            onUpdateDrivers={(updated) => {
              setDrivers(updated);
              storageService.saveDrivers(updated);
            }}
          />
        )}

        {activeTab === 'ledger' && canAccess('ledger') && (
          <TerminalLedgerView
            transactions={transactions}
            onUpdateTransactions={(updated) => {
              setTransactions(updated);
            }}
          />
        )}

        {activeTab === 'sos' && canAccess('sos') && (
          <EmergencySosMonitor
            alerts={sosAlerts}
            onUpdateAlerts={(updated) => {
              setSosAlerts(updated);
              storageService.saveSosAlerts(updated);
            }}
          />
        )}

        {/* Secret Master Supabase Settings view - strictly hidden and only available when unlocked */}
        {activeTab === 'settings' && isMasterUnlocked && currentUser.role === 'super_admin' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 apple-squircle-sm p-4 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="font-bold">
                  أنت الآن في وضع المطور السري لإعدادات سحابة Supabase وجداول البيانات. هذه الشاشة مخفية تماماً عن الموظفين العاديين.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(getDefaultTabForUser())}
                  className="px-3 py-1.5 apple-squircle-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>العودة للرئيسية</span>
                </button>
                <button
                  onClick={handleLockMaster}
                  className="px-3 py-1.5 apple-squircle-xs bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 sf-icon" />
                  <span>قفل وإخفاء الشاشة</span>
                </button>
              </div>
            </div>
            <SupabaseSettingsModal />
          </div>
        )}
      </main>

      {/* Floating Offline Sync Indicator */}
      <OfflineIndicator />

      {/* Discreet Footer with Hidden Developer Secret Master Access Trigger */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0056B3]">وَصْلَة - WASLA</span>
            <span>•</span>
            <span>نظام إدارة وتشغيل الفرزات الميداني</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>الفرزة: <strong className="text-slate-700">{currentBranch.name}</strong></span>
            <span>•</span>
            {/* Hidden Secret Trigger: Clicking opens the Secret Master PIN modal */}
            <button
              onClick={() => {
                if (currentUser.role === 'super_admin') {
                  setShowMasterPinModal(true);
                  setMasterPinError('');
                }
              }}
              className="font-mono text-slate-400 hover:text-[#0056B3] transition cursor-pointer flex items-center gap-1"
              title={currentUser.role === 'super_admin' ? 'انقر لفتح بوابة المطور السرية' : ''}
            >
              <span>PWA v2.4.0 (Supabase Dual-Engine)</span>
              {isMasterUnlocked && <Lock className="w-3 h-3 text-amber-500" />}
            </button>
          </div>
        </div>
      </footer>

      {/* Secret Master PIN Dialog Modal */}
      {showMasterPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white apple-squircle-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 apple-squircle-sm bg-blue-50 text-[#0056B3] flex items-center justify-center">
                  <KeyRound className="w-5 h-5 sf-icon" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">بوابة المطور وإدارة السحابة</h3>
                  <p className="text-[10px] text-slate-400">منطقة سرية خاصة بمالك المنظومة</p>
                </div>
              </div>
              <button
                onClick={() => setShowMasterPinModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {masterPinError && (
              <div className="mb-3 p-2.5 apple-squircle-xs bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                {masterPinError}
              </div>
            )}

            <form onSubmit={handleVerifyMasterPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  أدخل كود المطور السري (Secret Master PIN)
                </label>
                <input
                  type="password"
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 apple-squircle-sm px-3 py-2.5 text-center font-mono font-black text-lg tracking-widest text-slate-900 focus:bg-white focus:border-[#0056B3] outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 text-center font-mono">
                  الكود الافتراضي المعتمد: 9900
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMasterPinModal(false)}
                  className="w-1/3 py-2.5 apple-squircle-sm border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 apple-squircle-sm font-extrabold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 sf-icon" />
                  <span>فتح إعدادات السحابة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainStaffApp />
    </AuthProvider>
  );
}
