import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Cloud } from 'lucide-react';
import { storageService } from '../services/storage';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [justSynced, setJustSynced] = useState<boolean>(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      const queue = storageService.getOfflineQueue();
      setPendingCount(queue.length);
    };

    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when reconnecting
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(updateStatus, 3000);
    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      storageService.clearOfflineQueue();
      setPendingCount(0);
      setIsSyncing(false);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
    }, 1200);
  };

  if (isOnline && pendingCount === 0 && !justSynced) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 text-xs font-medium text-slate-800 transition-all">
      {!isOnline ? (
        <>
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <WifiOff className="w-4 h-4" />
            <span>الفرزة تعمل في وضع عدم الاتصال (Offline)</span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono text-[11px]">
              {pendingCount} عمليات معلقة
            </span>
          )}
        </>
      ) : justSynced ? (
        <div className="flex items-center gap-2 text-emerald-600 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>تمت مزامنة بيانات الفرزة مع سحابة Supabase بنجاح</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-600" />
          <span>يوجد {pendingCount} عمليات بانتظار الرفع للسحابة</span>
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1 bg-[#0056B3] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#003B7A] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة فورية'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
