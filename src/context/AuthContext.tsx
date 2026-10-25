import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { StaffUser, StaffRole, FarzaBranch } from '../types';
import { INITIAL_STAFF_USERS, FARZA_BRANCHES, storageService } from '../services/storage';

interface AuthContextType {
  currentUser: StaffUser | null;
  currentBranch: FarzaBranch;
  branches: FarzaBranch[];
  setCurrentBranch: (branch: FarzaBranch) => void;
  login: (badgeNumber: string, branchId: string, pin: string) => { success: boolean; message?: string };
  logout: () => void;
  canAccess: (module: 'dispatch' | 'drivers' | 'ledger' | 'sos' | 'settings') => boolean;
  getDefaultTabForUser: () => string;
  logAudit: (action: string, module: 'dispatch' | 'drivers' | 'ledger' | 'sos' | 'auth', details: string) => void;
  inactivityRemaining: number;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'wasla_isolated_staff_user_v2';
const CURRENT_BRANCH_KEY = 'wasla_isolated_branch_id_v2';
const INACTIVITY_TIMEOUT_SECONDS = 300; // 5 minutes of idle time on terminal

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default null so login is required with credentials for real per-user isolation
    return null;
  });

  const [currentBranch, setCurrentBranchState] = useState<FarzaBranch>(() => {
    try {
      const savedBranchId = localStorage.getItem(CURRENT_BRANCH_KEY);
      if (savedBranchId) {
        const found = FARZA_BRANCHES.find((b) => b.id === savedBranchId);
        if (found) return found;
      }
    } catch {}
    return FARZA_BRANCHES[0];
  });

  // Inactivity countdown timer
  const [inactivityRemaining, setInactivityRemaining] = useState<number>(INACTIVITY_TIMEOUT_SECONDS);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } catch {}
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const setCurrentBranch = (branch: FarzaBranch) => {
    setCurrentBranchState(branch);
    try {
      localStorage.setItem(CURRENT_BRANCH_KEY, branch.id);
    } catch {}
    if (currentUser) {
      const updated = {
        ...currentUser,
        branchId: branch.id,
        branchName: branch.name,
      };
      setCurrentUser(updated);
    }
  };

  const logAudit = useCallback(
    (action: string, module: 'dispatch' | 'drivers' | 'ledger' | 'sos' | 'auth', details: string) => {
      if (!currentUser) return;
      storageService.logAudit({
        action,
        module,
        staffId: currentUser.id,
        staffBadge: currentUser.badgeNumber,
        staffName: currentUser.fullName,
        staffRole: currentUser.role,
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        details,
      });
    },
    [currentUser, currentBranch]
  );

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setInactivityRemaining(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      logAudit('تسجيل خروج', 'auth', 'قام الموظف بتسجيل الخروج من البوابة الميدانية');
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, [currentUser, logAudit]);

  // Activity listeners for Auto-Logout
  useEffect(() => {
    if (!currentUser) return;

    const onUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'pointerdown'];
    events.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const idleTime = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_SECONDS - idleTime);
      setInactivityRemaining(remaining);

      if (remaining <= 0) {
        // Auto-logout triggered
        storageService.logAudit({
          action: 'إغلاق تلقائي للخمول (Auto-Lock)',
          module: 'auth',
          staffId: currentUser.id,
          staffBadge: currentUser.badgeNumber,
          staffName: currentUser.fullName,
          staffRole: currentUser.role,
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          details: 'تم قفل الجلسة الميدانية تلقائياً لحماية النظام بسبب خمول الشاشة لأكثر من 5 دقائق',
        });
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserActivity));
      clearInterval(interval);
    };
  }, [currentUser, currentBranch]);

  // Strict Authentication per badge & PIN
  const login = (badgeNumber: string, branchId: string, pin: string): { success: boolean; message?: string } => {
    const branch = FARZA_BRANCHES.find((b) => b.id === branchId) || FARZA_BRANCHES[0];
    const cleanBadge = badgeNumber.trim().toUpperCase();

    const registeredUser = storageService.getStaffUsers().find(
      (u) => u.badgeNumber.toUpperCase() === cleanBadge
    );

    if (!registeredUser) {
      return { success: false, message: 'رمز الشارة الوظيفية غير مسجل في منظومة فرزات وَصْلَة' };
    }

    if (registeredUser.pinCode !== pin.trim()) {
      return { success: false, message: 'الرمز السري للوردية (PIN) غير صحيح' };
    }

    // Isolate user with strict allowed modules
    const authenticatedUser: StaffUser = {
      ...registeredUser,
      branchId: branch.id,
      branchName: branch.name,
    };

    setCurrentUser(authenticatedUser);
    setCurrentBranch(branch);
    resetInactivityTimer();

    storageService.logAudit({
      action: 'تسجيل دخول معتمد',
      module: 'auth',
      staffId: authenticatedUser.id,
      staffBadge: authenticatedUser.badgeNumber,
      staffName: authenticatedUser.fullName,
      staffRole: authenticatedUser.role,
      branchId: branch.id,
      branchName: branch.name,
      details: `تم توثيق الدخول بالشارة (${authenticatedUser.badgeNumber}) والصلاحية: ${authenticatedUser.roleLabel}`,
    });

    return { success: true };
  };

  // Strict Per-Role Permission check (Per-User Isolation)
  const canAccess = (module: 'dispatch' | 'drivers' | 'ledger' | 'sos' | 'settings'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return currentUser.allowedModules.includes(module);
  };

  // Default tab when staff logs in (Strict landing view per role)
  const getDefaultTabForUser = (): string => {
    if (!currentUser) return 'dispatch';
    switch (currentUser.role) {
      case 'field_dispatcher':
        return 'dispatch';
      case 'farza_cashier':
        return 'ledger';
      case 'safety_officer':
        return 'sos';
      case 'station_manager':
        return 'dispatch';
      case 'super_admin':
      default:
        return 'dispatch';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentBranch,
        branches: FARZA_BRANCHES,
        setCurrentBranch,
        login,
        logout,
        canAccess,
        getDefaultTabForUser,
        logAudit,
        inactivityRemaining,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
