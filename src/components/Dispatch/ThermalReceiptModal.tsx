import React, { useState } from 'react';
import { Vehicle, Passenger } from '../../types';
import { Printer, Check, X, QrCode, Bluetooth, Share2, Copy } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AppleBackButton } from '../Common/AppleBackButton';

interface ThermalReceiptModalProps {
  vehicle: Vehicle;
  passenger: Passenger;
  farzaName: string;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  vehicle,
  passenger,
  farzaName,
  onClose,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    soundService.playPrintChime();

    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 400);
  };

  const handleCopyText = () => {
    const text = `
----------------------------------
  تطبيق وَصْلَة - WASLA للفرزات
  سند قبض وتذكرة سفر ركاب
----------------------------------
الفرزة: ${farzaName}
التذكرة: ${passenger.ticketCode}
التاريخ: ${new Date().toLocaleDateString('ar-YE')} ${passenger.bookedAt}
المسار: ${vehicle.destination}
المركبة: ${vehicle.modelName}
رقم اللوحة: ${vehicle.plateNumber}
الكابتن: ${vehicle.driverName} (${vehicle.driverPhone})
الراكب: ${passenger.fullName}
المقعد: رقم [ ${passenger.seatNumber} ]
الأمتعة: ${passenger.luggage.length > 0 ? passenger.luggage.map(l => `${l.tagCode} (${l.placement})`).join('، ') : 'بدون أمتعة'}
الأجرة المدفوعة: ${passenger.farePaid.toLocaleString()} ريال يمني
طريقة السداد: ${passenger.paymentMethod}
----------------------------------
شكراً لاختياركم فرزات وَصْلَة - رافقتكم السلامة
----------------------------------
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header Bar with Apple Back Navigation */}
        <div className="bg-gradient-to-r from-[#003B7A] to-[#0056B3] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppleBackButton onClick={onClose} label="رجوع" variant="dark" title="العودة لشاشة الركاب والتفويج" />
            <div className="p-2 bg-white/10 apple-squircle-xs">
              <Printer className="w-5 h-5 text-amber-300 sf-icon" />
            </div>
            <div>
              <h3 className="font-bold text-sm">طباعة سند وتذكرة الفرزة</h3>
              <p className="text-[11px] text-blue-100">متوافق مع طابعات البلوتوث المحمولة (58/80mm)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Paper Simulation Preview */}
        <div className="p-5 bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt-printable"
            className="w-full max-w-[320px] bg-white p-5 rounded-xl shadow-md border border-slate-300 text-slate-900 font-mono text-xs leading-relaxed"
          >
            {/* Header Stamp */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
              <div className="inline-block p-1 bg-white rounded-lg mb-1 border border-slate-200">
                <img
                  src="/assets/aistudio/IMG_2782_9ea91479.jpeg"
                  alt="WASLA Logo"
                  className="h-10 mx-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_2778_cbee1f3e.jpeg';
                  }}
                />
              </div>
              <h4 className="font-extrabold text-sm text-[#003B7A] tracking-tight">وَصْلَة - WASLA</h4>
              <p className="text-[10px] text-slate-500 font-bold">شبكة النقل البري بين المحافظات</p>
              <p className="text-[10px] font-bold text-slate-700 mt-1">{farzaName}</p>
            </div>

            {/* Ticket Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span>رقم التذكرة:</span>
                <span className="text-[#0056B3] font-bold text-sm">{passenger.ticketCode}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>التاريخ والوقت:</span>
                <span>{new Date().toLocaleDateString('ar-YE')} {passenger.bookedAt}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>الوجهة:</span>
                <span className="font-bold text-slate-800">{vehicle.destination}</span>
              </div>
            </div>

            {/* Vehicle & Driver */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>المركبة:</span>
                <span className="font-bold">{vehicle.modelName}</span>
              </div>
              <div className="flex justify-between">
                <span>رقم اللوحة:</span>
                <span className="font-bold font-mono bg-slate-100 px-1 rounded">{vehicle.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>الكابتن:</span>
                <span>{vehicle.driverName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>هاتف السائق:</span>
                <span className="font-mono">{vehicle.driverPhone}</span>
              </div>
            </div>

            {/* Passenger & Seat */}
            <div className="py-2.5 border-b-2 border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between items-center">
                <span>المسافر:</span>
                <span className="font-bold text-slate-900">{passenger.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>رقم المقعد:</span>
                <span className="inline-block bg-[#0056B3] text-white px-2 py-0.5 rounded-md font-black text-sm">
                  مقعد [ {passenger.seatNumber} ]
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>مكان النزول:</span>
                <span className="truncate max-w-[170px]">{passenger.destinationDropoff || 'المحطة الرئيسية'}</span>
              </div>
            </div>

            {/* Luggage Tagging Documentation */}
            <div className="py-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                <span>توثيق العفش والأمتعة:</span>
                <span className="text-amber-700 font-mono">
                  {passenger.luggage.length > 0 ? `${passenger.luggage.length} حقائب` : 'بدون أمتعة'}
                </span>
              </div>
              {passenger.luggage.map((lug) => (
                <div key={lug.id} className="text-[10px] bg-amber-50/70 p-1 rounded mb-1 text-slate-700 flex justify-between">
                  <span className="font-bold font-mono text-amber-900">{lug.tagCode}</span>
                  <span>{lug.placement === 'roof' ? 'سقفية المركبة' : 'الشنطة الخلفية'}</span>
                  <span className="text-slate-500">{lug.weightKg ? `${lug.weightKg} كجم` : ''}</span>
                </div>
              ))}
            </div>

            {/* Financial & Payment */}
            <div className="py-2.5 space-y-1">
              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>المبلغ المدفوع:</span>
                <span className="text-emerald-700">{passenger.farePaid.toLocaleString()} ريال</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>طريقة الدفع:</span>
                <span className="font-bold">
                  {passenger.paymentMethod === 'kuraimi'
                    ? 'بنك الكريمي المميز'
                    : passenger.paymentMethod === 'jeeb'
                    ? 'محفظة جيب'
                    : passenger.paymentMethod === 'one_cash'
                    ? 'ون كاش'
                    : 'نقداً في الفرزة'}
                </span>
              </div>
            </div>

            {/* Staff Audit Stamp */}
            <div className="py-2 border-t border-dashed border-slate-300 text-[10px] text-slate-600 space-y-0.5">
              <div className="flex justify-between">
                <span>المفوج المسؤول:</span>
                <span className="font-bold text-slate-800">{passenger.dispatcherName || 'مفوج الفرزة المعتمد'}</span>
              </div>
              <div className="flex justify-between">
                <span>الشارة الوظيفية:</span>
                <span className="font-mono font-bold text-[#0056B3]">{passenger.dispatcherBadge || 'WSL-5520'}</span>
              </div>
            </div>

            {/* QR Code Barcode Representation */}
            <div className="pt-2 border-t border-dashed border-slate-300 text-center">
              <div className="flex items-center justify-center gap-2 py-1">
                <QrCode className="w-12 h-12 text-slate-800 sf-icon" />
                <div className="text-[9px] text-right font-mono text-slate-500">
                  <p>AUTH-WASLA-{passenger.ticketCode}</p>
                  <p>VERIFIED YEMEN TRANSIT</p>
                  <p>تذكرة سفر مؤمنة رسمياً</p>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 mt-1.5 font-sans font-bold">
                شكراً لاختياركم شبكة وَصْلَة - رافقتكم السلامة
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'تم النسخ!' : 'نسخ النص'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] shadow-md transition disabled:opacity-50"
            >
              <Bluetooth className="w-4 h-4 text-blue-200" />
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'جاري الإرسال للطابعة...' : 'طباعة حرارية فورية'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
