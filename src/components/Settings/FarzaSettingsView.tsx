import React, { useState } from 'react';
import { storageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import {
  Database,
  Cloud,
  Wifi,
  Printer,
  CheckCircle2,
  RefreshCw,
  Server,
  Layers,
  Save,
  Bluetooth,
} from 'lucide-react';
import { soundService } from '../../services/sound';

export const FarzaSettingsView: React.FC = () => {
  const { currentBranch } = useAuth();
  const [config, setConfig] = useState(() => storageService.getSupabaseConfig());
  const [offlineQueue, setOfflineQueue] = useState(() => storageService.getOfflineQueue());
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSupabaseConfig(config);
    setIsSaved(true);
    soundService.playSuccessTone();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFlushQueue = () => {
    storageService.clearOfflineQueue();
    setOfflineQueue([]);
    soundService.playSuccessTone();
  };

  const handleTestPrint = () => {
    soundService.playPrintChime();
    const testText = `
================================
  اختبار طابعة البلوتوث المحمولة
     وَصْلَة - WASLA FARZA
================================
الفرزة: ${currentBranch.name}
عرض الورق: ${paperWidth}
الحالة: متصلة وجاهزة للطباعة
التاريخ: ${new Date().toLocaleString('ar-YE')}
================================
    `.trim();

    const printWin = window.open('', '_blank', 'width=400,height=400');
    if (printWin) {
      printWin.document.write(
        `<pre style="font-family: monospace; font-size: 12px; padding: 15px; direction: rtl; white-space: pre-wrap;">${testText}</pre>`
      );
      printWin.document.close();
      printWin.focus();
      printWin.print();
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#003B7A]">
              إعدادات الفرزة والبنية التحتية الهجينة
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
              Supabase + IndexedDB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الربط السحابي المشترك مع تطبيق الركاب، طابعات البلوتوث، وذاكرة التخزين غير المتصلة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Supabase Connection Settings */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">قاعدة بيانات Supabase المشتركة</h3>
                <p className="text-xs text-slate-400">تزامن فوري بين إدارة الفرزات وتطبيق الركاب</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              قيد التشغيل
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                رابط مشروع سحابة Supabase (Project URL)
              </label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-800 outline-none focus:border-[#0056B3]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                مفتاح الاتصال المشترك المجهول (Supabase Anon Key)
              </label>
              <input
                type="text"
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 outline-none focus:border-[#0056B3]"
                required
              />
            </div>

            {/* Shared Tables Status */}
            <div>
              <span className="block font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#0056B3]" />
                <span>الجداول المركزية المشتركة (Shared Schemas):</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'bookings', desc: 'تذاكر الركاب والمقاعد' },
                  { name: 'ledger', desc: 'الدفتر المالي وعمولة 20%' },
                  { name: 'drivers', desc: 'كباتن الفرزات والرخص' },
                  { name: 'field_issues', desc: 'استغاثات ورادار SOS' },
                ].map((tbl) => (
                  <div key={tbl.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="font-mono text-[#0056B3] block">{tbl.name}</strong>
                      <span className="text-[10px] text-slate-500">{tbl.desc}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'تم حفظ التكوين بنجاح!' : 'حفظ إعدادات الربط السحابي'}</span>
            </button>
          </form>
        </div>

        {/* Offline Queue & Bluetooth Printer Settings */}
        <div className="md:col-span-5 space-y-5">
          {/* Bluetooth Thermal Printer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-[#0056B3] rounded-xl">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">طابعة البلوتوث المحمولة</h3>
                <p className="text-xs text-slate-400">إصدار التذاكر وسندات القبض الميدانية</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عرض بكرة الورق الحراري (Thermal Paper Size)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      paperWidth === '80mm'
                        ? 'bg-[#0056B3] text-white border-[#003B7A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    80 مم (قياسي عريض)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      paperWidth === '58mm'
                        ? 'bg-[#0056B3] text-white border-[#003B7A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    58 مم (محمول صغير)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestPrint}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 border border-slate-300 transition"
              >
                <Bluetooth className="w-4 h-4 text-blue-600" />
                <span>إرسال سند اختبار للطابعة</span>
              </button>
            </div>
          </div>

          {/* Offline Sync Buffer Monitor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">طابور المزامنة المحلي</h3>
                  <p className="text-xs text-slate-400">حماية العمل عند انقطاع الإنترنت</p>
                </div>
              </div>
              <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {offlineQueue.length} عناصر
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              عند حدوث انقطاع في شبكة الإنترنت بالفرزة، يتم تخزين كافة التذاكر والسندات محلياً في ذاكرة PWA الآمنة، وتُرفع تلقائياً عند عودة الاتصال دون أي تعطيل للمسافرين.
            </p>

            {offlineQueue.length > 0 && (
              <button
                onClick={handleFlushQueue}
                className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تفريغ ومزامنة الطابور السحابي الآن</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
