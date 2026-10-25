import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FARZA_BRANCHES, storageService } from '../../services/storage';
import { StaffUser, StaffRole } from '../../types';
import {
  ShieldCheck,
  MapPin,
  KeyRound,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  UserPlus,
  X,
  Plus,
} from 'lucide-react';
import { soundService } from '../../services/sound';

export const StaffLoginAuth: React.FC = () => {
  const { login } = useAuth();
  const [badgeNumber, setBadgeNumber] = useState('WSL-1001');
  const [branchId, setBranchId] = useState(FARZA_BRANCHES[0].id);
  const [pin, setPin] = useState('1001');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Staff Users List
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => storageService.getStaffUsers());
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // New staff form state
  const [newFullName, setNewFullName] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('field_dispatcher');
  const [newPhone, setNewPhone] = useState('77');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!badgeNumber.trim()) {
      setErrorMsg('يرجى إدخال رمز الشارة الوظيفية');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('يرجى إدخال رمز الـ PIN السري');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(badgeNumber, branchId, pin);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message || 'بيانات الدخول غير صحيحة');
      }
    }, 400);
  };

  const handleSelectStaffPreset = (badge: string, presetPin: string) => {
    setBadgeNumber(badge);
    setPin(presetPin);
    setErrorMsg('');
  };

  const handleCreateNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newBadge.trim() || !newPin.trim()) {
      return;
    }

    const roleLabels: Record<StaffRole, string> = {
      super_admin: 'الإدارة العامة (Super Admin)',
      station_manager: 'مدير فرزة / مشرف محطة',
      farza_cashier: 'محاسب ومساعد إدارة',
      field_dispatcher: 'مفوج ميداني ومساعد إدارة',
      safety_officer: 'ضابط أمن وسلامة SOS',
    };

    const roleModules: Record<StaffRole, ('dispatch' | 'drivers' | 'ledger' | 'sos' | 'settings')[]> = {
      super_admin: ['dispatch', 'drivers', 'ledger', 'sos', 'settings'],
      station_manager: ['dispatch', 'drivers', 'ledger', 'sos'],
      farza_cashier: ['ledger'],
      field_dispatcher: ['dispatch'],
      safety_officer: ['sos'],
    };

    const newUser: StaffUser = {
      id: `staff-${Date.now()}`,
      badgeNumber: newBadge.trim().toUpperCase(),
      pinCode: newPin.trim(),
      fullName: newFullName.trim(),
      role: newRole,
      roleLabel: roleLabels[newRole],
      branchId,
      branchName: FARZA_BRANCHES.find((b) => b.id === branchId)?.name || 'فرزة باب اليمن المركزية',
      phone: newPhone.trim(),
      isOnline: true,
      allowedModules: roleModules[newRole],
    };

    storageService.addStaffUser(newUser);
    const updated = storageService.getStaffUsers();
    setStaffUsers(updated);
    setBadgeNumber(newUser.badgeNumber);
    setPin(newUser.pinCode);
    setShowAddStaffModal(false);
    soundService.playSuccessTone();

    // Reset fields
    setNewFullName('');
    setNewBadge('');
    setNewPin('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003B7A] via-[#004C99] to-[#0056B3] flex items-center justify-center p-4 selection:bg-white selection:text-[#003B7A]">
      <div className="w-full max-w-lg">
        {/* Apple HIG App Icon Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-white/95 backdrop-blur-xl apple-squircle shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-4 border border-white/50">
            <img
              src="/assets/aistudio/IMG_2782_9ea91479.jpeg"
              alt="وَصْلَة WASLA"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_2778_cbee1f3e.jpeg';
              }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
            بوابة موظفي وإدارة وَصْلَة
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 font-medium">
            نظام التشغيل الميداني المعزول للموظفين • <span className="font-bold text-amber-300">WASLA Staff Portal</span>
          </p>
        </div>

        {/* High-Contrast Apple Squircle Card */}
        <div className="bg-white/98 backdrop-blur-2xl apple-squircle-xl shadow-[0_25px_60px_-15px_rgba(0,30,61,0.4)] p-6 sm:p-8 border border-white/70 text-slate-900">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 apple-squircle-sm bg-blue-50 text-[#0056B3] flex items-center justify-center shadow-xs border border-blue-100">
                <ShieldCheck className="w-5 h-5 sf-icon" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">تسجيل الدخول الميداني الموثق</h2>
                <p className="text-xs text-slate-400 font-medium">نظام العزل التام للمهام وتدقيق العمليات (Audit Trail)</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600 sf-icon" />
              <span>مشفر ومؤمن</span>
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 apple-squircle-sm bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Farza Branch Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0056B3] sf-icon" />
                <span>الفرزة الميدانية الحالية</span>
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 apple-squircle-sm px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#0056B3] focus:ring-4 focus:ring-blue-100 outline-none transition"
              >
                {FARZA_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} - {b.city} ({b.governorate})
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Badge ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0056B3] sf-icon" />
                <span>رمز الشارة الوظيفية (Staff Badge ID)</span>
              </label>
              <input
                type="text"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="مثال: WSL-1001 أو WSL-2002"
                className="w-full bg-slate-50 border border-slate-200 apple-squircle-sm px-3.5 py-3 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0056B3] focus:ring-4 focus:ring-blue-100 outline-none transition uppercase tracking-wide placeholder:text-slate-400"
                required
              />
            </div>

            {/* Secret PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#0056B3] sf-icon" />
                <span>الرمز السري للوردية (PIN Code)</span>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 apple-squircle-sm px-3.5 py-3 text-base font-mono tracking-widest text-center font-bold text-slate-900 focus:bg-white focus:border-[#0056B3] focus:ring-4 focus:ring-blue-100 outline-none transition"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 apple-squircle font-extrabold text-sm text-white bg-gradient-to-r from-[#0056B3] to-[#003B7A] hover:opacity-95 shadow-lg shadow-blue-900/25 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'جاري التحقق من الشارة الوظيفية...' : 'دخول المنظومة المعزولة'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 sf-icon" />
            </button>
          </form>

          {/* Quick Staff Badge Presets to test Per-User Isolation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 sf-icon" />
                <span>طاقم العمل والمسؤولين المعتمدين:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="text-[11px] font-bold text-[#0056B3] hover:text-[#003B7A] flex items-center gap-1 transition"
                title="إضافة موظف جديد لقاعدة البيانات"
              >
                <Plus className="w-3 h-3 sf-icon" />
                <span>إضافة موظف جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              {staffUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectStaffPreset(user.badgeNumber, user.pinCode)}
                  className={`p-2.5 apple-squircle-sm border transition text-right flex flex-col justify-between ${
                    badgeNumber.toUpperCase() === user.badgeNumber.toUpperCase()
                      ? 'border-[#0056B3] bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-blue-300 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-slate-800">{user.fullName.split(' ')[0]}</span>
                    <span className="font-mono text-[10px] font-black text-[#0056B3] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                      {user.badgeNumber}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                    {user.roleLabel}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              * بمجرد الدخول، سيتم تقييد الواجهة بالكامل باختصاص الموظف المذكور وتسجيل كل حركة باسمه.
            </p>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center mt-5 text-blue-200/90 text-xs flex items-center justify-center gap-3">
          <span>نظام مشفر طبقاً لمعايير Apple HIG</span>
          <span>•</span>
          <span>تسجيل خروج تلقائي عند الخمول</span>
          <span>•</span>
          <span>PWA v2.4</span>
        </div>
      </div>

      {/* Modal to Add New Staff Member Dynamically */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white apple-squircle-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 apple-squircle-sm bg-blue-50 text-[#0056B3] flex items-center justify-center">
                  <UserPlus className="w-5 h-5 sf-icon" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">إضافة موظف جديد للمنظومة</h3>
                  <p className="text-[10px] text-slate-400">مرونة التوسع وإضافة كادر الفرزة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف الثلاثي</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="مثال: صالح أحمد الأهدل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز الشارة (Badge ID)</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="مثال: WSL-5005"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز الـ PIN السري</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={6}
                    placeholder="••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-center font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الدور الوظيفي والصلاحية</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as StaffRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                >
                  <option value="field_dispatcher">مفوج ميداني ومساعد إدارة (طوابير وتذاكر)</option>
                  <option value="farza_cashier">محاسب ومساعد إدارة (دفتر مالي وتصفية)</option>
                  <option value="station_manager">مدير فرزة / مشرف محطة (إشراف شامل)</option>
                  <option value="safety_officer">ضابط أمن وسلامة SOS (رادار الطوارئ)</option>
                  <option value="super_admin">الإدارة العامة (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف للاتصال</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold outline-none text-left"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0056B3] hover:bg-[#003B7A] text-white font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 sf-icon" />
                  <span>حفظ وإضافة الموظف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
