import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, Share, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (!deferredPrompt) {
      alert('تطبيق وَصْلَة للموظفين جاهز ومثبت في متصفحك أو قم بفتحه كشاشة كاملة.');
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        تطبيق PWA مثبت
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-sm transition active:scale-95"
        title="تثبيت تطبيق الفرزة كـ PWA مستقل على الهاتف أو الحاسوب"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>تثبيت التطبيق (PWA)</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-right">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#0056B3]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">تثبيت تطبيق وَصْلَة على آيفون</h3>
                <p className="text-xs text-slate-500">يعمل كتطبيق أصلي ومستقل بدون متصفح</p>
              </div>
            </div>

            <ol className="mt-4 space-y-2.5 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0056B3]">1.</span>
                <span>اضغط على أيقونة المشاركة <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> في أسفل شاشة Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0056B3]">2.</span>
                <span>مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0056B3]">3.</span>
                <span>اضغط <strong>إضافة (Add)</strong> بالأعلى لتجد أيقونة فرزة وَصْلَة على شاشتك.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#0056B3] text-white font-bold text-xs hover:bg-[#003B7A] transition"
            >
              فهمت، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
