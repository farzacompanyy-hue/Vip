import React, { useState, useEffect } from 'react';
import { EmergencySosAlert } from '../../types';
import { storageService } from '../../services/storage';
import { soundService } from '../../services/sound';
import {
  AlertTriangle,
  Radio,
  PhoneCall,
  ShieldAlert,
  Car,
  MapPin,
  Volume2,
  VolumeX,
  CheckCircle,
  Truck,
  Plus,
  Flame,
  Wrench,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppleBackButton } from '../Common/AppleBackButton';

interface EmergencySosMonitorProps {
  alerts: EmergencySosAlert[];
  onUpdateAlerts: (alerts: EmergencySosAlert[]) => void;
}

export const EmergencySosMonitor: React.FC<EmergencySosMonitorProps> = ({
  alerts,
  onUpdateAlerts,
}) => {
  const { currentUser, logAudit } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState<EmergencySosAlert | null>(alerts[0] || null);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [patrolName, setPatrolName] = useState('');
  const [showDispatchInput, setShowDispatchInput] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'in_progress');

  // Trigger siren alert if active alerts exist
  useEffect(() => {
    if (activeAlerts.length > 0 && !isSirenActive) {
      // Keep state available
    }
  }, [activeAlerts.length]);

  const toggleSiren = () => {
    if (isSirenActive) {
      soundService.stopSosSiren();
      setIsSirenActive(false);
    } else {
      soundService.startSosSiren();
      setIsSirenActive(true);
    }
  };

  const handleDispatchPatrol = (alertId: string) => {
    if (!patrolName) return;
    storageService.updateSosStatus(alertId, 'in_progress', patrolName);
    const updated = storageService.getSosAlerts();
    onUpdateAlerts(updated);
    logAudit('توجيه دورية إسناد SOS', 'sos', `توجيه دورية (${patrolName}) للمركبة (${selectedAlert?.vehiclePlate}) في (${selectedAlert?.currentLocationName})`);
    setShowDispatchInput(false);
    setPatrolName('');
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(updated.find((a) => a.id === alertId) || null);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    storageService.updateSosStatus(alertId, 'resolved');
    const updated = storageService.getSosAlerts();
    onUpdateAlerts(updated);
    logAudit('إنهاء وتأمين طارئ SOS', 'sos', `إنهاء حالة الطوارئ وتأكيد سلامة ركاب المركبة (${selectedAlert?.vehiclePlate})`);
    if (isSirenActive && updated.filter((a) => a.status === 'active').length === 0) {
      soundService.stopSosSiren();
      setIsSirenActive(false);
    }
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(updated.find((a) => a.id === alertId) || null);
    }
  };

  // Simulate an incoming live SOS alert from a passenger on a highway
  const handleSimulateEmergency = () => {
    const highways = [
      { loc: 'نقيل سمارة - مفرق الدليل', orig: 'صنعاء', dest: 'إب - تعز', issue: 'accident' as const, desc: 'اصطدام خفيف بسبب الضباب وتوقف السيارة على جانب الطريق، الركاب بحاجة لمساعدة فنية.' },
      { loc: 'طريق العبر - الوديعة', orig: 'مأرب', dest: 'المكلا - منفذ الوديعة', issue: 'breakdown' as const, desc: 'انفجار إطارين في الخط الصحراوي وحرارة عالية، مطلوب أقرب بنشر أو دورية مساندة.' },
      { loc: 'وادي الضباب - مدخل تعز', orig: 'الحديدة', dest: 'تعز', issue: 'medical' as const, desc: 'حالة هبوط سكر طارئة لراكبة مسنة، مطلوب التنسيق مع أقرب مركز صحي أو إسعاف.' },
    ];
    const pick = highways[Math.floor(Math.random() * highways.length)];

    const newAlert: EmergencySosAlert = {
      id: `sos-${Date.now()}`,
      tripId: `trip-${Date.now()}`,
      vehiclePlate: `14 / ${Math.floor(10000 + Math.random() * 90000)} أجرة`,
      vehicleModel: 'تويوتا هايس 2024',
      driverName: 'الكابتن عبدالملك الحبيشي',
      driverPhone: '772391029',
      callerRole: 'passenger',
      callerName: 'مسافر على متن الرحلة',
      callerPhone: '770192837',
      origin: pick.orig,
      destination: pick.dest,
      currentLocationName: pick.loc,
      emergencyType: pick.issue,
      description: pick.desc,
      severity: 'critical',
      status: 'active',
      timestamp: 'الآن (مباشر)',
    };

    storageService.addSosAlert(newAlert);
    const updated = storageService.getSosAlerts();
    onUpdateAlerts(updated);
    setSelectedAlert(newAlert);

    // Trigger siren sound immediately
    soundService.startSosSiren();
    setIsSirenActive(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Live Siren Controls */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>رادار الطوارئ والتنبيهات الصوتية الحية (SOS)</span>
                {activeAlerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-mono px-2 py-0.5 rounded-full animate-ping">
                    {activeAlerts.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                مراقبة فورية لمركبات النقل بين المحافظات وسرعة الاستجابة لبلاغات الاستغاثة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Siren Alert Toggle */}
          <button
            onClick={toggleSiren}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-md ${
              isSirenActive
                ? 'bg-red-600 hover:bg-red-700 text-white animate-bounce'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            {isSirenActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isSirenActive ? 'صافرة الإنذار تعمل (إيقاف)' : 'تفعيل صوت صافرة SOS'}</span>
          </button>

          {/* Simulate Alert for Demo Testing */}
          <button
            onClick={handleSimulateEmergency}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>محاكاة بلاغ استغاثة SOS حي</span>
          </button>
        </div>
      </div>

      {/* Visual Pulsating Radar Canvas Simulation */}
      <div className="bg-slate-950 rounded-3xl p-6 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4 z-10 relative">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-red-400">
              رادار التغطية الحية لشريان الطرق السريعة اليمنية
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            تحديث فوري عبر شبكة وَصْلَة السحابية
          </span>
        </div>

        {/* Concentric Radar Rings */}
        <div className="relative h-64 sm:h-80 w-full flex items-center justify-center overflow-hidden">
          {/* Rotating radar scan beam */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-blue-500/20 flex items-center justify-center">
              <div className="w-52 sm:w-72 h-52 sm:h-72 rounded-full border border-blue-500/25 flex items-center justify-center">
                <div className="w-32 sm:w-48 h-32 sm:h-48 rounded-full border border-blue-500/30 flex items-center justify-center">
                  <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-full border border-blue-500/40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Radar Sweep Line */}
          <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full animate-spin [animation-duration:8s] pointer-events-none opacity-40 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(0,180,255,0.4)_360deg)]"></div>

          {/* Central Terminal Hub (Farza) */}
          <div className="z-10 bg-[#0056B3] p-3 rounded-2xl shadow-lg border-2 border-white/50 text-center flex flex-col items-center">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="text-[10px] font-bold mt-0.5">غرفة عمليات الفرزة</span>
          </div>

          {/* Highway Blips */}
          {alerts.map((alert, idx) => {
            const isActive = alert.status === 'active';
            const isSelected = selectedAlert?.id === alert.id;

            // Positioning on radar
            const offsets = [
              { top: '22%', right: '28%' },
              { bottom: '25%', left: '30%' },
              { top: '35%', left: '20%' },
              { bottom: '30%', right: '22%' },
            ];
            const pos = offsets[idx % offsets.length];

            return (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                style={{ top: pos.top, bottom: pos.bottom, right: pos.right, left: pos.left }}
                className={`absolute z-20 flex items-center gap-1.5 p-2 rounded-2xl transition cursor-pointer backdrop-blur-md ${
                  isSelected
                    ? 'bg-red-600 text-white ring-4 ring-red-400/50 shadow-xl scale-110'
                    : isActive
                    ? 'bg-red-950/80 text-red-200 border border-red-500/60'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    isActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[10px] font-bold font-mono whitespace-nowrap">
                  {alert.vehiclePlate} ({alert.currentLocationName.split('-')[0]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident Details & Fast Action Response Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-800">سجل إشعارات الطوارئ الحالية</h3>
          {alerts.map((alert) => {
            const isActive = alert.status === 'active';
            const isSelected = selectedAlert?.id === alert.id;

            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-red-50/60 border-red-500 ring-2 ring-red-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl text-white ${
                        isActive ? 'bg-red-600' : 'bg-emerald-600'
                      }`}
                    >
                      {alert.emergencyType === 'breakdown' ? (
                        <Wrench className="w-4 h-4" />
                      ) : alert.emergencyType === 'medical' ? (
                        <HeartPulse className="w-4 h-4" />
                      ) : (
                        <Flame className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-900">{alert.vehiclePlate}</h4>
                      <p className="text-[10px] text-slate-500">{alert.origin} ← {alert.destination}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-red-100 text-red-800 animate-pulse'
                        : alert.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isActive ? 'استغاثة نشطة' : alert.status === 'in_progress' ? 'قيد المتابعة' : 'تم الحل'}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-red-700">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{alert.currentLocationName}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Incident Fast Command Panel */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <AppleBackButton
                    onClick={() => setSelectedAlert(null)}
                    label="العودة للبلاغات"
                    variant="light"
                    title="الرجوع لكافة بلاغات الرادار"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest block">
                      غرفة عمليات الاستجابة السريعة
                    </span>
                    <h3 className="font-black text-base text-slate-900 mt-0.5">
                      تفاصيل بلاغ الطوارئ: {selectedAlert.vehiclePlate}
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-400">{selectedAlert.timestamp}</span>
              </div>

              {/* Highway & Location Badge */}
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <span className="text-xs font-bold text-red-800 block mb-1">الموقع الجغرافي على خط السفر:</span>
                <p className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>{selectedAlert.currentLocationName}</span>
                </p>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-red-100">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Driver & Caller Contact Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">الكابتن المسؤول:</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedAlert.driverName}</span>
                  <a
                    href={`tel:${selectedAlert.driverPhone}`}
                    className="inline-flex items-center gap-1 text-[#0056B3] font-mono font-bold mt-1 hover:underline"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{selectedAlert.driverPhone}</span>
                  </a>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">مقدم البلاغ ({selectedAlert.callerRole === 'driver' ? 'الكابتن' : 'الراكب'}):</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedAlert.callerName}</span>
                  <a
                    href={`tel:${selectedAlert.callerPhone}`}
                    className="inline-flex items-center gap-1 text-emerald-700 font-mono font-bold mt-1 hover:underline"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{selectedAlert.callerPhone}</span>
                  </a>
                </div>
              </div>

              {/* Patrol Status */}
              {selectedAlert.dispatchedPatrol && (
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 flex items-center gap-2 text-xs text-blue-900">
                  <Truck className="w-4 h-4 text-[#0056B3]" />
                  <span>دورية الإسناد المتوجهة: <strong>{selectedAlert.dispatchedPatrol}</strong></span>
                </div>
              )}

              {/* Dispatch Patrol Form if toggled */}
              {showDispatchInput && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    تحديد دورية الفرزة أو فريق الإسناد
                  </label>
                  <input
                    type="text"
                    value={patrolName}
                    onChange={(e) => setPatrolName(e.target.value)}
                    placeholder="مثال: دورية فرزة ذمار المتنقلة (كابتن غمدان)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDispatchInput(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDispatchPatrol(selectedAlert.id)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#0056B3] rounded-lg"
                    >
                      تأكيد توجيه الدورية
                    </button>
                  </div>
                </div>
              )}

              {/* Emergency Operations Actions */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                {!showDispatchInput && selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => setShowDispatchInput(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#0056B3] hover:bg-[#003B7A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>توجيه دورية إسناد ميدانية</span>
                  </button>
                )}

                {selectedAlert.status !== 'resolved' ? (
                  <button
                    onClick={() => handleResolveAlert(selectedAlert.id)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تم حل البلاغ وتأمين الركاب</span>
                  </button>
                ) : (
                  <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-4 h-4" />
                    <span>تم حل هذا البلاغ وتأمين سلامة الركاب بنجاح</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">اختر بلاغاً من القائمة لعرض تفاصيل الطوارئ وتوجيه الإسناد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
