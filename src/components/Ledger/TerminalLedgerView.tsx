import React, { useState } from 'react';
import { FinancialTransaction, ShiftHandoverReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  X,
  Wallet,
} from 'lucide-react';
import { AppleBackButton } from '../Common/AppleBackButton';

interface TerminalLedgerViewProps {
  transactions: FinancialTransaction[];
  onUpdateTransactions: (txs: FinancialTransaction[]) => void;
}

export const TerminalLedgerView: React.FC<TerminalLedgerViewProps> = ({
  transactions,
}) => {
  const { currentBranch, currentUser, logAudit } = useAuth();
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'kuraimi' | 'jeeb' | 'one_cash'>('all');

  // Handover form state
  const [shiftType, setShiftType] = useState<'morning' | 'evening' | 'night'>('morning');
  const [recipientName, setRecipientName] = useState('طه الهتار (مدير المحطة)');
  const [countedCash, setCountedCash] = useState<number>(0);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [savedHandoverSuccess, setSavedHandoverSuccess] = useState(false);

  // Financial calculations
  const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalCommission20Pct = transactions.reduce((acc, t) => acc + t.platformFee, 0);
  const totalDriverNet80Pct = transactions.reduce((acc, t) => acc + t.driverNet, 0);

  const cashTotal = transactions.filter((t) => t.paymentMethod === 'cash').reduce((acc, t) => acc + t.amount, 0);
  const kuraimiTotal = transactions.filter((t) => t.paymentMethod === 'kuraimi').reduce((acc, t) => acc + t.amount, 0);
  const jeebTotal = transactions.filter((t) => t.paymentMethod === 'jeeb').reduce((acc, t) => acc + t.amount, 0);
  const oneCashTotal = transactions.filter((t) => t.paymentMethod === 'one_cash').reduce((acc, t) => acc + t.amount, 0);

  const filteredTransactions = transactions.filter((t) => {
    if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ['رقم السند', 'الوقت والتاريخ', 'الراكب', 'المسار', 'طريقة الدفع', 'المبلغ الإجمالي', 'عمولة 20%', 'صافي السائق 80%', 'المحصل', 'شارة المحصل'];
    const rows = transactions.map((t) => [
      t.ticketCode,
      t.timestamp,
      `"${t.passengerName}"`,
      `"${t.route}"`,
      t.paymentMethod,
      t.amount,
      t.platformFee,
      t.driverNet,
      `"${t.cashierName}"`,
      t.cashierBadge || '-',
    ]);

    // Use BOM \uFEFF for proper Arabic UTF-8 rendering in Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WASLA_Farza_Ledger_${currentBranch.city}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenHandover = () => {
    setCountedCash(cashTotal);
    setShowHandoverModal(true);
    setSavedHandoverSuccess(false);
  };

  const handleSaveHandover = (e: React.FormEvent) => {
    e.preventDefault();
    const discrepancy = Number(countedCash) - cashTotal;

    const report: ShiftHandoverReport = {
      id: `shift-${Date.now()}`,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      shiftType,
      openedAt: '08:00 ص',
      closedAt: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      cashierName: currentUser?.fullName || 'محاسب الفرزة',
      cashierBadge: currentUser?.badgeNumber,
      recipientName,
      totalTripsDispatched: transactions.length,
      totalRevenue,
      totalCommission20Pct,
      cashInSafe: Number(countedCash),
      kuraimiTotal,
      jeebTotal,
      oneCashTotal,
      discrepancy,
      supervisorNotes: supervisorNotes || 'تمت المطابقة والتسليم بنجاح دون ملاحظات',
      status: 'closed',
    };

    storageService.saveHandover(report);
    logAudit(
      'إقفال وردية مالية وتسليم عهدة',
      'ledger',
      `إغلاق الوردية (${shiftType}) بمبيعات ${totalRevenue.toLocaleString()} ريال، عمولة 20% (${totalCommission20Pct.toLocaleString()} ريال)، نقدية الصندوق: ${countedCash.toLocaleString()} ريال، تسليم إلى: ${recipientName}`
    );
    setSavedHandoverSuccess(true);
    setTimeout(() => {
      setShowHandoverModal(false);
      setSavedHandoverSuccess(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0056B3]">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">الدفتر المالي وعمولات الوردية (20%)</h2>
              <p className="text-xs text-slate-500">
                إدارة نقدية الصندوق، تحويلات الكريمي والمحافظ، وتصفية وتسليم الوردية المالية
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={exportToCSV}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير إكسل (CSV)</span>
          </button>

          <button
            onClick={handleOpenHandover}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0056B3] hover:bg-[#003B7A] text-white font-bold text-xs shadow-md shadow-blue-900/15 transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>محضر تسليم وتصفية الوردية (Cash Closure)</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي التحصيل والمبيعات</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-black text-2xl text-slate-900">{totalRevenue.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">ريال</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>إجمالي {transactions.length} تذكرة مؤكدة</span>
          </div>
        </div>

        {/* 20% WASLA Commission */}
        <div className="bg-gradient-to-br from-[#003B7A] to-[#0056B3] text-white rounded-2xl p-5 shadow-sm border border-blue-600">
          <span className="text-xs font-bold text-blue-100 block mb-1">عمولة المنصة والفرزة (20%)</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-black text-2xl text-amber-300">{totalCommission20Pct.toLocaleString()}</span>
            <span className="text-xs font-bold text-blue-100">ريال</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-200 flex items-center gap-1">
            <span>محسوبة آلياً بنسبة 20% قطعية</span>
          </div>
        </div>

        {/* 80% Captain Net Payout */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">صافي مستحقات الكباتن (80%)</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-black text-2xl text-emerald-700">{totalDriverNet80Pct.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">ريال</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-bold">
            جاهزة للتسليم للكباتن عند المغادرة
          </div>
        </div>

        {/* Cash in Hand (Physical Safe) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">النقدية الفعلية بالصندوق (Cash)</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-black text-2xl text-blue-900">{cashTotal.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">ريال</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            الكريمي: {kuraimiTotal.toLocaleString()} | جيب: {jeebTotal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-[#0056B3]" />
          <span>توزيع السيولة حسب القنوات المالية</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">نقد كاش (الخزينة)</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{cashTotal.toLocaleString()} ريال</span>
          </div>
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
            <span className="text-[10px] text-blue-800 font-bold block">بنك الكريمي المميز</span>
            <span className="font-mono font-bold text-[#0056B3] text-sm">{kuraimiTotal.toLocaleString()} ريال</span>
          </div>
          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200">
            <span className="text-[10px] text-purple-800 font-bold block">محفظة جيب (Jeeb)</span>
            <span className="font-mono font-bold text-purple-900 text-sm">{jeebTotal.toLocaleString()} ريال</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold block">ون كاش ومحافظ أخرى</span>
            <span className="font-mono font-bold text-emerald-900 text-sm">{oneCashTotal.toLocaleString()} ريال</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">سجل القيود المالية للحجوزات</h3>
            <span className="text-xs text-slate-400">({filteredTransactions.length} حركة مسجلة)</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">تصفية القناة:</span>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">كافة القنوات</option>
              <option value="cash">نقداً فقط</option>
              <option value="kuraimi">الكريمي فقط</option>
              <option value="jeeb">جيب فقط</option>
              <option value="one_cash">ون كاش فقط</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">رقم السند</th>
                <th className="py-3 px-4">المسافر والمسار</th>
                <th className="py-3 px-4">طريقة السداد</th>
                <th className="py-3 px-4">المبلغ الإجمالي</th>
                <th className="py-3 px-4 text-[#0056B3]">عمولة الفرزة (20%)</th>
                <th className="py-3 px-4 text-emerald-700">صافي الكابتن (80%)</th>
                <th className="py-3 px-4">المحصل والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#0056B3]">
                    {tx.ticketCode}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{tx.passengerName}</span>
                    <span className="text-[11px] text-slate-400">{tx.route}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.paymentMethod === 'cash'
                          ? 'bg-slate-100 text-slate-700'
                          : tx.paymentMethod === 'kuraimi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {tx.paymentMethod === 'cash'
                        ? 'كاش'
                        : tx.paymentMethod === 'kuraimi'
                        ? 'الكريمي'
                        : tx.paymentMethod === 'jeeb'
                        ? 'جيب'
                        : 'ون كاش'}
                    </span>
                    {tx.referenceNumber && (
                      <span className="font-mono text-[9px] text-slate-400 block">{tx.referenceNumber}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {tx.amount.toLocaleString()} ريال
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0056B3]">
                    {tx.platformFee.toLocaleString()} ريال
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {tx.driverNet.toLocaleString()} ريال
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">
                    <span>{tx.cashierName}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{tx.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Handover Modal (Cash Closure) */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <AppleBackButton
                  onClick={() => setShowHandoverModal(false)}
                  label="رجوع"
                  variant="light"
                  title="العودة لسجل المعاملات المالية"
                />
                <div className="p-2 bg-blue-50 text-[#0056B3] apple-squircle-xs">
                  <UserCheck className="w-5 h-5 sf-icon" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    محضر تسليم وتصفية الوردية المالية
                  </h3>
                  <p className="text-xs text-slate-500">{currentBranch.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedHandoverSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-slate-900 text-base">تم إغلاق الوردية وتسليم العهدة بنجاح</h4>
                <p className="text-xs text-slate-500">تم تسجيل المحضر وتصديره في السجل المالي للفرزة</p>
              </div>
            ) : (
              <form onSubmit={handleSaveHandover} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نوع الوردية</label>
                    <select
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    >
                      <option value="morning">الوردية الصباحية (08:00 - 16:00)</option>
                      <option value="evening">الوردية المسائية (16:00 - 24:00)</option>
                      <option value="night">الوردية الليلية (24:00 - 08:00)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المحاسب المسلّم</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.fullName || 'محاسب الفرزة'}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المشرف / المحاسب المستلِم للعهدة</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="اسم المستلم..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    required
                  />
                </div>

                {/* Totals Summary */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">إجمالي المبيعات المحصلة:</span>
                    <span className="font-mono font-bold text-slate-800">{totalRevenue.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">عمولة الفرزة والمنصة (20%):</span>
                    <span className="font-mono font-bold text-[#0056B3]">{totalCommission20Pct.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                    <span className="text-slate-700">النقد المفترض بالصندوق (Cash):</span>
                    <span className="font-mono text-emerald-700">{cashTotal.toLocaleString()} ريال</span>
                  </div>
                </div>

                {/* Counted Cash and Discrepancy */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المبلغ النقدي المحصور فعلياً في الصندوق (ريال)
                  </label>
                  <input
                    type="number"
                    value={countedCash}
                    onChange={(e) => setCountedCash(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-black text-sm text-slate-900 outline-none"
                    required
                  />

                  {/* Discrepancy Feedback */}
                  <div className="mt-2">
                    {Number(countedCash) === cashTotal ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>مطابق 100% للنظام بدون أي عجز أو زيادة</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>
                          يوجد فارق قدره ({(Number(countedCash) - cashTotal).toLocaleString()} ريال) {Number(countedCash) < cashTotal ? 'عجز' : 'زيادة'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ملاحظات تسليم الوردية</label>
                  <textarea
                    value={supervisorNotes}
                    onChange={(e) => setSupervisorNotes(e.target.value)}
                    placeholder="تم تسليم الخزينة وتصفية الكروت..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none"
                    rows={2}
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHandoverModal(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-[#0056B3] hover:bg-[#003B7A] text-white font-bold shadow-md cursor-pointer"
                  >
                    اعتماد المحضر وتصفية الوردية
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
