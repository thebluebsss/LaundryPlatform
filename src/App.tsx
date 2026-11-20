import { useState, useEffect, useRef, lazy, Suspense } from "react";
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
  ChevronDown,
} from "lucide-react";

import { Home } from "./pages/Home/index";
import {
  DriverRadarProvider,
  useMobileDriverRadar,
} from "./pages/MobileDriver/BroadcastRadar/hook";
import { DriverIncomingOrderModal } from "./components/DriverIncomingOrderModal";
import {
  ChatMessageNotificationBar,
  NotificationBellButton,
} from "./components/ChatMessageNotificationBar";
import { RoleChatbotWidget } from "./components/RoleChatbotWidget";
import { MobileNav } from "./components/MobileNav";
import { InstallAppModal } from "./components/InstallAppModal";
import { PersonalProfileModal } from "./components/PersonalProfileModal";
import { MobileAppSplash } from "./components/MobileAppSplash";
import { ToastProvider, useToast } from "./components/Toast";
import { LoadingProvider } from "./context/LoadingContext";

// Route-level code splitting for faster initial page load
const PriceInfo = lazy(() =>
  import("./pages/PriceInfo/index").then((m) => ({
    default: m.PriceInfo,
  }))
);
const StoresMapPage = lazy(() =>
  import("./pages/StoresMap/index").then((m) => ({
    default: m.StoresMapPage,
  }))
);
const Contact = lazy(() =>
  import("./pages/Contact/index").then((m) => ({
    default: m.Contact,
  }))
);
const SystemDesignPage = lazy(() =>
  import("./pages/SystemDesign/index").then((m) => ({
    default: m.SystemDesignPage,
  }))
);

const AdminLogin = lazy(() =>
  import("./pages/Login/index").then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import("./pages/Admin/Dashboard/index").then((m) => ({
    default: m.AdminDashboard,
  }))
);
const AdminOrders = lazy(() =>
  import("./pages/Admin/Orders/index").then((m) => ({ default: m.AdminOrders }))
);
const AdminUsers = lazy(() =>
  import("./pages/Admin/Users/index").then((m) => ({ default: m.AdminUsers }))
);
const AdminProducts = lazy(() =>
  import("./pages/Admin/Products/index").then((m) => ({
    default: m.AdminProducts,
  }))
);
const AdminServices = lazy(() =>
  import("./pages/Admin/Services/index").then((m) => ({
    default: m.AdminServices,
  }))
);
const AdminStoresPage = lazy(() =>
  import("./pages/Admin/Stores/index").then((m) => ({
    default: m.AdminStoresPage,
  }))
);

const StoreOwnerLogin = lazy(() =>
  import("./pages/StoreOwner/Login/index").then((m) => ({
    default: m.StoreOwnerLogin,
  }))
);
const StoreOwnerDashboard = lazy(() =>
  import("./pages/StoreOwner/Dashboard/index").then((m) => ({
    default: m.StoreOwnerDashboard,
  }))
);
const StoreOwnerOrders = lazy(() =>
  import("./pages/StoreOwner/Orders/index").then((m) => ({
    default: m.StoreOwnerOrders,
  }))
);
const StoreOwnerEquipment = lazy(() =>
  import("./pages/StoreOwner/Equipment/index").then((m) => ({
    default: m.StoreOwnerEquipment,
  }))
);
const StoreOwnerDeliveries = lazy(() =>
  import("./pages/StoreOwner/Deliveries/index").then((m) => ({
    default: m.StoreOwnerDeliveries,
  }))
);
const StoreOwnerSettings = lazy(() =>
  import("./pages/StoreOwner/Settings/index").then((m) => ({
    default: m.StoreOwnerSettings,
  }))
);
const StoreOwnerMobilePlan = lazy(() =>
  import("./pages/StoreOwner/MobilePlan/index").then((m) => ({
    default: m.StoreOwnerMobilePlan,
  }))
);

const MobileCustomerHome = lazy(() =>
  import("./pages/MobileCustomer/HomeMap/index").then((m) => ({
    default: m.MobileCustomerHome,
  }))
);
const MobileCustomerCreateOrder = lazy(() =>
  import("./pages/MobileCustomer/CreateOrder/index").then((m) => ({
    default: m.MobileCustomerCreateOrder,
  }))
);
const MobileCustomerWeightConfirm = lazy(() =>
  import("./pages/MobileCustomer/WeightConfirm/index").then((m) => ({
    default: m.MobileCustomerWeightConfirm,
  }))
);
const MobileCustomerTracking = lazy(() =>
  import("./pages/MobileCustomer/OrderTracking/index").then((m) => ({
    default: m.MobileCustomerTracking,
  }))
);
const MobileCustomerAuth = lazy(() =>
  import("./pages/MobileCustomer/Auth/index").then((m) => ({
    default: m.MobileCustomerAuth,
  }))
);
const MobileCustomerProfile = lazy(() =>
  import("./pages/MobileCustomer/Profile/index").then((m) => ({
    default: m.MobileCustomerProfile,
  }))
);

const MobileDriverRadar = lazy(() =>
  import("./pages/MobileDriver/BroadcastRadar/index").then((m) => ({
    default: m.MobileDriverRadar,
  }))
);
const MobileDriverActiveTask = lazy(() =>
  import("./pages/MobileDriver/ActiveTask/index").then((m) => ({
    default: m.MobileDriverActiveTask,
  }))
);
const MobileDriverWallet = lazy(() =>
  import("./pages/MobileDriver/DriverWallet/index").then((m) => ({
    default: m.MobileDriverWallet,
  }))
);
const MobileDriverAuth = lazy(() =>
  import("./pages/MobileDriver/Auth/index").then((m) => ({
    default: m.MobileDriverAuth,
  }))
);
const MobileDriverProfile = lazy(() =>
  import("./pages/MobileDriver/Profile/index").then((m) => ({
    default: m.MobileDriverProfile,
  }))
);
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
        "Vui lòng đăng nhập tài khoản chủ cửa hàng để tiếp tục.",
        "warning",
      );
    } else if (role && role !== "store_owner" && role !== "admin" && !adminToken) {
      showToast("Tài khoản hiện tại không có quyền chủ cửa hàng.", "error");
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

  if (!token || role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Admin redirect component - redirects to dashboard if logged in, otherwise to login
const AdminRedirect = () => {
  const token = getScopedToken("admin");
  const profile = getScopedProfile("admin");
  const role = normalizeRole(profile?.role);

  if (token && role === "admin") {
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

  // Splash Screen state when launching Mobile Customer App or Mobile Driver App
  const [customerSplashDone, setCustomerSplashDone] = useState<boolean>(false);
  const [driverSplashDone, setDriverSplashDone] = useState<boolean>(false);

  // Reset splash state when leaving a mobile app so re-entering either app plays its intro once
  useEffect(() => {
    if (!isMobileCustomerPage && customerSplashDone) {
      setCustomerSplashDone(false);
    }
    if (!isMobileDriverPage && driverSplashDone) {
      setDriverSplashDone(false);
    }
  }, [
    isMobileCustomerPage,
    isMobileDriverPage,
    customerSplashDone,
    driverSplashDone,
  ]);

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const partnerMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsPartnerMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isPartnerMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        partnerMenuRef.current &&
        !partnerMenuRef.current.contains(event.target as Node)
      ) {
        setIsPartnerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPartnerMenuOpen]);

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

  // Show App Logo Splash Screen when opening Customer App
  if (isMobileCustomerPage && !customerSplashDone) {
    const hasCustomerToken = !!getScopedToken("customer");
    return (
      <MobileAppSplash
        appType="customer"
        durationMs={900}
        isLoggedIn={hasCustomerToken}
        onFinish={() => {
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

  // Show App Logo Splash Screen when opening Driver App
  if (isMobileDriverPage && !driverSplashDone) {
    const hasDriverToken = !!getScopedToken("driver");
    return (
      <MobileAppSplash
        appType="driver"
        durationMs={900}
        isLoggedIn={hasDriverToken}
        onFinish={() => {
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

              <div className="flex items-center gap-2 shrink-0">
                <NotificationBellButton role="customer" />
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
              </div>
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

              <div className="flex items-center gap-2 shrink-0">
                <NotificationBellButton role="driver" />
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
              </div>
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
              <NotificationBellButton role="store" />
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
          <header className="bg-white rounded-2xl border border-slate-200 px-5 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4">
              <NavLink
                to="/admin/dashboard"
                className="flex items-center gap-2.5 shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  Giặt Là Sạch Sẽ{" "}
                  <span className="font-normal text-slate-400">·</span>{" "}
                  <span className="text-sm font-medium text-indigo-600">
                    Quản trị
                  </span>
                </span>
              </NavLink>
            </div>

            <nav className="flex items-center gap-1 overflow-x-auto py-1 xl:py-0">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Tổng quan
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Đơn hàng
              </NavLink>
              <NavLink
                to="/admin/stores"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Chi nhánh
              </NavLink>
              <NavLink
                to="/admin/services"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Dịch vụ
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Sản phẩm
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Tài khoản
              </NavLink>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <CircleUser className="w-4 h-4 text-slate-500" />
                <span>Hồ sơ</span>
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer transition-colors text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </header>
        )}

        {/* Public Web Clean Unified Header */}
        {!isAdminPage &&
          !isStoreOwnerPage &&
          !isMobileCustomerPage &&
          !isMobileDriverPage && (
            <header className="relative z-30 bg-white rounded-2xl border border-slate-200/80 px-5 py-3.5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center justify-between gap-3">
                <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                    <Droplets className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="block text-base font-bold text-slate-900 tracking-tight leading-tight">
                      Giặt Là <span className="text-blue-600">Sạch Sẽ</span>
                    </span>
                    <span className="block text-[11px] text-slate-500 font-medium">
                      Giặt sấy giao nhận · Hà Nội
                    </span>
                  </div>
                </NavLink>

                {customerLogged && (
                  <div className="flex items-center gap-2 lg:hidden">
                    <NotificationBellButton role="customer" />
                  </div>
                )}
              </div>

              <nav className="flex items-center gap-1 overflow-x-auto py-0.5 lg:py-0">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Trang chủ
                </NavLink>
                <NavLink
                  to="/stores-map"
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Chi nhánh
                </NavLink>
                <NavLink
                  to="/price-info"
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Bảng giá
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Liên hệ
                </NavLink>
              </nav>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Partner & Portal Dropdown */}
                <div className="relative" ref={partnerMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsPartnerMenuOpen((v) => !v)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1 cursor-pointer transition-colors text-xs whitespace-nowrap"
                  >
                    <span>Đối tác</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        isPartnerMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isPartnerMenuOpen && (
                    <div className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 space-y-0.5">
                      <NavLink
                        to="/mobile-driver/radar"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ứng dụng tài xế</span>
                      </NavLink>
                      <NavLink
                        to="/store-owner/login"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Store className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Cổng chủ tiệm giặt</span>
                      </NavLink>
                      <div className="my-1 border-t border-slate-100" />
                      <NavLink
                        to="/admin/login"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Quản trị hệ thống</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(true)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tải ứng dụng</span>
                </button>

                <NavLink
                  to="/mobile-customer/home"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shadow-2xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Đặt giặt ngay</span>
                </NavLink>

                {customerLogged && (
                  <div className="hidden lg:block">
                    <NotificationBellButton role="customer" />
                  </div>
                )}
              </div>
            </header>
          )}

        {/* Dynamic Outlet View Container of React Router */}
        <main
          className={`flex-1 w-full max-w-full ${
            isDriverRadarPage
              ? "h-full overflow-hidden overscroll-none flex flex-col"
              : "overflow-x-hidden"
          }`}
        >
        <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                <div className="w-8 h-8 rounded-full border-3 border-blue-600/20 border-t-blue-600 animate-spin" />
                <span className="text-xs font-bold tracking-wide">
                  Đang tải giao diện...
                </span>
              </div>
            }
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
        </Suspense>
        </main>

        {/* Quick bottom cards for additional values on public home */}
        {!isAdminPage && !isAdminLogged && location.pathname === "/" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-4 border-t border-slate-200 pt-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3.5 text-xs md:text-sm text-slate-700">
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Giặt riêng từng mẻ
                </h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  Mỗi đơn hàng được giặt và sấy riêng trên một lồng máy, không
                  giặt chung, đảm bảo vệ sinh và tránh thất lạc đồ.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3.5 text-xs md:text-sm text-slate-700">
              <CalendarCheck className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Phân loại theo chất liệu
                </h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  Tách riêng đồ trắng, đồ màu, đồ em bé và vải nhạy cảm; chọn
                  nước giặt dịu nhẹ phù hợp từng chất liệu.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3.5 text-xs md:text-sm text-slate-700">
              <ExternalLink className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Cân trước – trả sau linh hoạt
                </h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  Kiểm tra và duyệt khối lượng thực tế ngay trên điện thoại trước
                  khi giặt. Thanh toán tiền mặt hoặc VietQR khi nhận đồ.
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
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <MapPin className="w-4 h-4 mb-0.5" />
                <span>Tìm tiệm</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/create-order"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <PlusCircle className="w-4 h-4 mb-0.5" />
                <span>Tạo đơn</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/weight-confirm"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <Scale className="w-4 h-4 mb-0.5" />
                <span>Duyệt cân</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/tracking"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <ShoppingBag className="w-4 h-4 mb-0.5" />
                <span>Tiến độ</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                  }`
                }
              >
                <CircleUser className="w-4 h-4 mb-0.5" />
                <span>Hồ sơ</span>
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
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <Radio className="w-4 h-4 mb-0.5" />
                <span>Nhận chuyến</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/active-task"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <Truck className="w-4 h-4 mb-0.5" />
                <span>Đang giao</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/wallet"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <Wallet className="w-4 h-4 mb-0.5" />
                <span>Thu nhập</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-500"
                  }`
                }
              >
                <CircleUser className="w-4 h-4 mb-0.5" />
                <span>Hồ sơ</span>
              </NavLink>
            </div>
          </div>
        )}

      {/* Structured Footer block (Hidden in Standalone Mobile Apps) */}
      {!standaloneApp && !isMobileCustomerPage && !isMobileDriverPage && (
        <footer className="bg-slate-900 text-white mt-12 py-10 border-t border-slate-800 relative z-10 text-xs md:text-sm">
          <div className="max-w-6xl w-full mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Droplets className="w-4 h-4 text-blue-200" />
                </div>
                <h3 className="font-bold text-white text-base">
                  Giặt Là Sạch Sẽ · Hà Nội
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dịch vụ giặt sấy giao nhận tận nhà tại Hà Nội. Cân đo minh bạch
                trước khi giặt, mỗi đơn một lồng máy riêng và giao trả đúng hẹn
                mỗi ngày.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-400">
              <h4 className="font-semibold text-white text-xs">
                Liên hệ hỗ trợ
              </h4>
              <p>
                • Tổng đài (07:00 – 22:00):{" "}
                <span className="text-white font-semibold tabular-nums">
                  1900-5454-99
                </span>
              </p>
              <p>
                • Email:{" "}
                <span className="text-white">chamsockhachhang@sachse.vn</span>
              </p>
              <p>
                • Văn phòng: Shophouse SV12, KĐT Vinhomes Ocean Park, Gia Lâm,
                Hà Nội
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-400">
              <h4 className="font-semibold text-white text-xs">
                Khu vực phục vụ tại Hà Nội
              </h4>
              <p>
                • Nội thành: Cầu Giấy, Đống Đa, Ba Đình, Hoàn Kiếm, Tây Hồ, Hai
                Bà Trưng, Thanh Xuân, Hoàng Mai.
              </p>
              <p>
                • Khu đô thị & lân cận: Nam Từ Liêm, Bắc Từ Liêm, Hà Đông, Long
                Biên, Gia Lâm, Đông Anh, Thanh Trì.
              </p>
            </div>
          </div>

          <div className="max-w-6xl w-full mx-auto px-4 md:px-6 border-t border-slate-800/80 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Giặt Là Sạch Sẽ. Bảo lưu mọi quyền.</p>
            <div className="flex flex-wrap items-center gap-4">
              <NavLink
                to="/mobile-customer/login"
                className="text-slate-300 hover:text-white font-medium transition-colors"
              >
                Ứng dụng khách hàng
              </NavLink>
              <span>·</span>
              <NavLink
                to="/mobile-driver/login"
                className="text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                Ứng dụng tài xế
              </NavLink>
              <span>·</span>
              <NavLink
                to="/store-owner/login"
                className="text-slate-300 hover:text-blue-400 font-medium transition-colors"
              >
                Cổng chủ tiệm
              </NavLink>
              <span>·</span>
              <NavLink
                to="/admin/login"
                className="text-slate-400 hover:text-indigo-400 font-medium transition-colors"
              >
                Quản trị hệ thống
              </NavLink>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Bar for public web */}
      {!standaloneApp && !isMobileCustomerPage && !isMobileDriverPage && (
        <MobileNav />
      )}

      {/* Global Incoming Order Dispatch Popup for Shipper across ALL Driver App pages */}
      <DriverIncomingOrderModal />

      {/* Global Incoming Chat Message Notification Bar for Customer, Shipper, and Store Owner */}
      <ChatMessageNotificationBar />

      {/* Global Floating Q&A Chatbot Widget for Customer and Shipper */}
      <RoleChatbotWidget />

      {/* App Install Modal */}
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
            ? "Quản trị viên"
            : isStoreOwnerPage
              ? "Chủ cửa hàng"
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
