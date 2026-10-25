import React, { useState } from 'react';
import { Vehicle, Passenger, VehicleCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Car,
  Users,
  Plus,
  ArrowUpRight,
  Printer,
  Luggage,
  CheckCircle2,
  Navigation,
  Clock,
  Filter,
} from 'lucide-react';
import { SeatSelectorModal } from './SeatSelectorModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { storageService } from '../../services/storage';

interface LiveDispatchQueueProps {
  vehicles: Vehicle[];
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
}

export const LiveDispatchQueue: React.FC<LiveDispatchQueueProps> = ({
  vehicles,
  onUpdateVehicles,
}) => {
  const { currentBranch, currentUser, logAudit } = useAuth();
  const [selectedVehicleForSeats, setSelectedVehicleForSeats] = useState<Vehicle | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<{ vehicle: Vehicle; passenger: Passenger } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_queue' | 'boarding' | 'departed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VehicleCategory>('all');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newGovernorate, setNewGovernorate] = useState('صنعاء - أجرة');
  const [newCategory, setNewCategory] = useState<VehicleCategory>('hilux');
  const [newModel, setNewModel] = useState('تويوتا هايلكس غمارة 2024');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDestination, setNewDestination] = useState('عدن (الشيخ عثمان)');
  const [newFare, setNewFare] = useState<number>(18000);

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    return true;
  });

  const handleSeatBooking = (passenger: Passenger) => {
    if (!selectedVehicleForSeats) return;

    // Attach staff audit identity to passenger
    const passengerWithAudit: Passenger = {
      ...passenger,
      dispatcherBadge: currentUser?.badgeNumber,
      dispatcherName: currentUser?.fullName,
      dispatcherId: currentUser?.id,
    };

    const updatedVehicle: Vehicle = {
      ...selectedVehicleForSeats,
      passengers: [...selectedVehicleForSeats.passengers, passengerWithAudit],
      availableSeats: Math.max(0, selectedVehicleForSeats.availableSeats - 1),
      status: selectedVehicleForSeats.availableSeats - 1 === 0 ? 'ready' : 'boarding',
    };

    const newVehiclesList = vehicles.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v));
    onUpdateVehicles(newVehiclesList);
    storageService.updateVehicle(updatedVehicle);

    // Record 20% platform & terminal transaction in ledger with staff audit trail
    const fare = passenger.farePaid;
    storageService.addTransaction({
      id: `tx-${Date.now()}`,
      tripId: updatedVehicle.id,
      branchId: currentBranch.id,
      ticketCode: passenger.ticketCode,
      amount: fare,
      platformFee: fare * 0.2, // 20% commission
      driverNet: fare * 0.8, // 80% captain net
      paymentMethod: passenger.paymentMethod,
      cashierName: currentUser?.fullName || 'مفوج الفرزة',
      cashierBadge: currentUser?.badgeNumber,
      cashierId: currentUser?.id,
      passengerName: passenger.fullName,
      route: `${currentBranch.city} -> ${updatedVehicle.destination}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isSynced: true,
    });

    logAudit(
      'حجز وتفويج مقعد',
      'dispatch',
      `حجز مقعد [${passenger.seatNumber}] للراكب (${passenger.fullName}) بالمركبة (${updatedVehicle.plateNumber})، تذكرة: ${passenger.ticketCode} بقيمة ${fare} ريال`
    );

    setSelectedVehicleForSeats(updatedVehicle);
    // Open thermal receipt modal immediately
    setActiveReceiptModal({
      vehicle: updatedVehicle,
      passenger: passengerWithAudit,
    });
  };

  const handleDispatchVehicle = (vehicleId: string) => {
    const target = vehicles.find((v) => v.id === vehicleId);
    if (!target) return;

    if (window.confirm(`هل أنت متأكد من تفويج ومغادرة المركبة [${target.plateNumber}] المتجهة إلى ${target.destination}؟`)) {
      const updated: Vehicle = {
        ...target,
        status: 'departed',
        departedAt: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedList = vehicles.map((v) => (v.id === vehicleId ? updated : v));
      onUpdateVehicles(updatedList);
      storageService.updateVehicle(updated);

      logAudit(
        'مغادرة وتفويج مركبة',
        'dispatch',
        `تفويج رسمي للسيارة (${target.plateNumber} - ${target.modelName}) المتجهة إلى (${target.destination}) بحمولة ${target.passengers.length} راكب`
      );
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newDriverName) {
      alert('يرجى ملء بيانات اللوحة واسم الكابتن');
      return;
    }

    let defaultSeats = 4;
    if (newCategory === 'hiace') defaultSeats = 14;
    if (newCategory === 'noah') defaultSeats = 7;
    if (newCategory === 'prado') defaultSeats = 6;

    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      plateNumber: newPlate,
      plateGovernorate: newGovernorate,
      category: newCategory,
      modelName: newModel,
      year: 2024,
      totalSeats: defaultSeats,
      availableSeats: defaultSeats,
      driverId: `drv-${Date.now()}`,
      driverName: newDriverName,
      driverPhone: newDriverPhone || '770000000',
      queuePosition: vehicles.length + 1,
      status: 'in_queue',
      destination: newDestination,
      farePerSeat: Number(newFare),
      createdAt: new Date().toISOString(),
      passengers: [],
    };

    const updated = [newVeh, ...vehicles];
    onUpdateVehicles(updated);
    storageService.addVehicle(newVeh);

    setShowAddVehicleModal(false);
    setNewPlate('');
    setNewDriverName('');
    setNewDriverPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: High-contrast buttons for outdoor sunlight */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">شاشة التفويج المباشر وإدارة الطوابير</h2>
            <span className="bg-blue-100 text-[#0056B3] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {currentBranch.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة إشغال المقاعد وتوثيق العفش والأمتعة وسندات البلوتوث الحرارية
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-[#0056B3] hover:bg-[#003B7A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-900/15 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سيارة في الطابور</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'all' ? 'bg-white text-[#0056B3] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter('boarding')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'boarding' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جاري التحميل ({vehicles.filter((v) => v.status === 'boarding').length})
          </button>
          <button
            onClick={() => setStatusFilter('in_queue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'in_queue' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            في الطابور ({vehicles.filter((v) => v.status === 'in_queue').length})
          </button>
          <button
            onClick={() => setStatusFilter('departed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'departed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            غادرت الفرزة ({vehicles.filter((v) => v.status === 'departed').length})
          </button>
        </div>

        {/* Fleet category selector */}
        <div className="flex items-center gap-1 text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">كافة أنواع الأسطول</option>
            <option value="hilux">هايلكس (Hilux)</option>
            <option value="hiace">هايس بلكة (HiAce)</option>
            <option value="noah">نوها عائلية (Noah)</option>
            <option value="prado">برادو VIP (Prado)</option>
          </select>
        </div>
      </div>

      {/* Vehicle Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredVehicles.map((vehicle) => {
          const bookedCount = vehicle.totalSeats - vehicle.availableSeats;
          const occupancyPct = Math.round((bookedCount / vehicle.totalSeats) * 100);
          const isFull = vehicle.availableSeats === 0;
          const isDeparted = vehicle.status === 'departed';

          return (
            <div
              key={vehicle.id}
              className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
                isDeparted
                  ? 'border-slate-200 opacity-80'
                  : isFull
                  ? 'border-emerald-300 ring-2 ring-emerald-100'
                  : 'border-slate-200 hover:border-[#0056B3]'
              }`}
            >
              {/* Card Header: Plate number, Category badge, Status */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-slate-900 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-inner">
                      {vehicle.plateNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold">{vehicle.plateGovernorate}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#0056B3]" />
                    <span>{vehicle.modelName}</span>
                  </h3>
                </div>

                {/* Status pill */}
                <div>
                  {isDeparted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      غادرت ({vehicle.departedAt || 'اليوم'})
                    </span>
                  ) : isFull ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      مكتملة وجاهزة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5" />
                      جاري التحميل
                    </span>
                  )}
                </div>
              </div>

              {/* Destination & Captain info */}
              <div className="py-3 grid grid-cols-2 gap-3 text-xs border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">الوجهة وخط السفر:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Navigation className="w-3.5 h-3.5 text-amber-500" />
                    <span>{vehicle.destination}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الكابتن السائق:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{vehicle.driverName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{vehicle.driverPhone}</span>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="py-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">
                    إشغال المقاعد ({bookedCount} من {vehicle.totalSeats})
                  </span>
                  <span className="font-black font-mono text-[#0056B3]">
                    {occupancyPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFull ? 'bg-emerald-500' : 'bg-[#0056B3]'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              {/* Luggage summary */}
              {vehicle.passengers.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Luggage className="w-3.5 h-3.5 text-amber-600" />
                    <span>عفش موثق:</span>
                    <span className="font-bold text-slate-800">
                      {vehicle.passengers.reduce((acc, p) => acc + p.luggage.length, 0)} قطعة
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 font-mono">
                    {vehicle.farePerSeat.toLocaleString()} ريال / مقعد
                  </span>
                </div>
              )}

              {/* Action Buttons: High contrast */}
              <div className="pt-1 flex items-center gap-2">
                {!isDeparted ? (
                  <>
                    <button
                      onClick={() => setSelectedVehicleForSeats(vehicle)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-[#0056B3] hover:bg-[#003B7A] transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>{isFull ? 'عرض المقاعد والتذاكر' : 'تسكين المقاعد وتوثيق العفش'}</span>
                    </button>

                    {isFull && (
                      <button
                        onClick={() => handleDispatchVehicle(vehicle.id)}
                        className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1 shadow-md shadow-emerald-700/20"
                        title="تفويج رسمي للسيارة للمغادرة إلى خط السفر"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>مغادرة وتفويج</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-xl">
                    <span>المركبة في طريق السفر حالياً</span>
                    {vehicle.passengers.length > 0 && (
                      <button
                        onClick={() => setSelectedVehicleForSeats(vehicle)}
                        className="text-[#0056B3] font-bold hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>استعراض تذاكر الرحلة</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedVehicleForSeats && (
        <SeatSelectorModal
          vehicle={selectedVehicleForSeats}
          onClose={() => setSelectedVehicleForSeats(null)}
          onSavePassenger={handleSeatBooking}
          onOpenReceipt={(passenger) => {
            setActiveReceiptModal({
              vehicle: selectedVehicleForSeats,
              passenger,
            });
          }}
        />
      )}

      {activeReceiptModal && (
        <ThermalReceiptModal
          vehicle={activeReceiptModal.vehicle}
          passenger={activeReceiptModal.passenger}
          farzaName={currentBranch.name}
          onClose={() => setActiveReceiptModal(null)}
        />
      )}

      {/* Add Vehicle To Queue Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">تسجيل مركبة جديدة في طابور الفرزة</h3>
            <p className="text-xs text-slate-500 mb-4">إدخال أسطول السيارات الحاضر في المحطة للتحميل المباشر</p>

            <form onSubmit={handleCreateVehicle} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع المركبة</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as VehicleCategory;
                      setNewCategory(cat);
                      if (cat === 'hilux') setNewModel('تويوتا هايلكس غمارة 2024');
                      if (cat === 'hiace') setNewModel('تويوتا هايس بلكة VIP 2023');
                      if (cat === 'noah') setNewModel('تويوتا نوها 7 راكب 2022');
                      if (cat === 'prado') setNewModel('تويوتا لاندكروزر برادو 2023');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                  >
                    <option value="hilux">هايلكس (4 مقاعد)</option>
                    <option value="hiace">هايس بلكة (14 مقعد)</option>
                    <option value="noah">نوها عائلية (7 مقاعد)</option>
                    <option value="prado">برادو VIP (6 مقاعد)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طراز وموديل المركبة</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="مثال: 14 / 88921"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">محافظة وفئة اللوحة</label>
                  <input
                    type="text"
                    value={newGovernorate}
                    onChange={(e) => setNewGovernorate(e.target.value)}
                    placeholder="صنعاء - أجرة"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الكابتن السائق</label>
                  <input
                    type="text"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="الكابتن ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم هاتف السائق</label>
                  <input
                    type="tel"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="77XXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوجهة المستهدفة</label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="عدن / تعز / مأرب"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر المقعد (ريال يمني)</label>
                  <input
                    type="number"
                    value={newFare}
                    onChange={(e) => setNewFare(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-emerald-700 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-[#0056B3] hover:bg-[#003B7A] text-white font-bold shadow-md cursor-pointer"
                >
                  إدراج في طابور الفرزة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
