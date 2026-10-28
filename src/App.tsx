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
  TrendingUp,
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
} from "lucide-react";

import {
  Home,
  Booking,
  Tracking,
  PriceInfo,
  UserAuth,
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
import {
  MobileCustomerHome,
  MobileCustomerCreateOrder,
  MobileCustomerWeightConfirm,
  MobileCustomerTracking,
} from "./pages/MobileCustomer/index";
import {
  MobileDriverRadar,
  MobileDriverActiveTask,
  MobileDriverWallet,
} from "./pages/MobileDriver/index";
import { MobileNav } from "./components/MobileNav";
import { InstallAppModal } from "./components/InstallAppModal";
import { SystemDesignPage } from "./pages/SystemDesign/index";
import { ToastProvider, useToast } from "./components/Toast";
import { LoadingProvider } from "./context/LoadingContext";
import { bookingsAPI } from "./services/api";

// Router guard to protect customer endpoints
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("sachse_user_token");
  const adminToken = localStorage.getItem("sachse_admin_token");
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (adminToken) {
      return;
    }
    if (!token) {
      showToast(
        "Vui lòng đăng nhập tài khoản khách hàng để thực hiện tác vụ này!",
        "warning",
      );
    }
  }, [token, adminToken, showToast]);

  if (adminToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!token) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};

// Router guard to protect admin endpoints
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem("sachse_admin_token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Admin redirect component - redirects to dashboard if logged in, otherwise to login
const AdminRedirect = () => {
  const token = localStorage.getItem("sachse_admin_token");

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/admin/login" replace />;
};

// Inner app wrapper to consume navigation and router states
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isStoreOwnerPage = location.pathname.startsWith("/store-owner");
  const isMobileCustomerPage = location.pathname.startsWith("/mobile-customer");
  const isMobileDriverPage = location.pathname.startsWith("/mobile-driver");
  const [isAdminLogged, setIsAdminLogged] = useState(() => !!localStorage.getItem("sachse_admin_token"));
  const [userLogged, setUserLogged] = useState(() => !!localStorage.getItem("sachse_user_token"));
  const [userProfile, setUserProfile] = useState<any>(() => {
    const cached = localStorage.getItem("sachse_user_profile");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Detect Standalone Native App Target ("customer" | "driver" | null)
  // Triggered either at build time (VITE_APP_TARGET=customer|driver for App Store / CH Play)
  // or via URL query (?standalone=customer|driver or ?app=customer|driver)
  const buildTarget = (import.meta as any).env?.VITE_APP_TARGET as
    | "customer"
    | "driver"
    | undefined;

  const [standaloneApp, setStandaloneApp] = useState<"customer" | "driver" | null>(() => {
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

  const enterStandaloneMode = (mode: "customer" | "driver") => {
    sessionStorage.setItem("sachse_standalone_app", mode);
    setStandaloneApp(mode);
    if (mode === "customer") {
      navigate("/mobile-customer/home", { replace: true });
    } else {
      navigate("/mobile-driver/radar", { replace: true });
    }
  };

  const exitStandaloneMode = () => {
    if (buildTarget) return; // Locked in compiled APK/IPA build
    sessionStorage.removeItem("sachse_standalone_app");
    setStandaloneApp(null);
  };

  // Read orders list metadata to populate summary bubble
  const checkMetadata = async () => {
    // Read admin status
    const token = localStorage.getItem("sachse_admin_token");
    setIsAdminLogged(!!token); // Any token means logged in

    // Read user status
    const userToken = localStorage.getItem("sachse_user_token");
    const userCached = localStorage.getItem("sachse_user_profile");
    if (userToken && userCached) {
      setUserLogged(true);
      try {
        setUserProfile(JSON.parse(userCached));
      } catch (e) {
        setUserProfile(null);
      }
    } else {
      setUserLogged(false);
      setUserProfile(null);
    }

    // Fetch active orders count from backend if user is logged in
    if (userToken) {
      try {
        const response = await bookingsAPI.getMyBookings({ limit: 1000 });
        const bookings = response.data.data?.bookings || [];
        const active = bookings.filter(
          (b: any) => b.status !== "completed" && b.status !== "cancelled",
        ).length;
        setActiveOrdersCount(active);
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("sachse_user_token");
          localStorage.removeItem("sachse_user_profile");
          setUserLogged(false);
          setUserProfile(null);
        }
        console.warn("User session expired or failed to fetch bookings:", error.message || error);
        setActiveOrdersCount(0);
      }
    } else {
      setActiveOrdersCount(0);
    }
  };

  useEffect(() => {
    checkMetadata();
    // Watch store
    window.addEventListener("storage", () => checkMetadata());
    return () => {
      window.removeEventListener("storage", () => checkMetadata());
    };
  }, [location.pathname]);

  // Support ?standalone=customer|driver and ?app=customer|driver query parameters + route locking for standalone apps
  useEffect(() => {
    if (standaloneApp === "customer" && !location.pathname.startsWith("/mobile-customer")) {
      navigate("/mobile-customer/home", { replace: true });
      return;
    }
    if (standaloneApp === "driver" && !location.pathname.startsWith("/mobile-driver")) {
      navigate("/mobile-driver/radar", { replace: true });
      return;
    }
  }, [standaloneApp, location.pathname, navigate]);

  // Dynamically swap PWA Manifest, Theme Color & App Title for the 2 Separate Apps (Customer vs Driver)
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const appleTitleMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
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
      document.title = "Giặt Là Sạch Sẽ - Dịch Vụ Giặt Sấy Cao Cấp";
      if (manifestLink) manifestLink.href = "/manifest.json";
      if (themeMeta) themeMeta.content = "#2563eb";
      if (appleTitleMeta) appleTitleMeta.content = "Sạch Sẽ";
    }
  }, [standaloneApp, isMobileCustomerPage, isMobileDriverPage]);

  // Router guard to immediately and silently redirect logged-in admins accessing customer-facing pages
  useEffect(() => {
    if (standaloneApp) return;
    const adminToken = localStorage.getItem("sachse_admin_token");
    if (
      adminToken &&
      !location.pathname.startsWith("/admin") &&
      !location.pathname.startsWith("/store-owner") &&
      !location.pathname.startsWith("/mobile-customer") &&
      !location.pathname.startsWith("/mobile-driver") &&
      !location.pathname.startsWith("/system-design")
    ) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate, standaloneApp]);

  const handleLogout = () => {
    localStorage.removeItem("sachse_admin_token");
    setIsAdminLogged(false);
    navigate("/");
  };

  const handleUserLogout = () => {
    localStorage.removeItem("sachse_user_token");
    localStorage.removeItem("sachse_user_profile");
    setUserLogged(false);
    setUserProfile(null);
    showToast("Đăng xuất tài khoản khách hàng thành công!", "info");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-800">
      {/* Absolute backdrop bubbles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-150/40 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-150/30 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Role Workspace Switcher Ribbon on top (Hidden when running as Standalone Customer App or Standalone Driver App) */}
      {!standaloneApp && (
        <div className="bg-slate-900 text-white py-2 px-4 text-xs relative z-50 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="font-bold text-white">Chuyển đổi phân hệ theo vai trò:</span>
              <span className="hidden sm:inline text-slate-400">
                (`CustomerWeb` · `MobileCustomer` · `MobileDriver` · `StoreOwner` · `Admin`)
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <NavLink
                to="/"
                className={() =>
                  `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    !isAdminPage &&
                    !isStoreOwnerPage &&
                    !isMobileCustomerPage &&
                    !isMobileDriverPage
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                Web Khách Hàng
              </NavLink>
              <NavLink
                to="/mobile-customer/home"
                className={() =>
                  `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                    isMobileCustomerPage
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                <Smartphone className="w-3 h-3" />
                App Khách Hàng
              </NavLink>
              <NavLink
                to="/mobile-driver/radar"
                className={() =>
                  `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                    isMobileDriverPage
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                <Bike className="w-3 h-3" />
                App Shipper
              </NavLink>
              <NavLink
                to="/store-owner/dashboard"
                className={() =>
                  `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                    isStoreOwnerPage
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                <Store className="w-3 h-3" />
                Web Chủ Cửa Hàng
              </NavLink>
              <NavLink
                to="/admin/dashboard"
                className={() =>
                  `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    isAdminPage
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                Admin Hệ Thống
              </NavLink>
              <NavLink
                to="/system-design"
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-purple-950/80 border border-purple-700/60 text-purple-200 hover:text-white"
                  }`
                }
              >
                Use Case & Thiết Kế Hệ Thống
              </NavLink>
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                title="Tải 2 App Riêng Biệt (Khách Hàng & Tài Xế) lên Điện Thoại / App Store / CH Play"
              >
                <Smartphone className="w-3 h-3" />
                Tải 2 App Riêng (Store/QR)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main app wrap block */}
      <div
        className={`${
          isMobileCustomerPage || isMobileDriverPage
            ? "max-w-md pb-24 pt-3 px-3"
            : "max-w-7xl px-4 md:px-6 py-6"
        } w-full mx-auto flex-1 flex flex-col gap-4 relative z-10`}
      >
        {/* Mobile Customer App Header & Navigation (`vn.sachse.customer`) */}
        {isMobileCustomerPage && (
          <div className="space-y-2.5">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 border border-white/25">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                      vn.sachse.customer
                    </span>
                    {standaloneApp === "customer" && (
                      <span className="text-[10px] font-bold bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/30">
                        App Độc Lập
                      </span>
                    )}
                  </div>
                  <h1 className="text-sm sm:text-base font-black text-white mt-0.5">
                    Sạch Sẽ — Đặt Giặt Sấy
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {standaloneApp === "customer" ? (
                  !buildTarget && (
                    <button
                      onClick={exitStandaloneMode}
                      className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer border border-white/20"
                      title="Quay lại thanh công cụ đa phân hệ để kiểm thử"
                    >
                      Thoát App Độc Lập
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => enterStandaloneMode("customer")}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-[11px] whitespace-nowrap cursor-pointer shadow-sm"
                    title="Chạy ở chế độ App Khách Hàng độc lập 100% như tải từ App Store / CH Play"
                  >
                    Chế Độ App Độc Lập
                  </button>
                )}
              </div>
            </header>

            <nav className="grid grid-cols-4 gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <NavLink
                to="/mobile-customer/home"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <MapPin className="w-4 h-4" />
                <span>1. Tìm Tiệm</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/create-order"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" />
                <span>2. Tạo Đơn</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/weight-confirm"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Scale className="w-4 h-4" />
                <span>3. Duyệt Cân</span>
              </NavLink>
              <NavLink
                to="/mobile-customer/tracking"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <ShoppingBag className="w-4 h-4" />
                <span>4. Tiến Độ</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Mobile Driver / Shipper App Header & Navigation (`vn.sachse.driver`) */}
        {isMobileDriverPage && (
          <div className="space-y-2.5">
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 border border-white/25">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                      vn.sachse.driver
                    </span>
                    {standaloneApp === "driver" && (
                      <span className="text-[10px] font-bold bg-amber-400/30 text-amber-100 px-2 py-0.5 rounded-full border border-amber-300/30">
                        App Độc Lập
                      </span>
                    )}
                  </div>
                  <h1 className="text-sm sm:text-base font-black text-white mt-0.5">
                    Sạch Sẽ Tài Xế (Driver Partner)
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {standaloneApp === "driver" ? (
                  !buildTarget && (
                    <button
                      onClick={exitStandaloneMode}
                      className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer border border-white/20"
                      title="Quay lại thanh công cụ đa phân hệ để kiểm thử"
                    >
                      Thoát App Độc Lập
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => enterStandaloneMode("driver")}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-extrabold text-[11px] whitespace-nowrap cursor-pointer shadow-sm"
                    title="Chạy ở chế độ App Tài Xế độc lập 100% như tải từ App Store / CH Play"
                  >
                    Chế Độ App Độc Lập
                  </button>
                )}
              </div>
            </header>

            <nav className="grid grid-cols-3 gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <NavLink
                to="/mobile-driver/radar"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Radio className="w-4 h-4" />
                <span>1. Sàn Nhận Chuyến</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/active-task"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Truck className="w-4 h-4" />
                <span>2. Chuyến Đang Giao</span>
              </NavLink>
              <NavLink
                to="/mobile-driver/wallet"
                className={({ isActive }) =>
                  `py-2 px-1.5 rounded-xl text-center text-[11px] font-bold flex flex-col items-center gap-1 transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Wallet className="w-4 h-4" />
                <span>3. Ví Thu Nhập</span>
              </NavLink>
            </nav>
          </div>
        )}
        {/* Store Owner Web Portal Header & Workspace Navigation */}
        {isStoreOwnerPage && (
          <div className="space-y-4">
            <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <NavLink
                  to="/store-owner/dashboard"
                  className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0"
                >
                  <Store className="w-5 h-5" />
                </NavLink>
                <div>
                  <span className="text-[11px] font-bold text-blue-600">
                    Web Portal Chủ Cửa Hàng · Store Manager
                  </span>
                  <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                    Hệ Thống Vận Hành Tiệm Giặt Sạch Sẽ
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-end">
                <NavLink
                  to="/"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                >
                  ← Giao Diện Khách Hàng
                </NavLink>
                <NavLink
                  to="/admin/dashboard"
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                >
                  Cổng Admin Chuỗi
                </NavLink>
              </div>
            </header>

            <nav className="bg-white p-2 rounded-2xl border border-slate-200 flex flex-wrap gap-1.5">
              <NavLink
                to="/store-owner/dashboard"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Store className="w-3.5 h-3.5" />
                1. Tổng Quan Tiệm
              </NavLink>

              <NavLink
                to="/store-owner/orders"
                className={({ isActive }) =>
                  `flex-1 min-w-[140px] py-2.5 px-3 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Scale className="w-3.5 h-3.5" />
                2. Đơn Giặt & Cân Thực Tế
              </NavLink>

              <NavLink
                to="/store-owner/equipment"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <WashingMachine className="w-3.5 h-3.5" />
                3. Máy Giặt & Thiết Bị
              </NavLink>

              <NavLink
                to="/store-owner/deliveries"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Truck className="w-3.5 h-3.5" />
                4. Điều Phối Shipper
              </NavLink>

              <NavLink
                to="/store-owner/settings"
                className={({ isActive }) =>
                  `flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Settings className="w-3.5 h-3.5" />
                5. Cấu Hình & Bảng Giá
              </NavLink>

              <NavLink
                to="/store-owner/mobile-plan"
                className={({ isActive }) =>
                  `flex-1 min-w-[140px] py-2.5 px-3 text-center text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Smartphone className="w-3.5 h-3.5" />
                6. Kế Hoạch Mobile App
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Header - Only show on admin pages when logged in */}
        {isAdminPage && isAdminLogged && (
          <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-widest">
                  Bảng Điều Khiển Admin
                </span>
                <h1 className="block text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Hệ Thống Quản Trị
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/store-owner/dashboard"
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                Cổng Chủ Cửa Hàng
              </NavLink>
              <div className="text-right mr-3">
                <p className="text-xs font-bold text-slate-700">
                  Quản trị viên
                </p>
                <p className="text-[10px] text-slate-500">Đã đăng nhập</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold cursor-pointer transition-colors text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng Xuất
              </button>
            </div>
          </header>
        )}

        {/* User Header - Only show on non-admin, non-store-owner, non-mobile pages */}
        {!isAdminPage &&
          !isStoreOwnerPage &&
          !isMobileCustomerPage &&
          !isMobileDriverPage &&
          !isAdminLogged && (
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
                  Tiệm Giặt Đồ Sạch Vô Trùng
                </span>
                <NavLink
                  to="/"
                  className="block text-xl md:text-2xl font-black text-slate-850 text-slate-900 tracking-tight hover:text-blue-600 transition-colors"
                >
                  Giặt Là <span className="text-blue-600">Sạch Sẽ</span>
                </NavLink>
              </div>
            </div>

            {/* Quick status information metrics and Store Owner / Admin portal triggers */}
            <div className="flex items-center gap-3 text-xs flex-wrap justify-center">
              <NavLink
                to="/store-owner/dashboard"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0"
              >
                <Store className="w-4 h-4 text-blue-400" />
                Web Chủ Cửa Hàng
              </NavLink>

              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-colors text-xs whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                Cài App
              </button>

              <div className="text-right hidden md:block">
                <p className="font-extrabold text-slate-700">
                  Dịch vụ tại nhà HN & HCM
                </p>
                <p className="text-slate-400 mt-0.5 text-[11px]">
                  Hotline gom đồ:{" "}
                  <span className="font-bold text-slate-600">1900-5454-99</span>
                </p>
              </div>

              {/* Unified Login state indicator */}
              {!userLogged && !isAdminLogged ? (
                <NavLink
                  to="/auth"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-all text-xs shadow-md shadow-blue-200/40"
                >
                  <CircleUser className="w-4 h-4" />
                  Đăng Nhập
                </NavLink>
              ) : (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {userLogged && (
                    <div className="flex items-center gap-2 bg-blue-50/75 border border-blue-100 p-1.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-blue-800 px-2 font-extrabold text-[11px] md:text-xs">
                        <CircleUser className="w-4 h-4 text-blue-600" />
                        <span className="max-w-[110px] truncate">
                          Chào, {userProfile?.fullName || userProfile?.username}
                        </span>
                      </div>
                      <button
                        onClick={handleUserLogout}
                        className="px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-slate-650 hover:text-rose-600 hover:border-rose-100 rounded-lg font-bold cursor-pointer transition-colors text-[10px] md:text-[11px]"
                      >
                        Đăng Xuất
                      </button>
                    </div>
                  )}

                  {isAdminLogged && (
                    <div className="flex items-center gap-1.5">
                      <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                          `px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                              : "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                          }`
                        }
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Bảng Quản Trị
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        title="Thoát quyền Admin"
                        className="p-2 border border-rose-200 bg-rose-50 text-rose-600 rounded-xl hover:bg-red-100 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Global Nav Link Tabs for user navigation and flow */}
        {!isAdminPage &&
          !isStoreOwnerPage &&
          !isMobileCustomerPage &&
          !isMobileDriverPage &&
          !isAdminLogged && (
          <nav className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-1.5">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-655 text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              1. Trang Chủ & Ước Tính
            </NavLink>

            <NavLink
              to="/stores-map"
              className={({ isActive }) =>
                `flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-655 text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              Bản Đồ Cửa Hàng
            </NavLink>

            {userLogged ? (
              <>
                <NavLink
                  to="/booking"
                  className={({ isActive }) =>
                    `flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "text-slate-655 text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  2. Đăng Ký Đặt Lịch
                </NavLink>

                <NavLink
                  to="/tracking"
                  className={({ isActive }) =>
                    `flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer relative ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "text-slate-655 text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  3. Theo Dõi Đơn Hàng
                  {activeOrdersCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 md:right-3 bg-rose-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                      {activeOrdersCount}
                    </span>
                  )}
                </NavLink>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    showToast(
                      "Vui lòng đăng nhập tài khoản để đặt lịch giặt là nhé!",
                      "warning",
                    );
                    navigate("/auth?redirect=/booking");
                  }}
                  className="flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer text-slate-600 hover:bg-slate-50"
                >
                  2. Đăng Ký Đặt Lịch (Cần Đăng Nhập)
                </button>

                <button
                  onClick={() => {
                    showToast(
                      "Vui lòng đăng nhập tài khoản để giám sát đơn hàng nhé!",
                      "warning",
                    );
                    navigate("/auth?redirect=/tracking");
                  }}
                  className="flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer text-slate-600 hover:bg-slate-50"
                >
                  3. Theo Dõi Đơn Hàng (Cần Đăng Nhập)
                </button>
              </>
            )}

            <NavLink
              to="/price-info"
              className={({ isActive }) =>
                `flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-655 text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              4. Bảng Giá & Hỏi Đáp
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `flex-1 min-w-[110px] py-3 text-center text-xs md:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-655 text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              5. Liên Hệ & Góp Ý
            </NavLink>
          </nav>
        )}

        {/* Dynamic Outlet View Container of React Router */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                isAdminLogged ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Home />
                )
              }
            />

            {/* System Analysis & Design (Use Case Diagrams for 4 Actors) */}
            <Route path="/system-design" element={<SystemDesignPage />} />

            {/* Store Owner Web Portal Routes */}
            <Route
              path="/store-owner"
              element={<Navigate to="/store-owner/dashboard" replace />}
            />
            <Route
              path="/store-owner/dashboard"
              element={<StoreOwnerDashboard />}
            />
            <Route
              path="/store-owner/orders"
              element={<StoreOwnerOrders />}
            />
            <Route
              path="/store-owner/equipment"
              element={<StoreOwnerEquipment />}
            />
            <Route
              path="/store-owner/deliveries"
              element={<StoreOwnerDeliveries />}
            />
            <Route
              path="/store-owner/settings"
              element={<StoreOwnerSettings />}
            />
            <Route
              path="/store-owner/mobile-plan"
              element={<StoreOwnerMobilePlan />}
            />

            {/* Mobile Customer App Routes (`src/pages/MobileCustomer/`) */}
            <Route
              path="/mobile-customer"
              element={<Navigate to="/mobile-customer/home" replace />}
            />
            <Route
              path="/mobile-customer/home"
              element={<MobileCustomerHome />}
            />
            <Route
              path="/mobile-customer/create-order"
              element={<MobileCustomerCreateOrder />}
            />
            <Route
              path="/mobile-customer/weight-confirm"
              element={<MobileCustomerWeightConfirm />}
            />
            <Route
              path="/mobile-customer/tracking"
              element={<MobileCustomerTracking />}
            />

            {/* Mobile Driver / Shipper App Routes (`src/pages/MobileDriver/`) */}
            <Route
              path="/mobile-driver"
              element={<Navigate to="/mobile-driver/radar" replace />}
            />
            <Route
              path="/mobile-driver/radar"
              element={<MobileDriverRadar />}
            />
            <Route
              path="/mobile-driver/active-task"
              element={<MobileDriverActiveTask />}
            />
            <Route
              path="/mobile-driver/wallet"
              element={<MobileDriverWallet />}
            />

            <Route
              path="/booking"
              element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              }
            />

            <Route
              path="/tracking"
              element={
                <PrivateRoute>
                  <Tracking />
                </PrivateRoute>
              }
            />

            <Route
              path="/price-info"
              element={
                isAdminLogged ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <PriceInfo />
                )
              }
            />
            <Route
              path="/contact"
              element={
                isAdminLogged ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Contact />
                )
              }
            />
            <Route
              path="/auth"
              element={
                isAdminLogged ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <UserAuth />
                )
              }
            />
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
            <Route
              path="/stores-map"
              element={
                isAdminLogged ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <StoresMapPage />
                )
              }
            />

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
      {isMobileCustomerPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
            <NavLink
              to="/mobile-customer/home"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
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
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
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
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
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
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  isActive ? "text-blue-600 bg-blue-50" : "text-slate-500"
                }`
              }
            >
              <ShoppingBag className="w-4 h-4 mb-0.5" />
              <span>Tiến Độ</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Native Bottom Navigation Bar for Standalone Driver App (`vn.sachse.driver`) */}
      {isMobileDriverPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
            <NavLink
              to="/mobile-driver/radar"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  isActive ? "text-emerald-600 bg-emerald-50" : "text-slate-500"
                }`
              }
            >
              <Radio className="w-4 h-4 mb-0.5" />
              <span>Sàn Nhận Chuyến</span>
            </NavLink>
            <NavLink
              to="/mobile-driver/active-task"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  isActive ? "text-emerald-600 bg-emerald-50" : "text-slate-500"
                }`
              }
            >
              <Truck className="w-4 h-4 mb-0.5" />
              <span>Chuyến Đang Giao</span>
            </NavLink>
            <NavLink
              to="/mobile-driver/wallet"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  isActive ? "text-emerald-600 bg-emerald-50" : "text-slate-500"
                }`
              }
            >
              <Wallet className="w-4 h-4 mb-0.5" />
              <span>Ví Thu Nhập</span>
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
                  Hệ Thống Tiệm Giặt Sạch Sẽ
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dịch vụ thu gom và phát trả đồ giặt là vô trùng trọn gói, tiên
                phong mang đến chất lượng sống thảnh thơi, thơm mát cho từng nếp
                nhà thủ đô.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs">
                Liên hệ văn phòng
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
                Khu vực phục vụ tập trung
              </h4>
              <p>
                • Hà Nội: Cầu Giấy, Đống Đa, Ba Đình, Hoàn Kiếm, Hai Bà Trưng,
                Thanh Xuân, Nam Từ Liêm.
              </p>
              <p>
                • TP.HCM: Quận 1, Quận 3, Quận 10, Phú Nhuận, Bình Thạnh, Gò Vấp,
                Thủ Đức.
              </p>
            </div>
          </div>

          <div className="max-w-6xl w-full mx-auto px-4 md:px-6 border-t border-slate-800/80 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>
              © 2026 Giặt Là Sạch Sẽ Việt Nam Co., Ltd. Tất cả quyền lợi bảo lưu.
            </p>
            <div className="flex gap-4">
              <NavLink
                to="/price-info"
                className="hover:text-slate-400 transition-colors"
              >
                Chính sách bảo hiểm 20x
              </NavLink>
              <span>•</span>
              <NavLink
                to="/price-info"
                className="hover:text-slate-400 transition-colors"
              >
                Điều khoản hợp tác
              </NavLink>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Bar for legacy web portal only */}
      {!standaloneApp && !isMobileCustomerPage && !isMobileDriverPage && (
        <MobileNav />
      )}

      {/* App Install / Electron Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </ToastProvider>
    </Router>
  );
}
