import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  Calendar,
  Package,
  Store,
  ShieldCheck,
  User
} from "lucide-react";

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      label: "Trang chủ",
      path: "/",
      icon: Home,
      isActive: path === "/",
    },
    {
      label: "Bản đồ tiệm",
      path: "/stores-map",
      icon: MapPin,
      isActive: path.startsWith("/stores-map"),
    },
    {
      label: "Đặt lịch",
      path: "/booking",
      icon: Calendar,
      isActive: path.startsWith("/booking"),
      highlight: true,
    },
    {
      label: "Theo dõi đơn",
      path: "/tracking",
      icon: Package,
      isActive: path.startsWith("/tracking"),
    },
    {
      label: "Cửa hàng/Admin",
      path: "/admin",
      icon: Store,
      isActive: path.startsWith("/admin"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.highlight) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border-2 border-white transform active:scale-95 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 mt-1">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[60px] min-h-[48px] rounded-xl transition-all active:scale-95 ${
              item.isActive
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            <Icon className={`w-5 h-5 ${item.isActive ? "text-blue-600" : "text-slate-400"}`} />
            <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileNav;
