import {
  FarzaBranch,
  Vehicle,
  DriverApplication,
  FinancialTransaction,
  ShiftHandoverReport,
  EmergencySosAlert,
  StaffUser,
  AuditLogEntry,
} from '../types';

export const FARZA_BRANCHES: FarzaBranch[] = [
  {
    id: 'farza-sanaa-bab-yemen',
    name: 'فرزة باب اليمن المركزية',
    city: 'صنعاء',
    governorate: 'أمانة العاصمة',
    address: 'ساحة باب اليمن - بجوار بوابة المشير',
    supervisorName: 'أبو صخر السراجي',
    activeVehiclesCount: 18,
    openQueuesCount: 4,
  },
  {
    id: 'farza-aden-sheikh-othman',
    name: 'فرزة الشيخ عثمان الكبرى',
    city: 'عدن',
    governorate: 'عدن',
    address: 'جولة القاهرة - المجمع المركزي للنقل البري',
    supervisorName: 'كابتن وضاح العدني',
    activeVehiclesCount: 14,
    openQueuesCount: 3,
  },
  {
    id: 'farza-taiz-hawban',
    name: 'فرزة الحوبان المركزية',
    city: 'تعز',
    governorate: 'تعز',
    address: 'شارع الستين - تقاطع الحوبان',
    supervisorName: 'الحاج فؤاد المخلافي',
    activeVehiclesCount: 12,
    openQueuesCount: 3,
  },
  {
    id: 'farza-marib-central',
    name: 'فرزة مأرب بين المحافظات',
    city: 'مأرب',
    governorate: 'مأرب',
    address: 'طريق صافر - مثلث النقل الدولي',
    supervisorName: 'الشيخ صالح المرادي',
    activeVehiclesCount: 9,
    openQueuesCount: 2,
  },
  {
    id: 'farza-mukalla-fowa',
    name: 'فرزة فوة - المكلا',
    city: 'المكلا',
    governorate: 'حضرموت',
    address: 'مدخل فوة الغربي - محطة المسافرين',
    supervisorName: 'سعيد بن هلابي',
    activeVehiclesCount: 8,
    openQueuesCount: 2,
  },
];

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-admin',
    badgeNumber: 'WSL-1001',
    pinCode: '1001',
    fullName: 'الإدارة (مدير النظام العام)',
    role: 'super_admin',
    roleLabel: 'الإدارة العامة (Super Admin)',
    branchId: 'farza-sanaa-bab-yemen',
    branchName: 'فرزة باب اليمن المركزية',
    phone: '770001001',
    isOnline: true,
    allowedModules: ['dispatch', 'drivers', 'ledger', 'sos', 'settings'],
  },
  {
    id: 'staff-nujeem',
    badgeNumber: 'WSL-2002',
    pinCode: '2002',
    fullName: 'نجيم (مشرف المحطة ومدير الفرزة)',
    role: 'station_manager',
    roleLabel: 'مدير فرزة / مشرف محطة',
    branchId: 'farza-sanaa-bab-yemen',
    branchName: 'فرزة باب اليمن المركزية',
    phone: '770002002',
    isOnline: true,
    allowedModules: ['dispatch', 'drivers', 'ledger', 'sos'],
  },
  {
    id: 'staff-nasser',
    badgeNumber: 'WSL-3003',
    pinCode: '3003',
    fullName: 'ناصر (محاسب ومساعد إدارة)',
    role: 'farza_cashier',
    roleLabel: 'محاسب ومساعد إدارة',
    branchId: 'farza-sanaa-bab-yemen',
    branchName: 'فرزة باب اليمن المركزية',
    phone: '770003003',
    isOnline: true,
    allowedModules: ['ledger'],
  },
  {
    id: 'staff-naji',
    badgeNumber: 'WSL-4004',
    pinCode: '4004',
    fullName: 'ناجي (مفوج ميداني ومساعد إدارة)',
    role: 'field_dispatcher',
    roleLabel: 'مفوج ميداني ومساعد إدارة',
    branchId: 'farza-sanaa-bab-yemen',
    branchName: 'فرزة باب اليمن المركزية',
    phone: '770004004',
    isOnline: true,
    allowedModules: ['dispatch'],
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-hilux-1',
    plateNumber: '14 / 83921',
    plateGovernorate: 'صنعاء - أجرة',
    category: 'hilux',
    modelName: 'تويوتا هايلكس غمارة 2024',
    year: 2024,
    totalSeats: 4,
    availableSeats: 1,
    driverId: 'drv-101',
    driverName: 'الكابتن صخر الردفاني',
    driverPhone: '775892110',
    queuePosition: 1,
    status: 'boarding',
    destination: 'عدن (الشيخ عثمان - المعلا)',
    farePerSeat: 18000,
    createdAt: new Date().toISOString(),
    passengers: [
      {
        id: 'p-1',
        seatNumber: 1,
        fullName: 'عمار ياسر الحاشدي',
        phone: '770112233',
        gender: 'male',
        destinationDropoff: 'الشيخ عثمان - جولة السفينة',
        farePaid: 18000,
        paymentMethod: 'cash',
        ticketCode: 'TKT-2401',
        bookedAt: '10:15 ص',
        luggage: [
          { id: 'lug-1', tagCode: 'LUG-901', type: 'bag', weightKg: 15, placement: 'trunk', description: 'حقيبة سفر رمادية كبيرة' },
        ],
      },
      {
        id: 'p-2',
        seatNumber: 2,
        fullName: 'د. سمية نبيل الشرجبي',
        phone: '773445566',
        gender: 'female',
        destinationDropoff: 'المعلا - الشارع الرئيسي',
        farePaid: 18000,
        paymentMethod: 'kuraimi',
        ticketCode: 'TKT-2402',
        bookedAt: '10:20 ص',
        luggage: [
          { id: 'lug-2', tagCode: 'LUG-902', type: 'box', weightKg: 8, placement: 'trunk', description: 'كرتون أدوية محكم الإغلاق' },
        ],
      },
      {
        id: 'p-3',
        seatNumber: 3,
        fullName: 'هزاع محمد الصبيحي',
        phone: '711889900',
        gender: 'male',
        destinationDropoff: 'دار سعد - نقطة العلم',
        farePaid: 18000,
        paymentMethod: 'cash',
        ticketCode: 'TKT-2403',
        bookedAt: '10:35 ص',
        luggage: [
          { id: 'lug-3', tagCode: 'LUG-903', type: 'bag', weightKg: 12, placement: 'roof', description: 'شنطة قماشية خضراء' },
        ],
      },
    ],
  },
  {
    id: 'veh-hiace-2',
    plateNumber: '11 / 44902',
    plateGovernorate: 'صنعاء - نقل',
    category: 'hiace',
    modelName: 'تويوتا هايس بلكة VIP مكيفة',
    year: 2023,
    totalSeats: 14,
    availableSeats: 3,
    driverId: 'drv-102',
    driverName: 'الكابتن وضاح الصلوي',
    driverPhone: '734556677',
    queuePosition: 2,
    status: 'boarding',
    destination: 'تعز (الحوبان - دمنة خدير)',
    farePerSeat: 10000,
    createdAt: new Date().toISOString(),
    passengers: [
      {
        id: 'p-hiace-1',
        seatNumber: 1,
        fullName: 'عائلة سيف الأصبحي (3 مقاعد)',
        phone: '771998877',
        gender: 'family',
        destinationDropoff: 'الحوبان - سوق الصميل',
        farePaid: 30000,
        paymentMethod: 'kuraimi',
        ticketCode: 'TKT-5510',
        bookedAt: '09:40 ص',
        luggage: [
          { id: 'lug-h1', tagCode: 'LUG-611', type: 'bag', weightKg: 25, placement: 'roof', description: 'شنطتين عائلية كبار' },
          { id: 'lug-h2', tagCode: 'LUG-612', type: 'carton', weightKg: 10, placement: 'roof', description: 'كرتون مواد غذائية وهدايا' },
        ],
      },
      {
        id: 'p-hiace-2',
        seatNumber: 4,
        fullName: 'أحمد عبده المقرمي',
        phone: '772112244',
        gender: 'male',
        destinationDropoff: 'دمنة خدير',
        farePaid: 10000,
        paymentMethod: 'jeeb',
        ticketCode: 'TKT-5511',
        bookedAt: '09:55 ص',
        luggage: [],
      },
    ],
  },
  {
    id: 'veh-noah-3',
    plateNumber: '7 / 19283',
    plateGovernorate: 'عدن - خصوصي مؤهل',
    category: 'noah',
    modelName: 'تويوتا نوها عائلية حديثة 7 راكب',
    year: 2022,
    totalSeats: 7,
    availableSeats: 7,
    driverId: 'drv-103',
    driverName: 'الكابتن رمزي البيحاني',
    driverPhone: '779001122',
    queuePosition: 3,
    status: 'in_queue',
    destination: 'مأرب (المجمع - شارع الستين)',
    farePerSeat: 22000,
    createdAt: new Date().toISOString(),
    passengers: [],
  },
  {
    id: 'veh-prado-4',
    plateNumber: '2 / 99120',
    plateGovernorate: 'أمانة العاصمة',
    category: 'prado',
    modelName: 'تويوتا لاندكروزر برادو TXL VIP',
    year: 2023,
    totalSeats: 6,
    availableSeats: 6,
    driverId: 'drv-104',
    driverName: 'الكابتن فيصل الهمداني',
    driverPhone: '777334411',
    queuePosition: 4,
    status: 'in_queue',
    destination: 'المكلا - سيئون (حضرموت)',
    farePerSeat: 35000,
    createdAt: new Date().toISOString(),
    passengers: [],
  },
];

const INITIAL_DRIVER_APPLICATIONS: DriverApplication[] = [
  {
    id: 'app-drv-01',
    fullName: 'منصور قاسم العواضي',
    phone: '778901234',
    nationalId: '10029381923',
    governorate: 'إب / يريم',
    vehicleModel: 'تويوتا هايس سوبر ديلوكس 2024',
    vehicleCategory: 'hiace',
    plateNumber: '12 / 63821 نقل إب',
    manufactureYear: 2024,
    licensePhotoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60',
    idCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60',
    status: 'pending',
    appliedDate: '2026-10-24 14:30',
    rating: 4.9,
    totalTrips: 180,
    notes: 'أوراق الرخصة والفحص الدوري حديثة، السائق خبير في خط صنعاء - عدن ونقيل يسلح.',
  },
  {
    id: 'app-drv-02',
    fullName: 'ياسر علي بن بريك',
    phone: '774567890',
    nationalId: '05018274910',
    governorate: 'حضرموت - المكلا',
    vehicleModel: 'تويوتا لاندكروزر برادو 2023',
    vehicleCategory: 'prado',
    plateNumber: '5 / 11290 خصوصي حضرموت',
    manufactureYear: 2023,
    licensePhotoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60',
    idCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60',
    status: 'approved',
    appliedDate: '2026-10-23 09:15',
    rating: 5.0,
    totalTrips: 340,
    notes: 'معتمد رسمياً لنقل خط مأرب - المكلا - المهرة مع تركيب شاشات تتبع GPS.',
    reviewedBy: 'عبدالرحمن العنسي (مدير النظام)',
    reviewedAt: '2026-10-23 11:00',
  },
  {
    id: 'app-drv-03',
    fullName: 'حسان عبدالمجيد الشرعبي',
    phone: '735112233',
    nationalId: '03091827364',
    governorate: 'تعز',
    vehicleModel: 'تويوتا هايلكس غمارتين GLX 2022',
    vehicleCategory: 'hilux',
    plateNumber: '3 / 94012 أجرة تعز',
    manufactureYear: 2022,
    licensePhotoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60',
    idCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60',
    status: 'pending',
    appliedDate: '2026-10-24 11:45',
    rating: 4.7,
    totalTrips: 92,
    notes: 'بانتظار تصديق نقابة النقل البري في فرزة الحوبان، السيارة مجهزة بسلة عفش أصلية.',
  },
  {
    id: 'app-drv-04',
    fullName: 'فؤاد سالم باعباد',
    phone: '770998811',
    nationalId: '07038192831',
    governorate: 'شبوة - عتق',
    vehicleModel: 'تويوتا نوها هايبرد 2021',
    vehicleCategory: 'noah',
    plateNumber: '8 / 44810 خصوصي شبوة',
    manufactureYear: 2021,
    licensePhotoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    vehiclePhotoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60',
    idCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60',
    status: 'approved',
    appliedDate: '2026-10-22 16:00',
    rating: 4.8,
    totalTrips: 215,
    notes: 'تم فحص الإطارات وتوفير حقيبة الإسعافات الأولية وطفاية الحريق.',
    reviewedBy: 'طه الهتار (مدير المحطة)',
    reviewedAt: '2026-10-22 17:30',
  },
];

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-001',
    tripId: 'veh-hilux-1',
    branchId: 'farza-sanaa-bab-yemen',
    ticketCode: 'TKT-2401',
    amount: 18000,
    platformFee: 3600, // 20%
    driverNet: 14400, // 80%
    paymentMethod: 'cash',
    cashierName: 'نبيل شرف القدسي',
    passengerName: 'عمار ياسر الحاشدي',
    route: 'صنعاء -> عدن',
    timestamp: '2026-10-24 10:15',
    isSynced: true,
  },
  {
    id: 'tx-002',
    tripId: 'veh-hilux-1',
    branchId: 'farza-sanaa-bab-yemen',
    ticketCode: 'TKT-2402',
    amount: 18000,
    platformFee: 3600,
    driverNet: 14400,
    paymentMethod: 'kuraimi',
    referenceNumber: 'KUR-8849201',
    cashierName: 'نبيل شرف القدسي',
    passengerName: 'د. سمية نبيل الشرجبي',
    route: 'صنعاء -> عدن',
    timestamp: '2026-10-24 10:20',
    isSynced: true,
  },
  {
    id: 'tx-003',
    tripId: 'veh-hiace-2',
    branchId: 'farza-sanaa-bab-yemen',
    ticketCode: 'TKT-5510',
    amount: 30000,
    platformFee: 6000, // 20%
    driverNet: 24000, // 80%
    paymentMethod: 'kuraimi',
    referenceNumber: 'KUR-9003812',
    cashierName: 'نبيل شرف القدسي',
    passengerName: 'عائلة سيف الأصبحي',
    route: 'صنعاء -> تعز (الحوبان)',
    timestamp: '2026-10-24 09:40',
    isSynced: true,
  },
  {
    id: 'tx-004',
    tripId: 'veh-hiace-2',
    branchId: 'farza-sanaa-bab-yemen',
    ticketCode: 'TKT-5511',
    amount: 10000,
    platformFee: 2000,
    driverNet: 8000,
    paymentMethod: 'jeeb',
    referenceNumber: 'JEEB-44102',
    cashierName: 'نبيل شرف القدسي',
    passengerName: 'أحمد عبده المقرمي',
    route: 'صنعاء -> تعز (الحوبان)',
    timestamp: '2026-10-24 09:55',
    isSynced: true,
  },
  {
    id: 'tx-005',
    tripId: 'veh-prev-09',
    branchId: 'farza-sanaa-bab-yemen',
    ticketCode: 'TKT-1099',
    amount: 22000,
    platformFee: 4400,
    driverNet: 17600,
    paymentMethod: 'one_cash',
    referenceNumber: 'ONECASH-77189',
    cashierName: 'نبيل شرف القدسي',
    passengerName: 'صادق يحيى العولقي',
    route: 'صنعاء -> مأرب',
    timestamp: '2026-10-24 08:30',
    isSynced: true,
  },
];

const INITIAL_SOS_ALERTS: EmergencySosAlert[] = [
  {
    id: 'sos-001',
    tripId: 'trip-yerim-sanaa',
    vehiclePlate: '14 / 55192 أجرة',
    vehicleModel: 'تويوتا هايس 2023',
    driverName: 'الكابتن بشير الرداعي',
    driverPhone: '771239988',
    callerRole: 'driver',
    callerName: 'الكابتن بشير الرداعي',
    callerPhone: '771239988',
    origin: 'صنعاء (فرزة باب اليمن)',
    destination: 'عدن (الشيخ عثمان)',
    currentLocationName: 'نقيل يسلح - المنعطف الثالث قبل ذمار',
    gpsCoordinates: { lat: 14.7891, lng: 44.3412 },
    emergencyType: 'breakdown',
    description: 'عطل مفاجئ في مضخة الوقود وارتفاع حرارة المحرك في صعود نقيل يسلح، 12 راكباً مع عوائل في السيارة، مطلوب دورية دعم لسحب السيارة ونقل الركاب.',
    severity: 'critical',
    status: 'active',
    timestamp: 'منذ 8 دقائق (16:48)',
    dispatchedPatrol: 'دورية فرزة ذمار المتنقلة (كابتن غمدان)',
  },
  {
    id: 'sos-002',
    tripId: 'trip-taiz-aden',
    vehiclePlate: '3 / 88910 نقل',
    vehicleModel: 'تويوتا هايلكس 2022',
    driverName: 'الكابتن حميد الأثوري',
    driverPhone: '733221100',
    callerRole: 'passenger',
    callerName: 'الأستاذ رمزي المخلافي',
    callerPhone: '774889922',
    origin: 'تعز (الحوبان)',
    destination: 'عدن',
    currentLocationName: 'طريق هيجة العبد - بالقرب من نقطة المقاطرة',
    gpsCoordinates: { lat: 13.2104, lng: 44.1823 },
    emergencyType: 'security',
    description: 'توقف حركة السير بسبب انزلاق صخري طفيف وتكدس شاحنات، الركاب بخير ولا توجد إصابات، مطلوب إبلاغ غرفة العمليات لتوجيه السيارات البديلة عبر خط القبيطة.',
    severity: 'high',
    status: 'in_progress',
    timestamp: 'منذ 24 دقيقة (16:32)',
    dispatchedPatrol: 'غرفة طوارئ فرزة عدن - تنسيق أمن الطرق',
  },
];

class StorageService {
  private STORAGE_KEY_VEHICLES = 'wasla_staff_vehicles_v1';
  private STORAGE_KEY_DRIVERS = 'wasla_staff_drivers_v1';
  private STORAGE_KEY_TX = 'wasla_staff_transactions_v1';
  private STORAGE_KEY_HANDOVERS = 'wasla_staff_handovers_v1';
  private STORAGE_KEY_SOS = 'wasla_staff_sos_v1';
  private STORAGE_KEY_OFFLINE_QUEUE = 'wasla_staff_offline_queue_v1';
  private STORAGE_KEY_SUPABASE_CONFIG = 'wasla_staff_supabase_config_v1';
  private STORAGE_KEY_AUDIT = 'wasla_staff_audit_trail_v1';
  private STORAGE_KEY_STAFF = 'wasla_staff_users_v2';

  constructor() {
    this.initSeed();
  }

  private initSeed() {
    try {
      if (!localStorage.getItem(this.STORAGE_KEY_STAFF)) {
        localStorage.setItem(this.STORAGE_KEY_STAFF, JSON.stringify(INITIAL_STAFF_USERS));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_VEHICLES)) {
        localStorage.setItem(this.STORAGE_KEY_VEHICLES, JSON.stringify(INITIAL_VEHICLES));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_DRIVERS)) {
        localStorage.setItem(this.STORAGE_KEY_DRIVERS, JSON.stringify(INITIAL_DRIVER_APPLICATIONS));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_TX)) {
        localStorage.setItem(this.STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_SOS)) {
        localStorage.setItem(this.STORAGE_KEY_SOS, JSON.stringify(INITIAL_SOS_ALERTS));
      }
      if (!localStorage.getItem(this.STORAGE_KEY_OFFLINE_QUEUE)) {
        localStorage.setItem(this.STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('Storage initialization warning:', e);
    }
  }

  // Staff Users dynamic management
  public getStaffUsers(): StaffUser[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_STAFF);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_STAFF_USERS;
  }

  public saveStaffUsers(users: StaffUser[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY_STAFF, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }

  public addStaffUser(user: StaffUser) {
    const users = this.getStaffUsers();
    // Check if badge already exists
    const existingIndex = users.findIndex((u) => u.badgeNumber.toUpperCase() === user.badgeNumber.toUpperCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    this.saveStaffUsers(users);
    this.enqueueSync({ type: 'INSERT_STAFF_USER', payload: user, timestamp: new Date().toISOString() });
  }

  public removeStaffUser(userId: string) {
    const users = this.getStaffUsers().filter((u) => u.id !== userId);
    this.saveStaffUsers(users);
    this.enqueueSync({ type: 'DELETE_STAFF_USER', payload: { userId }, timestamp: new Date().toISOString() });
  }

  // Vehicles Queue
  public getVehicles(): Vehicle[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_VEHICLES);
      return data ? JSON.parse(data) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  }

  public saveVehicles(vehicles: Vehicle[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error(e);
    }
  }

  public addVehicle(vehicle: Vehicle) {
    const vehicles = this.getVehicles();
    vehicles.unshift(vehicle);
    this.saveVehicles(vehicles);
    this.enqueueSync({ type: 'INSERT_VEHICLE', payload: vehicle, timestamp: new Date().toISOString() });
  }

  public updateVehicle(vehicle: Vehicle) {
    const vehicles = this.getVehicles().map(v => (v.id === vehicle.id ? vehicle : v));
    this.saveVehicles(vehicles);
    this.enqueueSync({ type: 'UPDATE_VEHICLE', payload: vehicle, timestamp: new Date().toISOString() });
  }

  // Drivers
  public getDrivers(): DriverApplication[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_DRIVERS);
      return data ? JSON.parse(data) : INITIAL_DRIVER_APPLICATIONS;
    } catch {
      return INITIAL_DRIVER_APPLICATIONS;
    }
  }

  public saveDrivers(drivers: DriverApplication[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
    } catch (e) {
      console.error(e);
    }
  }

  public updateDriverStatus(driverId: string, status: DriverApplication['status'], reviewedBy: string, notes?: string) {
    const drivers = this.getDrivers().map(d => {
      if (d.id === driverId) {
        return {
          ...d,
          status,
          reviewedBy,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          notes: notes !== undefined ? notes : d.notes,
        };
      }
      return d;
    });
    this.saveDrivers(drivers);
    this.enqueueSync({ type: 'UPDATE_DRIVER_STATUS', payload: { driverId, status, reviewedBy, notes }, timestamp: new Date().toISOString() });
  }

  // Financial Ledger
  public getTransactions(): FinancialTransaction[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_TX);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  public addTransaction(tx: FinancialTransaction) {
    const txs = this.getTransactions();
    txs.unshift(tx);
    try {
      localStorage.setItem(this.STORAGE_KEY_TX, JSON.stringify(txs));
    } catch (e) {
      console.error(e);
    }
    this.enqueueSync({ type: 'INSERT_TRANSACTION', payload: tx, timestamp: new Date().toISOString() });
  }

  // Shift Handovers
  public getHandovers(): ShiftHandoverReport[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_HANDOVERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveHandover(report: ShiftHandoverReport) {
    const reports = this.getHandovers();
    reports.unshift(report);
    try {
      localStorage.setItem(this.STORAGE_KEY_HANDOVERS, JSON.stringify(reports));
    } catch (e) {
      console.error(e);
    }
    this.enqueueSync({ type: 'INSERT_HANDOVER', payload: report, timestamp: new Date().toISOString() });
  }

  // Emergency SOS Alerts
  public getSosAlerts(): EmergencySosAlert[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_SOS);
      return data ? JSON.parse(data) : INITIAL_SOS_ALERTS;
    } catch {
      return INITIAL_SOS_ALERTS;
    }
  }

  public saveSosAlerts(alerts: EmergencySosAlert[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY_SOS, JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }

  public updateSosStatus(alertId: string, status: EmergencySosAlert['status'], patrol?: string) {
    const alerts = this.getSosAlerts().map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status,
          dispatchedPatrol: patrol || a.dispatchedPatrol,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : a.resolvedAt,
        };
      }
      return a;
    });
    this.saveSosAlerts(alerts);
    this.enqueueSync({ type: 'UPDATE_SOS_STATUS', payload: { alertId, status, patrol }, timestamp: new Date().toISOString() });
  }

  public addSosAlert(alert: EmergencySosAlert) {
    const alerts = this.getSosAlerts();
    alerts.unshift(alert);
    this.saveSosAlerts(alerts);
    this.enqueueSync({ type: 'INSERT_SOS_ALERT', payload: alert, timestamp: new Date().toISOString() });
  }

  // Offline Sync Queue
  public getOfflineQueue(): Array<{ type: string; payload: any; timestamp: string }> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public enqueueSync(item: { type: string; payload: any; timestamp: string }) {
    const queue = this.getOfflineQueue();
    queue.push(item);
    try {
      localStorage.setItem(this.STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error(e);
    }
  }

  public clearOfflineQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  }

  // Supabase Configuration Simulation & Real Hook
  public getSupabaseConfig(): { url: string; anonKey: string; isConnected: boolean } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_SUPABASE_CONFIG);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return {
      url: 'https://wasla-yemen-transport.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.wasla_shared_db_yemen_farzat_production',
      isConnected: true,
    };
  }

  public saveSupabaseConfig(config: { url: string; anonKey: string; isConnected: boolean }) {
    try {
      localStorage.setItem(this.STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }

  // Audit Trail Logging
  public getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_AUDIT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    logs.unshift(newEntry);
    // Keep last 300 audit events
    if (logs.length > 300) logs.pop();
    try {
      localStorage.setItem(this.STORAGE_KEY_AUDIT, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
    this.enqueueSync({ type: 'INSERT_AUDIT_LOG', payload: newEntry, timestamp: newEntry.timestamp });
  }
}

export const storageService = new StorageService();
