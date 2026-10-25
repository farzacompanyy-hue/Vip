export type StaffRole = 
  | 'super_admin'      // مدير النظام العام
  | 'station_manager'  // مدير فرزة / مشرف محطة
  | 'field_dispatcher' // مفوج ميداني ومسؤول طوابير
  | 'farza_cashier'    // محاسب فرزة وأمين صندوق
  | 'safety_officer';  // ضابط عمليات وسلامة

export interface StaffUser {
  id: string;
  badgeNumber: string; // رمز الشارة الوظيفية
  pinCode: string;     // رمز الدخول السري
  fullName: string;
  role: StaffRole;
  roleLabel: string;
  branchId: string;
  branchName: string;
  phone: string;
  avatarUrl?: string;
  isOnline: boolean;
  allowedModules: Array<'dispatch' | 'drivers' | 'ledger' | 'sos' | 'settings'>;
}

export interface FarzaBranch {
  id: string;
  name: string;
  city: string;
  governorate: string;
  address: string;
  supervisorName: string;
  activeVehiclesCount: number;
  openQueuesCount: number;
}

export type VehicleCategory = 'hilux' | 'hiace' | 'noah' | 'prado';

export interface Vehicle {
  id: string;
  plateNumber: string;
  plateGovernorate: string;
  category: VehicleCategory;
  modelName: string;
  year: number;
  totalSeats: number;
  availableSeats: number;
  driverId: string;
  driverName: string;
  driverPhone: string;
  queuePosition: number;
  status: 'in_queue' | 'boarding' | 'ready' | 'departed' | 'maintenance';
  destination: string;
  farePerSeat: number; // YER (ريال يمني)
  departedAt?: string;
  createdAt: string;
  registeredByBadge?: string;
  registeredByName?: string;
  passengers: Passenger[];
}

export interface Passenger {
  id: string;
  seatNumber: number;
  fullName: string;
  phone: string;
  gender: 'male' | 'female' | 'family';
  destinationDropoff: string;
  farePaid: number;
  paymentMethod: 'cash' | 'kuraimi' | 'jeeb' | 'one_cash';
  ticketCode: string;
  bookedAt: string;
  dispatcherBadge?: string;
  dispatcherName?: string;
  dispatcherId?: string;
  luggage: LuggageItem[];
}

export interface LuggageItem {
  id: string;
  tagCode: string; // e.g. LUG-7821
  type: 'bag' | 'box' | 'carton' | 'personal';
  weightKg?: number;
  placement: 'roof' | 'trunk' | 'inside';
  description: string;
}

export type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface DriverApplication {
  id: string;
  fullName: string;
  phone: string;
  nationalId: string;
  governorate: string;
  vehicleModel: string;
  vehicleCategory: VehicleCategory;
  plateNumber: string;
  manufactureYear: number;
  licensePhotoUrl: string;
  vehiclePhotoUrl: string;
  idCardPhotoUrl: string;
  status: DriverStatus;
  appliedDate: string;
  rating: number;
  totalTrips: number;
  notes?: string;
  reviewedBy?: string;
  reviewedByBadge?: string;
  reviewedAt?: string;
}

export interface FinancialTransaction {
  id: string;
  tripId: string;
  branchId: string;
  ticketCode: string;
  amount: number; // المبلغ الإجمالي
  platformFee: number; // 20% عمولة المنصة والفرزة
  driverNet: number; // 80% صافي السائق
  paymentMethod: 'cash' | 'kuraimi' | 'jeeb' | 'one_cash';
  referenceNumber?: string;
  cashierName: string;
  cashierBadge?: string;
  cashierId?: string;
  passengerName: string;
  route: string;
  timestamp: string;
  isSynced: boolean;
}

export interface ShiftHandoverReport {
  id: string;
  branchId: string;
  branchName: string;
  shiftType: 'morning' | 'evening' | 'night';
  openedAt: string;
  closedAt: string;
  cashierName: string;
  cashierBadge?: string;
  recipientName: string;
  totalTripsDispatched: number;
  totalRevenue: number;
  totalCommission20Pct: number;
  cashInSafe: number;
  kuraimiTotal: number;
  jeebTotal: number;
  oneCashTotal: number;
  discrepancy: number; // عجز أو زيادة
  supervisorNotes: string;
  status: 'active' | 'closed' | 'verified';
}

export type SosAlertSeverity = 'critical' | 'high' | 'medium';
export type SosAlertStatus = 'active' | 'in_progress' | 'resolved';

export interface EmergencySosAlert {
  id: string;
  tripId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
  callerRole: 'passenger' | 'driver';
  callerName: string;
  callerPhone: string;
  origin: string;
  destination: string;
  currentLocationName: string;
  gpsCoordinates?: { lat: number; lng: number };
  emergencyType: 'accident' | 'breakdown' | 'security' | 'medical';
  description: string;
  severity: SosAlertSeverity;
  status: SosAlertStatus;
  timestamp: string;
  resolvedAt?: string;
  dispatchedPatrol?: string;
  handledByBadge?: string;
  handledByName?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  module: 'dispatch' | 'drivers' | 'ledger' | 'sos' | 'auth';
  staffId: string;
  staffBadge: string;
  staffName: string;
  staffRole: StaffRole;
  branchId: string;
  branchName: string;
  details: string;
  timestamp: string;
}
