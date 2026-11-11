import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import {
  Droplets,
  ShieldCheck,
  LogOut,
  CircleUser,
  MapPin,
  CalendarCheck,
  ShoppingBag,
  ExternalLink,
  Download,
  Store,
  Scale,
  WashingMachine,
  Truck,
  Settings,
  Smartphone,
  Bike,
  Radio,
  Wallet,
  PlusCircle,
  Power,
} from "lucide-react";

import {
  Home,
  PriceInfo,
  StoresMapPage,
  Contact,
} from "./pages/CustomerWeb/index";
import { AdminLogin } from "./pages/Login/index";
import { AdminDashboard } from "./pages/Admin/Dashboard/index";
import { AdminOrders } from "./pages/Admin/Orders/index";
import { AdminUsers } from "./pages/Admin/Users/index";
import { AdminProducts } from "./pages/Admin/Products/index";
import { AdminServices } from "./pages/Admin/Services/index";
import { AdminStoresPage } from "./pages/Admin/Stores/index";
import { StoreOwnerDashboard } from "./pages/StoreOwner/Dashboard/index";
import { StoreOwnerOrders } from "./pages/StoreOwner/Orders/index";
import { StoreOwnerEquipment } from "./pages/StoreOwner/Equipment/index";
import { StoreOwnerDeliveries } from "./pages/StoreOwner/Deliveries/index";
import { StoreOwnerSettings } from "./pages/StoreOwner/Settings/index";
import { StoreOwnerMobilePlan } from "./pages/StoreOwner/MobilePlan/index";
import { StoreOwnerLogin } from "./pages/StoreOwner/Login/index";
import {
  MobileCustomerHome,
  MobileCustomerCreateOrder,
  MobileCustomerWeightConfirm,
  MobileCustomerTracking,
  MobileCustomerAuth,
  MobileCustomerProfile,
} from "./pages/MobileCustomer/index";
import {
  MobileDriverRadar,
  MobileDriverActiveTask,
  MobileDriverWallet,
  MobileDriverAuth,
  MobileDriverProfile,
} from "./pages/MobileDriver/index";
import {
  DriverRadarProvider,
  useMobileDriverRadar,
} from "./pages/MobileDriver/BroadcastRadar/hook";
import { DriverIncomingOrderModal } from "./components/DriverIncomingOrderModal";
import { MobileNav } from "./components/MobileNav";
import { InstallAppModal } from "./components/InstallAppModal";
import { PersonalProfileModal } from "./components/PersonalProfileModal";
import { MobileAppSplash } from "./components/MobileAppSplash";
import { SystemDesignPage } from "./pages/SystemDesign/index";
import { ToastProvider, useToast } from "./components/Toast";
import { LoadingProvider } from "./context/LoadingContext";
import {
  getScopedToken,
  getScopedProfile,
  clearScopedSession,
} from "./utils/authStorage";

const normalizeRole = (rawRole?: string | null): string | null => {
  if (!rawRole) return null;
  if (rawRole === "store_manager") return "store_owner";
  if (rawRole === "shipper") return "driver";
  return rawRole;
};

// Router guard to protect Mobile Customer App endpoints (Strictly isolated to "customer" scope)
const CustomerRoute = ({ children }: { children: React.ReactElement }) => {
  const token = getScopedToken("customer");
  const profile = getScopedProfile("customer");
  const role = normalizeRole(profile?.role);
  const location = useLocation();

  if (!token || (role && role !== "user" && role !== "admin")) {
    return (
      <Navigate
        to={`/mobile-customer/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};

// Router guard to protect Store Owner Web Portal endpoints (Strictly isolated to "store_owner" scope)
const StoreOwnerRoute = ({ children }: { children: React.ReactElement }) => {
  const token = getScopedToken("store_owner");
  const profile = getScopedProfile("store_owner");
  const adminToken = getScopedToken("admin");
  const role = normalizeRole(profile?.role);
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!token && !adminToken) {
      showToast(
        "Vui lòng đăng nhập Cổng Chủ Cửa Hàng (/store-owner/login) để truy cập!",
        "warning",
      );
    } else if (role && role !== "store_owner" && role !== "admin" && !adminToken) {
      showToast("Tài khoản hiện tại không có quyền Chủ cửa hàng!", "error");
    }
  }, [token, adminToken, role, showToast]);

  if (!token && !adminToken) {
    return (
      <Navigate
        to={`/store-owner/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (role && role !== "store_owner" && role !== "admin" && !adminToken) {
    return <Navigate to="/store-owner/login" replace />;
  }

  return children;
};

// Router guard to protect Mobile Driver / Shipper App endpoints (Strictly isolated to "driver" scope)
const DriverRoute = ({ children }: { children: React.ReactElement }) => {
  const token = getScopedToken("driver");
  const profile = getScopedProfile("driver");
  const role = normalizeRole(profile?.role);
  const location = useLocation();

  if (!token || (role && role !== "driver" && role !== "admin")) {
    return (
      <Navigate
        to={`/mobile-driver/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};

// Router guard to protect Admin Web Portal endpoints (Strictly isolated to "admin" scope)
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const token = getScopedToken("admin");
  const profile = getScopedProfile("admin");
  const role = normalizeRole(profile?.role);

  if (!token && role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Admin redirect component - redirects to dashboard if logged in, otherwise to login
const AdminRedirect = () => {
  const token = getScopedToken("admin");
  const profile = getScopedProfile("admin");
  const role = normalizeRole(profile?.role);

  if (token || role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/admin/login" replace />;
};

// Inner app wrapper to consume navigation and router states
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    isOnline: isDriverOnline,
    handleToggleOnline: handleToggleDriverOnline,
    incomingAlertTask: globalIncomingTask,
  } = useMobileDriverRadar();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isStoreOwnerPage = location.pathname.startsWith("/store-owner");
  const isMobileCustomerPage = location.pathname.startsWith("/mobile-customer");
  const isMobileDriverPage = location.pathname.startsWith("/mobile-driver");
  const isDriverRadarPage = location.pathname === "/mobile-driver/radar";
  const hasGlobalDriverPopup = Boolean(
    isMobileDriverPage &&
      location.pathname !== "/mobile-driver/login" &&
      isDriverOnline &&
      globalIncomingTask,
  );

  useEffect(() => {
    if (isDriverRadarPage || hasGlobalDriverPopup) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isDriverRadarPage, hasGlobalDriverPopup]);

  // Isolated per-portal session states so Customer App, Driver App, Store Owner Web, and Admin Web never leak into each other
  const [isAdminLogged, setIsAdminLogged] = useState(
    () => !!getScopedToken("admin"),
  );
  const [customerLogged, setCustomerLogged] = useState(
    () => !!getScopedToken("customer"),
  );
  const [customerProfile, setCustomerProfile] = useState<any>(() =>
    getScopedProfile("customer"),
  );
  const [driverLogged, setDriverLogged] = useState(
    () => !!getScopedToken("driver"),
  );
  const [driverProfile, setDriverProfile] = useState<any>(() =>
    getScopedProfile("driver"),
  );
  const [storeOwnerProfile, setStoreOwnerProfile] = useState<any>(() =>
    getScopedProfile("store_owner"),
  );

  // 3.5s Splash Screen state when launching Mobile Customer App or Mobile Driver App
  const [customerSplashDone, setCustomerSplashDone] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("sachse_splash_done_customer") === "1";
    } catch {
      return false;
    }
  });
  const [driverSplashDone, setDriverSplashDone] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("sachse_splash_done_driver") === "1";
    } catch {
      return false;
    }
  });

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const buildTarget = (import.meta as any).env?.VITE_APP_TARGET as
    | "customer"
    | "driver"
    | undefined;

  const [standaloneApp] = useState<"customer" | "driver" | null>(() => {
    if (buildTarget === "customer" || buildTarget === "driver") {
      return buildTarget;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qStandalone = params.get("standalone") || params.get("app");
      if (qStandalone === "customer" || qStandalone === "driver") {
        sessionStorage.setItem("sachse_standalone_app", qStandalone);
        return qStandalone;
      }
      if (qStandalone === "none") {
        sessionStorage.removeItem("sachse_standalone_app");
        return null;
      }
      const saved = sessionStorage.getItem("sachse_standalone_app");
      if (saved === "customer" || saved === "driver") {
        return saved;
      }
    }
    return null;
  });

  const syncAllScopedSessions = () => {
    setIsAdminLogged(!!getScopedToken("admin"));
    setCustomerLogged(!!getScopedToken("customer"));
    setCustomerProfile(getScopedProfile("customer"));
    setDriverLogged(!!getScopedToken("driver"));
    setDriverProfile(getScopedProfile("driver"));
    setStoreOwnerProfile(getScopedProfile("store_owner"));
  };

  useEffect(() => {
    // Purge any legacy mock caches or shared keys from browser storage
    localStorage.removeItem("sachse_laundry_orders");
    localStorage.removeItem("sachse_stores_data");
    localStorage.removeItem("sachse_store_drivers");
    localStorage.removeItem("sachse_user_token");
    localStorage.removeItem("sachse_user_profile");
    syncAllScopedSessions();
    const handleStorage = () => syncAllScopedSessions();
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (
      standaloneApp === "customer" &&
      !location.pathname.startsWith("/mobile-customer")
    ) {
      navigate(
        getScopedToken("customer")
          ? "/mobile-customer/home"
          : "/mobile-customer/login",
        { replace: true },
      );
      return;
    }
    if (
      standaloneApp === "driver" &&
      !location.pathname.startsWith("/mobile-driver")
    ) {
      navigate(
        getScopedToken("driver")
          ? "/mobile-driver/radar"
          : "/mobile-driver/login",
        { replace: true },
      );
      return;
    }
  }, [standaloneApp, location.pathname, navigate]);

  useEffect(() => {
    const manifestLink = document.querySelector(
      'link[rel="manifest"]',
    ) as HTMLLinkElement | null;
    const themeMeta = document.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement | null;
    const appleTitleMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]',
    ) as HTMLMetaElement | null;

    if (standaloneApp === "customer" || isMobileCustomerPage) {
      document.title = "Sạch Sẽ - Đặt Giặt Sấy (App Khách Hàng)";
      if (manifestLink) manifestLink.href = "/manifest-customer.json";
      if (themeMeta) themeMeta.content = "#2563eb";
      if (appleTitleMeta) appleTitleMeta.content = "Sạch Sẽ";
    } else if (standaloneApp === "driver" || isMobileDriverPage) {
      document.title = "Sạch Sẽ Tài Xế - Đối Tác Giao Nhận";
      if (manifestLink) manifestLink.href = "/manifest-driver.json";
      if (themeMeta) themeMeta.content = "#059669";
      if (appleTitleMeta) appleTitleMeta.content = "Sạch Sẽ Tài Xế";
    } else {
      document.title = "Giặt Là Sạch Sẽ - Hệ Thống Giặt Sấy Hà Nội";
      if (manifestLink) manifestLink.href = "/manifest.json";
      if (themeMeta) themeMeta.content = "#2563eb";
      if (appleTitleMeta) appleTitleMeta.content = "Sạch Sẽ";
    }
  }, [standaloneApp, isMobileCustomerPage, isMobileDriverPage]);

  const handleAdminLogout = () => {
    clearScopedSession("admin");
    syncAllScopedSessions();
    showToast("Đã đăng xuất khỏi Cổng Quản Trị Platform!", "info");
    navigate("/admin/login", { replace: true });
  };

  const handleStoreOwnerLogout = () => {
    clearScopedSession("store_owner");
    syncAllScopedSessions();
    showToast("Đã đăng xuất khỏi Cổng Web Chủ Cửa Hàng!", "info");
    navigate("/store-owner/login", { replace: true });
  };

  const handleCustomerAppLogout = () => {
    clearScopedSession("customer");
    syncAllScopedSessions();
    showToast("Đã đăng xuất khỏi App Khách Hàng!", "info");
    navigate("/mobile-customer/login", { replace: true });
  };

  const handleDriverAppLogout = () => {
    clearScopedSession("driver");
    syncAllScopedSessions();
    showToast("Đã đăng xuất khỏi App Tài Xế!", "info");
    navigate("/mobile-driver/login", { replace: true });
  };

  // Show 3.5-second App Logo Splash Screen when opening Customer App
  if (isMobileCustomerPage && !customerSplashDone) {
    const hasCustomerToken = !!getScopedToken("customer");
    return (
      <MobileAppSplash
        appType="customer"
        durationMs={3500}
        isLoggedIn={hasCustomerToken}
        onFinish={() => {
          try {
            sessionStorage.setItem("sachse_splash_done_customer", "1");
          } catch {
            // ignore
          }
          setCustomerSplashDone(true);
          if (hasCustomerToken) {
            if (location.pathname === "/mobile-customer/login") {
              navigate("/mobile-customer/home", { replace: true });
            }
          } else if (location.pathname !== "/mobile-customer/login") {
            navigate("/mobile-customer/login", { replace: true });
          }
        }}
      />
    );
  }

  // Show 3.5-second App Logo Splash Screen when opening Driver App
  if (isMobileDriverPage && !driverSplashDone) {
    const hasDriverToken = !!getScopedToken("driver");
    return (
      <MobileAppSplash
        appType="driver"
        durationMs={3500}
        isLoggedIn={hasDriverToken}
        onFinish={() => {
          try {
            sessionStorage.setItem("sachse_splash_done_driver", "1");
          } catch {
            // ignore
          }
          setDriverSplashDone(true);
          if (hasDriverToken) {
            if (location.pathname === "/mobile-driver/login") {
              navigate("/mobile-driver/radar", { replace: true });
            }
          } else if (location.pathname !== "/mobile-driver/login") {
            navigate("/mobile-driver/login", { replace: true });
          }
        }}
      />
    );
  }

  return (
    <div
      className={
        isDriverRadarPage
          ? "fixed inset-0 h-dvh max-h-dvh w-full max-w-full overflow-hidden overscroll-none bg-slate-100 flex flex-col font-sans antialiased text-slate-800"
          : "min-h-screen w-full max-w-full overflow-x-hidden relative bg-slate-50/50 flex flex-col font-sans antialiased text-slate-800"
      }
    >
      {/* Constrained backdrop bubbles so they never overflow mobile viewports horizontally */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-150/40 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-150/30 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main app wrap block */}
      <div
        className={`${
          isDriverRadarPage
            ? "max-w-md h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] p-2 overflow-hidden overscroll-none"
            : isMobileCustomerPage || isMobileDriverPage
              ? "max-w-md pb-24 pt-3 px-3"
              : "max-w-7xl px-4 md:px-6 py-6"
        } w-full max-w-full overflow-x-hidden mx-auto flex-1 flex flex-col gap-4 relative z-10`}
      >
        {/* Mobile Customer App Compact Brand Logo Header (`vn.sachse.customer`) — Hidden on Login screen */}
        {isMobileCustomerPage &&
          location.pathname !== "/mobile-customer/login" && (
            <header className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-2 w-full max-w-full overflow-x-hidden">
              <NavLink
                to="/mobile-customer/home"
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-tight text-slate-900">
                      Giặt Là <span className="text-blue-600">Sạch Sẽ</span>
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60">
                      Hà Nội
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    Đặt giặt sấy giao nhận tận nơi
                  </p>
                </div>
              </NavLink>

              <button
                type="button"
                onClick={() => navigate("/mobile-customer/profile")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
              >
                <CircleUser className="w-4 h-4 text-blue-600" />
                <span className="max-w-[90px] truncate">
                  {customerProfile?.fullName ||
                    customerProfile?.username ||
                    "Tài khoản"}
                </span>
              </button>
            </header>
          )}

        {/* Mobile Driver App Compact Logo Header — Hidden on Login and Radar */}
        {isMobileDriverPage &&
          location.pathname !== "/mobile-driver/login" &&
          location.pathname !== "/mobile-driver/radar" && (
            <header className="bg-white rounded-2xl px-4 py-3 border border-slate-200 flex items-center justify-between gap-3 w-full max-w-full overflow-x-hidden">
              <NavLink
                to="/mobile-driver/radar"
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                    Sạch Sẽ Tài Xế
                  </span>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Đối tác giao nhận · Hà Nội
                  </p>
                </div>
              </NavLink>

              <button
                type="button"
                onClick={handleToggleDriverOnline}
                className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                  isDriverOnline
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {isDriverOnline ? "Đang nhận chuyến" : "Mở nhận chuyến"}
                </span>
              </button>
            </header>
          )}

        {/* Store Owner Web Portal Header & Navigation */}
        {isStoreOwnerPage && location.pathname !== "/store-owner/login" && (
          <header className="bg-white rounded-2xl border border-slate-200 px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4">
              <NavLink
                to="/store-owner/dashboard"
                className="flex items-center gap-2.5 shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Giặt Là Sạch Sẽ{" "}
                  <span className="font-normal text-slate-400">·</span>{" "}
                  <span className="text-sm font-medium text-slate-600">
                    Quản Lý Tiệm
                  </span>
                </span>
              </NavLink>
            </div>

            <nav className="flex items-center gap-1 overflow-x-auto py-1 lg:py-0">
              <NavLink
                to="/store-owner/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Tổng quan
              </NavLink>

              <NavLink
                to="/store-owner/orders"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Đơn giặt & Cân đồ
              </NavLink>

              <NavLink
                to="/store-owner/equipment"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Máy giặt & Thiết bị
              </NavLink>

              <NavLink
                to="/store-owner/deliveries"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Điều phối tài xế
              </NavLink>

              <NavLink
                to="/store-owner/settings"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Cấu hình tiệm
              </NavLink>
            </nav>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <CircleUser className="w-4 h-4 text-slate-500" />
                <span>
                  {storeOwnerProfile?.fullName ||
                    storeOwnerProfile?.username ||
                    "Chủ tiệm"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleStoreOwnerLogout}
                className="px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer transition-colors text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </header>
        )}

        {/* Admin Header - Only show on admin pages when logged in */}
        {isAdminPage && isAdminLogged && location.pathname !== "/admin/login" && (
          <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-widest">
                  Bảng Điều Khiển Admin · TP. Hà Nội
                </span>
                <h1 className="block text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Hệ Thống Quản Trị Platform
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-xs font-bold text-slate-700">
                  Quản trị viên Platform
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  Toàn quyền hệ thống
                </p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl font-bold cursor-pointer transition-colors text-xs flex items-center gap-1.5"
              >
                <CircleUser className="w-4 h-4" />
                Hồ Sơ Admin
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold cursor-pointer transition-colors text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng Xuất
              </button>
            </div>
          </header>
        )}

        {/* Public Web Information & App Download Portal Header */}
        {!isAdminPage &&
          !isStoreOwnerPage &&
          !isMobileCustomerPage &&
          !isMobileDriverPage && (
            <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <NavLink
                  to="/"
                  className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
                >
                  <Droplets className="w-6 h-6 text-blue-400" />
                </NavLink>
                <div>
                  <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-widest">
                    Cổng Thông Tin & Tải App · TP. Hà Nội
                  </span>
                  <NavLink
                    to="/"
                    className="block text-xl md:text-2xl font-black text-slate-900 tracking-tight hover:text-blue-600 transition-colors"
                  >
                    Giặt Là <span className="text-blue-600">Sạch Sẽ</span>
                  </NavLink>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs flex-wrap justify-center">
                <button
                  onClick={() => setIsInstallModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Tải 2 App Mobile (QR)
                </button>

                <NavLink
                  to="/mobile-customer/home"
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0"
                >
                  <Smartphone className="w-4 h-4" />
                  App Khách Hàng
                </NavLink>

                <NavLink
                  to="/mobile-driver/radar"
                  className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0"
                >
                  <Bike className="w-4 h-4" />
                  App Tài Xế
                </NavLink>

                <NavLink
                  to="/store-owner/login"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0"
                >
                  <Store className="w-4 h-4 text-blue-400" />
                  Web Chủ Tiệm Giặt
                </NavLink>

                <NavLink
                  to="/admin/login"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Web Quản Trị Admin
                </NavLink>
              </div>
            </header>
          )}

        {/* Public Web Information Navigation Tabs (No Web Customer Login/Ordering) */}
        {!isAdminPage &&
          !isStoreOwnerPage &&
          !isMobileCustomerPage &&
          !isMobileDriverPage && (
            <nav className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-1.5">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                1. Cổng Giới Thiệu & Tải App
              </NavLink>

              <NavLink
                to="/stores-map"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                2. Bản Đồ Chi Nhánh Hà Nội
              </NavLink>

              <NavLink
                to="/price-info"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                3. Bảng Giá & Quy Trình
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                4. Liên Hệ & Đăng Ký Đối Tác
              </NavLink>
            </nav>
          )}

        {/* Dynamic Outlet View Container of React Router */}
        <main
          className={`flex-1 w-full max-w-full ${
            isDriverRadarPage
              ? "h-full overflow-hidden overscroll-none flex flex-col"
              : "overflow-x-hidden"
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />

            {/* System Analysis & Design (Use Case Diagrams for 4 Actors) */}
            <Route path="/system-design" element={<SystemDesignPage />} />

            {/* Store Owner Web Portal Routes (Protected by StoreOwnerRoute) */}
            <Route path="/store-owner/login" element={<StoreOwnerLogin />} />
            <Route
              path="/store-owner"
              element={
                <StoreOwnerRoute>
                  <Navigate to="/store-owner/dashboard" replace />
                </StoreOwnerRoute>
              }
            />
            <Route
              path="/store-owner/dashboard"
              element={
                <StoreOwnerRoute>
                  <StoreOwnerDashboard />
                </StoreOwnerRoute>
              }
            />
            <Route
              path="/store-owner/orders"
              element={
                <StoreOwnerRoute>
                  <StoreOwnerOrders />
                </StoreOwnerRoute>
              }
            />
            <Route
              path="/store-owner/equipment"
              element={
                <StoreOwnerRoute>
                  <StoreOwnerEquipment />
                </StoreOwnerRoute>
              }
            />
            <Route
              path="/store-owner/deliveries"
              element={
                <StoreOwnerRoute>
                  <StoreOwnerDeliveries />
                </StoreOwnerRoute>
              }
            />
            <Route
              path="/store-owner/settings"
              element={
                <StoreOwnerRoute>
                  <StoreOwnerSettings />
                </StoreOwnerRoute>
              }
            />
            <Route
              path="/store-owner/mobile-plan"
              element={
                <StoreOwnerRoute>
                  <StoreOwnerMobilePlan />
                </StoreOwnerRoute>
              }
            />

            {/* Mobile Customer App Routes (`src/pages/MobileCustomer/`) */}
            <Route
              path="/mobile-customer/login"
              element={<MobileCustomerAuth />}
            />
            <Route
              path="/mobile-customer"
              element={
                <CustomerRoute>
                  <Navigate to="/mobile-customer/home" replace />
                </CustomerRoute>
              }
            />
            <Route
              path="/mobile-customer/home"
              element={
                <CustomerRoute>
                  <MobileCustomerHome />
                </CustomerRoute>
              }
            />
            <Route
              path="/mobile-customer/create-order"
              element={
                <CustomerRoute>
                  <MobileCustomerCreateOrder />
                </CustomerRoute>
              }
            />
            <Route
              path="/mobile-customer/weight-confirm"
              element={
                <CustomerRoute>
                  <MobileCustomerWeightConfirm />
                </CustomerRoute>
              }
            />
            <Route
              path="/mobile-customer/tracking"
              element={
                <CustomerRoute>
                  <MobileCustomerTracking />
                </CustomerRoute>
              }
            />
            <Route
              path="/mobile-customer/profile"
              element={
                <CustomerRoute>
                  <MobileCustomerProfile />
                </CustomerRoute>
              }
            />

            {/* Mobile Driver / Shipper App Routes (`src/pages/MobileDriver/`) */}
            <Route
              path="/mobile-driver/login"
              element={<MobileDriverAuth />}
            />
            <Route
              path="/mobile-driver"
              element={
                <DriverRoute>
                  <Navigate to="/mobile-driver/radar" replace />
                </DriverRoute>
              }
            />
            <Route
              path="/mobile-driver/radar"
              element={
                <DriverRoute>
                  <MobileDriverRadar />
                </DriverRoute>
              }
            />
            <Route
              path="/mobile-driver/active-task"
              element={
                <DriverRoute>
                  <MobileDriverActiveTask />
                </DriverRoute>
              }
            />
            <Route
              path="/mobile-driver/wallet"
              element={
                <DriverRoute>
                  <MobileDriverWallet />
                </DriverRoute>
              }
            />
            <Route
              path="/mobile-driver/profile"
              element={
                <DriverRoute>
                  <MobileDriverProfile />
                </DriverRoute>
              }
            />

            {/* Legacy web customer routes redirect into Mobile Customer App */}
            <Route
              path="/booking"
              element={<Navigate to="/mobile-customer/create-order" replace />}
            />
            <Route
              path="/tracking"
              element={<Navigate to="/mobile-customer/tracking" replace />}
            />
            <Route
              path="/auth"
              element={<Navigate to="/mobile-customer/login" replace />}
            />

            <Route path="/price-info" element={<PriceInfo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route path="/stores-map" element={<StoresMapPage />} />

            <Route
              path="/admin/services"
              element={
                <AdminRoute>
                  <AdminServices />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <AdminRoute>
                  <AdminStoresPage />
                </AdminRoute>
              }
            />

            {/* Catch-all - redirect to home for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Quick bottom cards for additional values on user dashboard context */}
        {!isAdminPage && !isAdminLogged && location.pathname === "/" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 border-t border-slate-150 pt-8 border-slate-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-3 text-xs md:text-sm text-slate-700">
              <ShieldCheck className="w-6 h-6 text-blue-650 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Điện Nước Khép Kín
                </h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Bộ lồng lọc Nano gia tăng khí nóng vô trùng, khử nấm mốc cực
                  thơm lâu dài trên từng thớ lụa thô sơ dập mộc.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-3 text-xs md:text-sm text-slate-700">
              <CalendarCheck className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Trị Liệu & Phân Loại
                </h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Đội ngũ kỹ thuật luôn phân chia quần áo màu riêng biệt, chọn
                  hóa phẩm mộc mạc an toàn tuyệt đối với làn da mẫn cảm em bé.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-3 text-xs md:text-sm text-slate-700">
              <ExternalLink className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Thanh Toán Linh Hoạt
                </h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Khách hàng chỉ trả tiền mặt hoặc chuyển khoản rảnh tay sau khi
                  chạm tay kiểm đếm quần áo sạch sẽ hoàn toàn tại cổng nhà.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Native Bottom Navigation Bar for Standalone Customer App (`vn.sachse.customer`) */}
      {isMobileCustomerPage &&
        location.pathname !== "/mobile-customer/login" && (
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-full overflow-x-hidden z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
              <NavLink
                to="/mobile-customer/home"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <MapPin className="w-4 h-4 mb-0.5" />
                <span>Tìm Tiệm</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/create-order"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <PlusCircle className="w-4 h-4 mb-0.5" />
                <span>Tạo Đơn</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/weight-confirm"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <Scale className="w-4 h-4 mb-0.5" />
                <span>Duyệt Cân</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/tracking"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <ShoppingBag className="w-4 h-4 mb-0.5" />
                <span>Tiến Độ</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <CircleUser className="w-4 h-4 mb-0.5" />
                <span>Hồ Sơ</span>
              </NavLink>
            </div>
          </div>
        )}

      {/* Native Bottom Navigation Bar for Standalone Driver App (`vn.sachse.driver`) */}
      {isMobileDriverPage &&
        location.pathname !== "/mobile-driver/login" && (
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-full overflow-x-hidden z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
              <NavLink
                to="/mobile-driver/radar"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <Radio className="w-4 h-4 mb-0.5" />
                <span>Sàn Chuyến</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/active-task"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <Truck className="w-4 h-4 mb-0.5" />
                <span>Đang Giao</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/wallet"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <Wallet className="w-4 h-4 mb-0.5" />
                <span>Ví Thu Nhập</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <CircleUser className="w-4 h-4 mb-0.5" />
                <span>Hồ Sơ</span>
              </NavLink>
            </div>
          </div>
        )}

      {/* Professional structured Footer block (Hidden in Standalone Mobile Apps) */}
      {!standaloneApp && !isMobileCustomerPage && !isMobileDriverPage && (
        <footer className="bg-slate-900 text-white mt-12 py-10 border-t border-slate-800 relative z-10 text-xs md:text-sm">
          <div className="max-w-6xl w-full mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-extrabold text-white text-base">
                  Hệ Thống Tiệm Giặt Sạch Sẽ · Hà Nội
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dịch vụ thu gom và phát trả đồ giặt là vô trùng trọn gói tại TP.
                Hà Nội, tích hợp 2 ứng dụng di động riêng cho Khách Hàng và Tài
                Xế cùng 2 cổng Web Quản Trị cho Chủ Tiệm & Admin Platform.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
                Liên hệ văn phòng Hà Nội
              </h4>
              <p>
                • Hotline hỗ trợ 24/7:{" "}
                <span className="text-white font-semibold">1900-5454-99</span>
              </p>
              <p>
                • Thư điện tử:{" "}
                <span className="text-white">chamsockhachhang@sachse.vn</span>
              </p>
              <p>
                • Địa chỉ: Shophouse SV12, KĐT Vinhomes Ocean Park, Gia Lâm, Hà
                Nội
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
                Quận / Huyện phục vụ tại TP. Hà Nội
              </h4>
              <p>
                • Nội thành: Cầu Giấy, Đống Đa, Ba Đình, Hoàn Kiếm, Tây Hồ, Hai
                Bà Trưng, Thanh Xuân, Hoàng Mai.
              </p>
              <p>
                • Khu đô thị & mở rộng: Nam Từ Liêm, Bắc Từ Liêm, Hà Đông, Long
                Biên, Gia Lâm, Đông Anh, Thanh Trì.
              </p>
            </div>
          </div>

          <div className="max-w-6xl w-full mx-auto px-4 md:px-6 border-t border-slate-800/80 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              © 2026 Giặt Là Sạch Sẽ Việt Nam Co., Ltd. Tất cả quyền lợi bảo lưu.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <NavLink
                to="/mobile-customer/login"
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                App Khách Hàng (Mobile)
              </NavLink>
              <span>•</span>
              <NavLink
                to="/mobile-driver/login"
                className="text-teal-400 hover:text-teal-300 font-bold transition-colors"
              >
                App Tài Xế (Mobile)
              </NavLink>
              <span>•</span>
              <NavLink
                to="/store-owner/login"
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                Cổng Web Chủ Cửa Hàng
              </NavLink>
              <span>•</span>
              <NavLink
                to="/admin/login"
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
              >
                Cổng Quản Trị Platform (Admin)
              </NavLink>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Bar for legacy web portal only */}
      {!standaloneApp && !isMobileCustomerPage && !isMobileDriverPage && (
        <MobileNav />
      )}

      {/* Global Incoming Order Dispatch Popup for Shipper across ALL Driver App pages */}
      <DriverIncomingOrderModal />

      {/* App Install / Electron Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Authenticated Personal Profile Modal for Web Portals */}
      <PersonalProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        roleLabel={
          isAdminPage
            ? "Quản trị viên Platform"
            : isStoreOwnerPage
              ? "Đối tác Chủ Cửa Hàng"
              : "Khách hàng"
        }
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <LoadingProvider>
          <DriverRadarProvider>
            <AppContent />
          </DriverRadarProvider>
        </LoadingProvider>
      </ToastProvider>
    </Router>
  );
}
