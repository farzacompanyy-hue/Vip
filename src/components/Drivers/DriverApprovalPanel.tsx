import React, { useState } from 'react';
import { DriverApplication, DriverStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { soundService } from '../../services/sound';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Star,
  Search,
  Eye,
  Shield,
  Phone,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import { AppleBackButton } from '../Common/AppleBackButton';

interface DriverApprovalPanelProps {
  drivers: DriverApplication[];
  onUpdateDrivers: (drivers: DriverApplication[]) => void;
}

export const DriverApprovalPanel: React.FC<DriverApprovalPanelProps> = ({
  drivers,
  onUpdateDrivers,
}) => {
  const { currentUser, logAudit } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState<DriverApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | DriverStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const filteredDrivers = drivers.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.fullName.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.plateNumber.includes(q) ||
        d.governorate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (driverId: string) => {
    const reviewer = currentUser?.fullName ? `${currentUser.fullName} (${currentUser.roleLabel} - ${currentUser.badgeNumber})` : 'إدارة الفرزة';
    storageService.updateDriverStatus(driverId, 'approved', reviewer, 'تم التحقق من رخصة القيادة وسلامة المركبة واعتماد السائق رسمياً.');
    const updated = storageService.getDrivers();
    onUpdateDrivers(updated);
    soundService.playSuccessTone();

    const targetDriver = updated.find((d) => d.id === driverId);
    logAudit('اعتماد كابتن ورخصة', 'drivers', `اعتماد الكابتن (${targetDriver?.fullName} - لوحة: ${targetDriver?.plateNumber}) ونشر رحلاته للركاب`);

    if (selectedDriver && selectedDriver.id === driverId) {
      setSelectedDriver(targetDriver || null);
    }
  };

  const handleReject = (driverId: string) => {
    const reviewer = currentUser?.fullName ? `${currentUser.fullName} (${currentUser.roleLabel} - ${currentUser.badgeNumber})` : 'إدارة الفرزة';
    const reason = rejectReason || 'نقص في وثائق الترخيص أو عدم وضوح صورة رخصة القيادة';
    storageService.updateDriverStatus(driverId, 'rejected', reviewer, reason);
    const updated = storageService.getDrivers();
    onUpdateDrivers(updated);
    setShowRejectInput(false);
    setRejectReason('');

    const targetDriver = updated.find((d) => d.id === driverId);
    logAudit('رفض طلب كابتن', 'drivers', `رفض اعتماد الكابتن (${targetDriver?.fullName})، السبب: ${reason}`);

    if (selectedDriver && selectedDriver.id === driverId) {
      setSelectedDriver(targetDriver || null);
    }
  };

  const counts = {
    pending: drivers.filter((d) => d.status === 'pending').length,
    approved: drivers.filter((d) => d.status === 'approved').length,
    rejected: drivers.filter((d) => d.status === 'rejected').length,
    suspended: drivers.filter((d) => d.status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0056B3]">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">لوحة اعتماد الكباتن ومراجعة الرخص</h2>
              <p className="text-xs text-slate-500">
                تدقيق وثائق الرخص، لوحات السيارات، واعتماد الكابتن لنشر الرحلات للركاب
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] text-amber-800 font-bold">بانتظار التدقيق</span>
            <span className="font-mono font-black text-amber-700 text-sm">{counts.pending}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-800 font-bold">كباتن معتمدين</span>
            <span className="font-mono font-black text-emerald-700 text-sm">{counts.approved}</span>
          </div>
          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] text-slate-600 font-bold">إجمالي الطلبات</span>
            <span className="font-mono font-black text-slate-800 text-sm">{drivers.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>معلق للتدقيق ({counts.pending})</span>
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>معتمد رسمياً ({counts.approved})</span>
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-[#0056B3] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كافة الكباتن ({drivers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، اللوحة، المحافظة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0056B3]"
          />
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredDrivers.map((driver) => {
          const isPending = driver.status === 'pending';
          const isApproved = driver.status === 'approved';

          return (
            <div
              key={driver.id}
              className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
                isApproved ? 'border-emerald-200' : 'border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={driver.licensePhotoUrl}
                      alt={driver.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{driver.fullName}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-mono text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {driver.rating}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{driver.phone}</span>
                      </span>
                      <span>•</span>
                      <span>{driver.governorate}</span>
                    </div>
                  </div>
                </div>

                {/* Status Pill */}
                <div>
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      معتمد
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      بانتظار المراجعة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      مرفوض
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle & Plate details */}
              <div className="py-3 grid grid-cols-2 gap-2 text-xs border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">مركبة الكابتن:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Car className="w-3.5 h-3.5 text-[#0056B3]" />
                    <span>{driver.vehicleModel}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">رقم اللوحة:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {driver.plateNumber}
                  </span>
                </div>
              </div>

              {/* Reviewer Note if available */}
              {driver.notes && (
                <div className="py-2.5 text-xs text-slate-600 bg-slate-50 px-3 rounded-xl mt-3 border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-0.5">ملاحظات التدقيق:</span>
                  <p className="text-[11px] leading-relaxed">{driver.notes}</p>
                  {driver.reviewedBy && (
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      بواسطة: {driver.reviewedBy} • {driver.reviewedAt}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedDriver(driver)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-[#0056B3] hover:bg-blue-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0056B3]" />
                  <span>معاينة الرخص والوثائق</span>
                </button>

                {isPending && (
                  <button
                    onClick={() => handleApprove(driver.id)}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>اعتماد فوري (1-Click)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Document Inspection Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header with Apple Back Navigation */}
            <div className="bg-gradient-to-r from-[#003B7A] to-[#0056B3] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <AppleBackButton
                  onClick={() => {
                    setSelectedDriver(null);
                    setShowRejectInput(false);
                  }}
                  label="رجوع"
                  variant="dark"
                  title="العودة لقائمة طلبات الكباتن"
                />
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    ملف تدقيق واعتماد الكابتن: {selectedDriver.fullName}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    رقم اللوحة: {selectedDriver.plateNumber} • هاتف: {selectedDriver.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDriver(null);
                  setShowRejectInput(false);
                }}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 transition cursor-pointer"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document inspection body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Document Images Grid */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#0056B3]" />
                  <span>الوثائق الثبوتية وصور التراخيص</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      رخصة القيادة الرسمية
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                      <img
                        src={selectedDriver.licensePhotoUrl}
                        alt="رخصة القيادة"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      صورة المركبة وفحص الفرزة
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                      <img
                        src={selectedDriver.vehiclePhotoUrl}
                        alt="صورة السيارة"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Checklist */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">الرقم الوطني / الهوية:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedDriver.nationalId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">سنة الصنع والموديل:</span>
                  <span className="font-bold text-slate-800">{selectedDriver.vehicleModel} ({selectedDriver.manufactureYear})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">إجمالي الرحلات السابقة:</span>
                  <span className="font-bold text-slate-800">{selectedDriver.totalTrips} رحلة</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">الحالة الراهنة:</span>
                  <span className="font-bold text-[#0056B3]">
                    {selectedDriver.status === 'approved' ? 'معتمد رسمياً' : 'قيد المراجعة والتدقيق'}
                  </span>
                </div>
              </div>

              {/* Rejection input area if toggled */}
              {showRejectInput && (
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 space-y-2">
                  <label className="block text-xs font-bold text-rose-800">
                    سبب رفض الطلب أو إعادة التعديل
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="يرجى كتابة سبب الرفض لتنبيه الكابتن في تطبيق وَصْلَة..."
                    className="w-full text-xs p-2.5 rounded-xl border border-rose-300 bg-white outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedDriver.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600"
                    >
                      تأكيد الرفض
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                إغلاق
              </button>

              <div className="flex items-center gap-2">
                {!showRejectInput && selectedDriver.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
                  >
                    رفض أو طلب تعديل
                  </button>
                )}

                {selectedDriver.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedDriver.id)}
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>اعتماد الكابتن فورياً</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
