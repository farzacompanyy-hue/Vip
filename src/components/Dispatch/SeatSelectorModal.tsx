import React, { useState } from 'react';
import { Vehicle, Passenger, LuggageItem } from '../../types';
import { X, User, Phone, MapPin, CreditCard, Luggage, Plus, Trash2, Printer, CheckCircle } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AppleBackButton } from '../Common/AppleBackButton';

interface SeatSelectorModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSavePassenger: (passenger: Passenger) => void;
  onOpenReceipt: (passenger: Passenger) => void;
}

export const SeatSelectorModal: React.FC<SeatSelectorModalProps> = ({
  vehicle,
  onClose,
  onSavePassenger,
  onOpenReceipt,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(() => {
    // Pick first available seat
    const bookedSeatNumbers = vehicle.passengers.map((p) => p.seatNumber);
    for (let i = 1; i <= vehicle.totalSeats; i++) {
      if (!bookedSeatNumbers.includes(i)) return i;
    }
    return null;
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'family'>('male');
  const [destinationDropoff, setDestinationDropoff] = useState('');
  const [farePaid, setFarePaid] = useState<number>(vehicle.farePerSeat);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'kuraimi' | 'jeeb' | 'one_cash'>('cash');
  const [luggageItems, setLuggageItems] = useState<LuggageItem[]>([
    {
      id: `lug-${Date.now()}`,
      tagCode: `LUG-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'bag',
      weightKg: 15,
      placement: 'trunk',
      description: 'حقيبة سفر قياسية',
    },
  ]);

  const bookedSeatsMap = new Map<number, Passenger>();
  vehicle.passengers.forEach((p) => bookedSeatsMap.set(p.seatNumber, p));

  const addLuggageItem = () => {
    setLuggageItems([
      ...luggageItems,
      {
        id: `lug-${Date.now()}-${luggageItems.length}`,
        tagCode: `LUG-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'bag',
        weightKg: 10,
        placement: vehicle.category === 'hiace' ? 'roof' : 'trunk',
        description: 'طرد / حقيبة إضافية',
      },
    ]);
  };

  const removeLuggageItem = (id: string) => {
    setLuggageItems(luggageItems.filter((item) => item.id !== id));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      alert('يرجى اختيار مقعد شاغر أولاً');
      return;
    }
    if (!fullName.trim()) {
      alert('يرجى إدخال اسم الراكب');
      return;
    }

    const newPassenger: Passenger = {
      id: `p-${Date.now()}`,
      seatNumber: selectedSeat,
      fullName: fullName.trim(),
      phone: phone.trim() || 'لا يوجد هاتف',
      gender,
      destinationDropoff: destinationDropoff.trim() || vehicle.destination,
      farePaid: Number(farePaid),
      paymentMethod,
      ticketCode: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      bookedAt: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      luggage: luggageItems,
    };

    soundService.playSuccessTone();
    onSavePassenger(newPassenger);
  };

  const existingPassengerAtSeat = selectedSeat ? bookedSeatsMap.get(selectedSeat) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header with Apple Back Navigation */}
        <div className="bg-gradient-to-r from-[#003B7A] to-[#0056B3] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <AppleBackButton onClick={onClose} label="رجوع" variant="dark" title="العودة لقائمة الرحلات والطوابير" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                  {vehicle.plateNumber}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg">
                  مخطط المقاعد وتفويج الركاب ({vehicle.modelName})
                </h3>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                الكابتن: {vehicle.driverName} • الوجهة: {vehicle.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Visual Seating Layout / Right Booking Form */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Seating Layout Column */}
          <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-700">مقدمة المركبة (كابينة القيادة)</span>
              <span className="font-bold text-[#0056B3]">
                {vehicle.availableSeats} مقاعد متبقية
              </span>
            </div>

            {/* Simulated Vehicle Interior */}
            <div className="w-full max-w-[280px] bg-slate-200 p-4 rounded-3xl border-2 border-slate-300 shadow-inner space-y-3">
              {/* Windshield & Driver Seat */}
              <div className="flex justify-between items-center bg-slate-300 p-2 rounded-xl text-slate-700 text-xs font-bold">
                <div className="flex items-center gap-1.5 bg-slate-400 text-white px-3 py-1.5 rounded-lg">
                  <span>الكابتن</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">طبلون التحكم</div>
              </div>

              {/* Dynamic Seat Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {Array.from({ length: vehicle.totalSeats }).map((_, idx) => {
                  const seatNum = idx + 1;
                  const passenger = bookedSeatsMap.get(seatNum);
                  const isBooked = !!passenger;
                  const isSelected = selectedSeat === seatNum;

                  let seatBg = 'bg-white border-slate-300 text-slate-700 hover:border-blue-400';
                  if (isSelected) {
                    seatBg = 'bg-[#0056B3] border-[#003B7A] text-white ring-4 ring-blue-200';
                  } else if (isBooked) {
                    if (passenger.gender === 'female') {
                      seatBg = 'bg-rose-100 border-rose-300 text-rose-800';
                    } else if (passenger.gender === 'family') {
                      seatBg = 'bg-purple-100 border-purple-300 text-purple-800';
                    } else {
                      seatBg = 'bg-emerald-100 border-emerald-300 text-emerald-800';
                    }
                  }

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      onClick={() => setSelectedSeat(seatNum)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 font-bold text-xs transition active:scale-95 shadow-sm ${seatBg}`}
                    >
                      <span className="text-[10px] opacity-75">مقعد</span>
                      <span className="text-base font-black font-mono">{seatNum}</span>
                      {isBooked && (
                        <span className="text-[9px] truncate max-w-full font-sans mt-0.5 font-medium">
                          {passenger.fullName.split(' ')[0]}
                        </span>
                      )}
                      {!isBooked && (
                        <span className="text-[9px] text-slate-400 font-normal">شاغر</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seating Legend */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4 text-[11px] font-bold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white border border-slate-300"></span>
                <span>شاغر متاح</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span>محجوز (رجال)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span>محجوز (نساء)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                <span>محجوز (عائلات)</span>
              </div>
            </div>
          </div>

          {/* Form Column: If seat is already booked, show passenger details & print ticket; if free, show booking form */}
          <div className="md:col-span-7 flex flex-col">
            {existingPassengerAtSeat ? (
              <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#0056B3] text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          تفاصيل تذكرة المقعد رقم [ {selectedSeat} ]
                        </h4>
                        <p className="text-xs text-[#0056B3] font-mono font-bold">
                          {existingPassengerAtSeat.ticketCode}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      مؤكد ومدفوع
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-500">اسم المسافر:</span>
                      <span className="font-bold text-slate-900">{existingPassengerAtSeat.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-500">رقم الهاتف:</span>
                      <span className="font-mono font-bold">{existingPassengerAtSeat.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-500">مكان النزول:</span>
                      <span className="font-bold">{existingPassengerAtSeat.destinationDropoff}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-500">المبلغ وطريقة الدفع:</span>
                      <span className="font-bold text-emerald-700">
                        {existingPassengerAtSeat.farePaid.toLocaleString()} ريال ({existingPassengerAtSeat.paymentMethod})
                      </span>
                    </div>
                    <div className="py-2">
                      <span className="font-bold text-slate-800 block mb-1">العفش الموثق:</span>
                      {existingPassengerAtSeat.luggage.length > 0 ? (
                        <div className="space-y-1">
                          {existingPassengerAtSeat.luggage.map((lug) => (
                            <div key={lug.id} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between text-[11px]">
                              <span className="font-mono font-bold text-[#0056B3]">{lug.tagCode}</span>
                              <span>{lug.description} ({lug.placement === 'roof' ? 'سقفية' : 'شنطة'})</span>
                              <span>{lug.weightKg ? `${lug.weightKg} كجم` : ''}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">بدون أمتعة مسجلة</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-200 mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(existingPassengerAtSeat)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة سند القبض والتذكرة الحرارية</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0056B3]" />
                    <span>تسكين وحجز المقعد رقم [ {selectedSeat || 'اختر'} ]</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    الأجرة: {vehicle.farePerSeat.toLocaleString()} ريال
                  </span>
                </div>

                {/* Passenger Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المسافر / رب الأسرة
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: يحيى صالح الحرازي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0056B3] outline-none"
                    required
                  />
                </div>

                {/* Phone & Gender Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#0056B3]" />
                      <span>رقم الهاتف (يمني)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77XXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-[#0056B3] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      فئة التسكين
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0056B3] outline-none"
                    >
                      <option value="male">رجال / شباب</option>
                      <option value="female">نساء</option>
                      <option value="family">عائلات</option>
                    </select>
                  </div>
                </div>

                {/* Dropoff location & Fare */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#0056B3]" />
                      <span>نقطة النزول المطلوبة</span>
                    </label>
                    <input
                      type="text"
                      value={destinationDropoff}
                      onChange={(e) => setDestinationDropoff(e.target.value)}
                      placeholder="مثال: جولة السفينة أو المجمع"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0056B3] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-[#0056B3]" />
                      <span>طريقة السداد</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0056B3] outline-none"
                    >
                      <option value="cash">نقداً في الفرزة (Cash)</option>
                      <option value="kuraimi">بنك الكريمي المميز (Kuraimi)</option>
                      <option value="jeeb">محفظة جيب (Jeeb)</option>
                      <option value="one_cash">ون كاش (OneCash)</option>
                    </select>
                  </div>
                </div>

                {/* Fare Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    قيمة التذكرة الإجمالية (ريال يمني)
                  </label>
                  <input
                    type="number"
                    value={farePaid}
                    onChange={(e) => setFarePaid(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:bg-white focus:border-[#0056B3] outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    سيتم احتساب 20% عمولة المنصة والفرزة ({(farePaid * 0.2).toLocaleString()} ريال) وصافي الكابتن 80% ({(farePaid * 0.8).toLocaleString()} ريال).
                  </p>
                </div>

                {/* Luggage Tagging Section */}
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Luggage className="w-3.5 h-3.5" />
                      <span>توثيق الأمتعة وتكت العفش لمنع التبديل</span>
                    </span>
                    <button
                      type="button"
                      onClick={addLuggageItem}
                      className="text-[11px] font-bold text-[#0056B3] hover:text-[#003B7A] flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة قطعة عفش</span>
                    </button>
                  </div>

                  {luggageItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                      <div className="col-span-3">
                        <span className="font-mono text-[11px] font-bold text-[#0056B3] block">{item.tagCode}</span>
                        <span className="text-[9px] text-slate-400">تكت أمتعة</span>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...luggageItems];
                            updated[idx].description = e.target.value;
                            setLuggageItems(updated);
                          }}
                          placeholder="وصف الحقيبة"
                          className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={item.placement}
                          onChange={(e) => {
                            const updated = [...luggageItems];
                            updated[idx].placement = e.target.value as any;
                            setLuggageItems(updated);
                          }}
                          className="w-full text-[11px] border border-slate-200 rounded px-1.5 py-1 outline-none"
                        >
                          <option value="trunk">شنطة خلفية</option>
                          <option value="roof">سقفية المركبة</option>
                          <option value="inside">داخل الصالون</option>
                        </select>
                      </div>
                      <div className="col-span-2 text-left">
                        <button
                          type="button"
                          onClick={() => removeLuggageItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Booking Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] shadow-lg shadow-blue-900/15 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تأكيد حجز المقعد وإصدار التذكرة</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
