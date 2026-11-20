import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import {
  X,
  Reply,
  User,
  Bike,
  Store,
  ShieldCheck,
  Zap,
  Bell,
  BellRing,
  CheckCheck,
  Check,
  Trash2,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { OrderChatMessage } from "../types";
import { useRealtimeOrders } from "../utils/realtimeClient";
import { OrderChatDrawer } from "./OrderChatDrawer";
import { getScopedProfile, getScopedToken } from "../utils/authStorage";
import { laundryOrdersAPI } from "../services/api";

export type ActorRole = "customer" | "driver" | "store";

const hasRoleAuthToken = (role: ActorRole): boolean => {
  if (role === "driver") return Boolean(getScopedToken("driver"));
  if (role === "store") {
    return Boolean(getScopedToken("store_owner") || getScopedToken("admin"));
  }
  return Boolean(getScopedToken("customer"));
};

export interface StoredNotificationItem {
  id: string;
  orderId: string;
  targetRole: ActorRole;
  senderRole: "customer" | "driver" | "store" | "system";
  senderName: string;
  text: string;
  isQuickReply?: boolean;
  createdAt: string;
  receivedAt: number;
  isRead: boolean;
  customerName: string;
  storeName: string;
  shipperName: string;
  messages: OrderChatMessage[];
}

interface IncomingChatBanner {
  id: string;
  orderId: string;
  message: OrderChatMessage;
  messages: OrderChatMessage[];
  customerName: string;
  storeName: string;
  shipperName: string;
  receivedAt: number;
}

const STORAGE_KEY_PREFIX = "sachse_bell_notifications_v3_";
const BELL_SYNC_EVENT = "sachse_bell_notifications_updated";
const OPEN_BELL_DRAWER_EVENT = "sachse_open_bell_drawer";

const SENDER_BADGE_MAP: Record<
  "customer" | "driver" | "store" | "system",
  {
    label: string;
    badgeBg: string;
    lightBadgeBg: string;
    iconBg: string;
    accentBorder: string;
  }
> = {
  customer: {
    label: "Khách hàng",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    lightBadgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-600 text-white",
    accentBorder: "border-blue-500/50",
  },
  driver: {
    label: "Tài xế (Shipper)",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    lightBadgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-600 text-white",
    accentBorder: "border-emerald-500/50",
  },
  store: {
    label: "Chủ tiệm (Owner)",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    lightBadgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    iconBg: "bg-amber-600 text-white",
    accentBorder: "border-amber-500/50",
  },
  system: {
    label: "Hệ thống",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    lightBadgeBg: "bg-teal-50 text-teal-800 border-teal-200",
    iconBg: "bg-teal-600 text-white",
    accentBorder: "border-teal-500/50",
  },
};

const RECEIVER_ROLE_LABELS: Record<ActorRole, string> = {
  customer: "Khách hàng",
  driver: "Shipper / Tài xế",
  store: "Chủ tiệm giặt (Owner)",
};

export const loadStoredNotifications = (
  role: ActorRole
): StoredNotificationItem[] => {
  try {
    // Clean up legacy v2 storage that contained fake seed notifications
    localStorage.removeItem(`sachse_bell_notifications_v2_${role}`);
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${role}`);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item.id === "string" && !item.id.startsWith("seed-")
      );
    }
  } catch {}
  return [];
};

export const saveStoredNotifications = (
  role: ActorRole,
  items: StoredNotificationItem[]
) => {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${role}`,
      JSON.stringify(items.slice(0, 40))
    );
    window.dispatchEvent(new CustomEvent(BELL_SYNC_EVENT, { detail: { role } }));
  } catch {}
};

const playNotificationChime = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.setValueAtTime(880, now + 0.11);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);
  } catch {
    // Ignore audio context restrictions
  }
};

const formatRelativeTime = (isoOrMs: string | number): string => {
  const ts = typeof isoOrMs === "number" ? isoOrMs : new Date(isoOrMs).getTime();
  if (Number.isNaN(ts)) return "Vừa xong";
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const d = new Date(ts);
  return d.toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Reusable Notification Bell Button (`button hình quả chuông`) for all 3 actors:
 * - Khách hàng (Customer)
 * - Shipper / Tài xế (Driver)
 * - Chủ tiệm (Store Owner)
 */
export const NotificationBellButton: React.FC<{
  role?: ActorRole;
  variant?: "default" | "radarCircle";
}> = ({ role, variant = "default" }) => {
  const location = useLocation();
  const resolvedRole: ActorRole =
    role ||
    (location.pathname.startsWith("/mobile-driver")
      ? "driver"
      : location.pathname.startsWith("/store-owner")
        ? "store"
        : "customer");

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    hasRoleAuthToken(resolvedRole)
  );
  const [items, setItems] = useState<StoredNotificationItem[]>(() =>
    hasRoleAuthToken(resolvedRole) ? loadStoredNotifications(resolvedRole) : []
  );

  const refreshItems = useCallback(() => {
    const authed = hasRoleAuthToken(resolvedRole);
    setIsAuthenticated(authed);
    setItems(authed ? loadStoredNotifications(resolvedRole) : []);
  }, [resolvedRole]);

  useEffect(() => {
    refreshItems();
    const handleSync = () => refreshItems();
    const handleStorage = () => {
      refreshItems();
    };
    window.addEventListener(BELL_SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(BELL_SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshItems, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent(OPEN_BELL_DRAWER_EVENT, {
        detail: { role: resolvedRole },
      })
    );
  };

  if (variant === "radarCircle") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Thông báo của Shipper (${unreadCount} chưa xem)`}
        aria-label="Mở danh sách thông báo"
        className="pointer-events-auto w-12 h-12 shrink-0 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(15,23,42,0.16)] border-2 border-slate-100 flex items-center justify-center text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-emerald-600 animate-wiggle" />
        ) : (
          <Bell className="w-5 h-5 text-slate-700" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Thông báo (${unreadCount} tin chưa xem)`}
      aria-label="Mở hộp thư thông báo"
      className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
        unreadCount > 0
          ? "bg-amber-50/90 hover:bg-amber-100 border-amber-200 text-amber-700 shadow-2xs"
          : "bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-600 hover:text-slate-900"
      }`}
    >
      {unreadCount > 0 ? (
        <BellRing className="w-4 h-4 text-amber-600" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export const ChatMessageNotificationBar: React.FC = () => {
  const location = useLocation();
  const [banners, setBanners] = useState<IncomingChatBanner[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Bell Notification History Drawer state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "unread" | "read">(
    "all"
  );
  const [historyItems, setHistoryItems] = useState<StoredNotificationItem[]>(
    []
  );

  // State for opening OrderChatDrawer directly from the notification bar or history list
  const [activeChatOrder, setActiveChatOrder] = useState<{
    orderId: string;
    customerName: string;
    storeName: string;
    shipperName: string;
    messages: OrderChatMessage[];
  } | null>(null);

  const seenBannerRoleRef = useRef<Set<string>>(new Set());

  // Determine active role from the current portal route
  const viewerRole: ActorRole = location.pathname.startsWith("/mobile-driver")
    ? "driver"
    : location.pathname.startsWith("/store-owner")
      ? "store"
      : "customer";

  const isExcludedRoute =
    location.pathname.includes("/login") ||
    location.pathname.startsWith("/admin");

  const [isViewerAuthenticated, setIsViewerAuthenticated] = useState<boolean>(
    () => !isExcludedRoute && hasRoleAuthToken(viewerRole)
  );

  useEffect(() => {
    const syncAuth = () => {
      const authed = !isExcludedRoute && hasRoleAuthToken(viewerRole);
      setIsViewerAuthenticated(authed);
      if (!authed) {
        setIsHistoryOpen(false);
        setBanners([]);
        setActiveChatOrder(null);
      }
    };
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [viewerRole, isExcludedRoute, location.pathname]);

  const refreshHistory = useCallback(() => {
    if (!isViewerAuthenticated) {
      setHistoryItems([]);
      return;
    }
    setHistoryItems(loadStoredNotifications(viewerRole));
  }, [viewerRole, isViewerAuthenticated]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Listen for Bell button clicks
  useEffect(() => {
    const handleOpenDrawer = () => {
      if (!isViewerAuthenticated) return;
      refreshHistory();
      setIsHistoryOpen(true);
    };
    const handleSync = () => {
      refreshHistory();
    };
    window.addEventListener(OPEN_BELL_DRAWER_EVENT, handleOpenDrawer);
    window.addEventListener(BELL_SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(OPEN_BELL_DRAWER_EVENT, handleOpenDrawer);
      window.removeEventListener(BELL_SYNC_EVENT, handleSync);
    };
  }, [refreshHistory, isViewerAuthenticated]);

  // Sync recent order chat messages from backend only when authenticated for the active role
  useEffect(() => {
    if (!isViewerAuthenticated) return;
    let mounted = true;
    laundryOrdersAPI
      .getAll()
      .then((res) => {
        if (!mounted) return;
        const orders = Array.isArray(res.data?.data) ? res.data.data : [];
        const currentList = loadStoredNotifications(viewerRole);
        const existingIds = new Set(currentList.map((item) => item.id));
        let changed = false;

        orders.forEach((ord: any) => {
          const msgs: OrderChatMessage[] = Array.isArray(ord.messages)
            ? ord.messages
            : [];
          msgs.forEach((m) => {
            if (!m?.id || m.senderRole === viewerRole) return;
            const notifId = `notif_${viewerRole}_${m.id}`;
            if (!existingIds.has(notifId)) {
              existingIds.add(notifId);
              changed = true;
              currentList.unshift({
                id: notifId,
                orderId: ord.id,
                targetRole: viewerRole,
                senderRole: m.senderRole,
                senderName: m.senderName || "Hệ thống",
                text: m.text,
                isQuickReply: m.isQuickReply,
                createdAt: m.createdAt || new Date().toISOString(),
                receivedAt: m.createdAt
                  ? new Date(m.createdAt).getTime()
                  : Date.now(),
                isRead: false,
                customerName: ord.customerName || "Khách hàng",
                storeName: ord.storeName || "Tiệm Giặt Sạch Sẽ",
                shipperName: ord.shipperName || "Tài xế Sạch Sẽ",
                messages: msgs,
              });
            }
          });
        });

        if (changed) {
          currentList.sort((a, b) => b.receivedAt - a.receivedAt);
          saveStoredNotifications(viewerRole, currentList);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [viewerRole, isViewerAuthenticated]);

  const getCurrentUserDisplayName = useCallback((): string | undefined => {
    const scope =
      viewerRole === "driver"
        ? "driver"
        : viewerRole === "store"
          ? "store_owner"
          : "customer";
    const profile = getScopedProfile(scope);
    return profile?.name || profile?.fullName || undefined;
  }, [viewerRole]);

  const recordNotificationToAllOtherRoles = useCallback(
    (payload: {
      orderId: string;
      message: OrderChatMessage;
      messages: OrderChatMessage[];
      customerName: string;
      storeName: string;
      shipperName: string;
    }) => {
      const roles: ActorRole[] = ["customer", "driver", "store"];
      roles.forEach((targetRole) => {
        if (payload.message.senderRole === targetRole) return;
        const notifId = `notif_${targetRole}_${payload.message.id}`;
        const list = loadStoredNotifications(targetRole);
        if (!list.some((item) => item.id === notifId)) {
          const newItem: StoredNotificationItem = {
            id: notifId,
            orderId: payload.orderId,
            targetRole,
            senderRole: payload.message.senderRole,
            senderName: payload.message.senderName,
            text: payload.message.text,
            isQuickReply: payload.message.isQuickReply,
            createdAt: payload.message.createdAt || new Date().toISOString(),
            receivedAt: Date.now(),
            isRead: false,
            customerName: payload.customerName,
            storeName: payload.storeName,
            shipperName: payload.shipperName,
            messages: payload.messages,
          };
          saveStoredNotifications(targetRole, [newItem, ...list]);
        }
      });
    },
    []
  );

  const enqueueIncomingMessage = useCallback(
    (payload: {
      orderId?: string;
      message?: OrderChatMessage;
      messages?: OrderChatMessage[];
      customerName?: string;
      storeName?: string;
      shipperName?: string;
    }) => {
      const msg = payload?.message;
      const orderId = payload?.orderId || msg?.orderId || "";
      if (!orderId || !msg || !msg.id) return;

      const normalizedPayload = {
        orderId,
        message: msg,
        messages: Array.isArray(payload.messages) ? payload.messages : [msg],
        customerName: payload.customerName || "Khách hàng",
        storeName: payload.storeName || "Tiệm Giặt Sạch Sẽ",
        shipperName: payload.shipperName || "Tài xế Sạch Sẽ",
      };

      // Always store in the Bell notification history for the other 2 roles
      recordNotificationToAllOtherRoles(normalizedPayload);

      // Only show floating popup banner to the OTHER participants (not the role that sent it)
      if (msg.senderRole === viewerRole) {
        return;
      }

      const roleSeenKey = `${viewerRole}_${msg.id}`;
      if (seenBannerRoleRef.current.has(roleSeenKey)) {
        return;
      }
      seenBannerRoleRef.current.add(roleSeenKey);

      // Mark seen in localStorage for this viewerRole's popup banner
      try {
        const raw = localStorage.getItem("sachse_latest_chat_event");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.message?.id === msg.id) {
            const seenRoles: string[] = Array.isArray(parsed.seenByRoles)
              ? parsed.seenByRoles
              : [];
            if (!seenRoles.includes(viewerRole)) {
              parsed.seenByRoles = [...seenRoles, viewerRole];
              localStorage.setItem(
                "sachse_latest_chat_event",
                JSON.stringify(parsed)
              );
            }
          }
        }
      } catch {}

      if (activeChatOrder && activeChatOrder.orderId === orderId) {
        return;
      }

      playNotificationChime();

      const newBanner: IncomingChatBanner = {
        id: msg.id,
        orderId,
        message: msg,
        messages: normalizedPayload.messages,
        customerName: normalizedPayload.customerName,
        storeName: normalizedPayload.storeName,
        shipperName: normalizedPayload.shipperName,
        receivedAt: Date.now(),
      };

      setBanners((prev) =>
        [newBanner, ...prev.filter((n) => n.id !== msg.id)].slice(0, 3)
      );
    },
    [viewerRole, activeChatOrder, recordNotificationToAllOtherRoles]
  );

  const handleRealtimeEvent = useCallback(
    (event: any) => {
      if (!isViewerAuthenticated) return;
      if (event.type === "ORDER_CHAT_MESSAGE" && event.data?.message) {
        enqueueIncomingMessage(event.data);
      }
    },
    [enqueueIncomingMessage, isViewerAuthenticated]
  );

  useRealtimeOrders(handleRealtimeEvent);

  // Also check localStorage when switching portals in the same tab or receiving storage events across tabs
  useEffect(() => {
    if (!isViewerAuthenticated) return;
    const checkStoredChatEvent = () => {
      try {
        const raw = localStorage.getItem("sachse_latest_chat_event");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed?.message?.id || !parsed?.savedAt) return;
        if (Date.now() - Number(parsed.savedAt) > 180000) return;
        const seenRoles: string[] = Array.isArray(parsed.seenByRoles)
          ? parsed.seenByRoles
          : [];
        if (
          parsed.message.senderRole !== viewerRole &&
          !seenRoles.includes(viewerRole)
        ) {
          enqueueIncomingMessage(parsed);
        }
      } catch {}
    };

    checkStoredChatEvent();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "sachse_latest_chat_event" && e.newValue) {
        checkStoredChatEvent();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [viewerRole, enqueueIncomingMessage, isViewerAuthenticated]);

  // Auto-dismiss floating banner after 8 seconds unless hovered
  useEffect(() => {
    if (banners.length === 0 || isHovered) return;

    const timer = window.setInterval(() => {
      const now = Date.now();
      setBanners((prev) => prev.filter((item) => now - item.receivedAt < 8000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [banners.length, isHovered]);

  const dismissBanner = (id: string) => {
    setBanners((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationReadState = (id: string, isRead: boolean) => {
    const updated = historyItems.map((item) =>
      item.id === id ? { ...item, isRead } : item
    );
    setHistoryItems(updated);
    saveStoredNotifications(viewerRole, updated);
  };

  const markAllAsRead = () => {
    const updated = historyItems.map((item) => ({ ...item, isRead: true }));
    setHistoryItems(updated);
    saveStoredNotifications(viewerRole, updated);
  };

  const clearAllNotifications = () => {
    setHistoryItems([]);
    saveStoredNotifications(viewerRole, []);
  };

  const handleOpenReplyFromBanner = (banner: IncomingChatBanner) => {
    // Also mark corresponding notification in Bell history as read
    const notifId = `notif_${viewerRole}_${banner.id}`;
    const currentList = loadStoredNotifications(viewerRole).map((item) =>
      item.id === notifId || item.orderId === banner.orderId
        ? { ...item, isRead: true }
        : item
    );
    saveStoredNotifications(viewerRole, currentList);

    setActiveChatOrder({
      orderId: banner.orderId,
      customerName: banner.customerName,
      storeName: banner.storeName,
      shipperName: banner.shipperName,
      messages: banner.messages,
    });
    setBanners((prev) => prev.filter((n) => n.orderId !== banner.orderId));
  };

  const handleClickHistoryItem = (item: StoredNotificationItem) => {
    markNotificationReadState(item.id, true);
    setIsHistoryOpen(false);
    setActiveChatOrder({
      orderId: item.orderId,
      customerName: item.customerName,
      storeName: item.storeName,
      shipperName: item.shipperName,
      messages: item.messages,
    });
  };

  const renderSenderIcon = (
    role: "customer" | "driver" | "store" | "system"
  ) => {
    if (role === "driver") return <Bike className="w-4 h-4" />;
    if (role === "store") return <Store className="w-4 h-4" />;
    if (role === "system") return <ShieldCheck className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const latestBanner = banners[0] || null;
  const unreadCount = historyItems.filter((i) => !i.isRead).length;
  const readCount = historyItems.filter((i) => i.isRead).length;

  const filteredHistory = historyItems.filter((item) => {
    if (historyFilter === "unread") return !item.isRead;
    if (historyFilter === "read") return item.isRead;
    return true;
  });

  if (!isViewerAuthenticated) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING INCOMING MESSAGE NOTIFICATION BAR */}
      {latestBanner && (
        <div
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[1250] w-[calc(100%-1.5rem)] max-w-lg pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {(() => {
            const senderCfg =
              SENDER_BADGE_MAP[latestBanner.message.senderRole] ||
              SENDER_BADGE_MAP.customer;

            return (
              <div
                className={`bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border ${senderCfg.accentBorder} shadow-2xl overflow-hidden`}
              >
                {/* Top Status Bar */}
                <div className="px-4 py-2 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-teal-300">
                      <BellRing className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
                      Tin nhắn mới • {RECEIVER_ROLE_LABELS[viewerRole]}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-md shrink-0">
                      #{latestBanner.orderId.toUpperCase()}
                    </span>
                    {banners.length > 1 && (
                      <span className="text-[10px] font-extrabold bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded-md">
                        +{banners.length - 1} tin mới
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissBanner(latestBanner.id)}
                    className="w-6 h-6 rounded-lg bg-slate-700/70 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Đóng thông báo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-3.5 flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${senderCfg.iconBg} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    {renderSenderIcon(latestBanner.message.senderRole)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${senderCfg.badgeBg}`}
                      >
                        {senderCfg.label}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {latestBanner.message.senderName}
                      </span>
                      {latestBanner.message.isQuickReply && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-300 bg-teal-500/15 px-1.5 py-0.5 rounded">
                          <Zap className="w-2.5 h-2.5" />
                          Nhanh
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-100 font-medium mt-1 line-clamp-2 break-words">
                      “{latestBanner.message.text}”
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Vừa xong • Bấm để mở Kênh Chat 3 bên
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenReplyFromBanner(latestBanner)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer shadow-sm"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          Xem & Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. BELL NOTIFICATION HISTORY MODAL / DRAWER (Hộp thư thông báo đã qua cho cả 3 Actor) */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 z-[1260] bg-slate-900/55 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-150"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      Lịch Sử Thông Báo ({RECEIVER_ROLE_LABELS[viewerRole]})
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-lg shrink-0">
                        {unreadCount} chưa xem
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    Tin chưa xem hiện đậm nổi bật • Tin đã xem hiển thị mờ nhạt
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Quick Action Bar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHistoryFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    historyFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Tất cả ({historyItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter("unread")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    historyFilter === "unread"
                      ? "bg-teal-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Chưa xem ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter("read")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    historyFilter === "read"
                      ? "bg-slate-700 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Đã xem ({readCount})
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Đánh dấu đã xem hết
                  </button>
                )}
                {historyItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Xóa toàn bộ lịch sử thông báo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-100/70">
              {filteredHistory.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    Không có thông báo nào trong mục này
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Khi Khách hàng, Shipper hoặc Chủ tiệm nhắn tin trong đơn
                    hàng, thông báo sẽ được lưu tại đây.
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const senderCfg =
                    SENDER_BADGE_MAP[item.senderRole] ||
                    SENDER_BADGE_MAP.customer;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleClickHistoryItem(item)}
                      className={`group rounded-2xl border p-3.5 transition-all cursor-pointer relative ${
                        item.isRead
                          ? "opacity-55 bg-slate-50/80 border-slate-200/70 grayscale-[25%] hover:opacity-90 hover:grayscale-0"
                          : "opacity-100 bg-white border-teal-300 shadow-sm ring-1 ring-teal-500/15 hover:border-teal-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Sender Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            item.isRead
                              ? "bg-slate-200 text-slate-500"
                              : `${senderCfg.iconBg} shadow-xs`
                          }`}
                        >
                          {renderSenderIcon(item.senderRole)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Unread/Read visual status badge */}
                              {item.isRead ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-500">
                                  <CheckCheck className="w-3 h-3" />
                                  Đã xem
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                  MỚI · CHƯA XEM
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  item.isRead
                                    ? "bg-slate-100 text-slate-500 border-slate-200"
                                    : senderCfg.lightBadgeBg
                                }`}
                              >
                                {senderCfg.label}
                              </span>

                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                #{item.orderId.toUpperCase()}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-400 shrink-0">
                              {formatRelativeTime(item.receivedAt)}
                            </span>
                          </div>

                          <p
                            className={`text-xs mt-1.5 truncate ${
                              item.isRead
                                ? "font-medium text-slate-500"
                                : "font-extrabold text-slate-900"
                            }`}
                          >
                            {item.senderName}
                          </p>

                          <p
                            className={`text-sm mt-0.5 line-clamp-2 break-words ${
                              item.isRead
                                ? "font-normal text-slate-400"
                                : "font-semibold text-slate-800"
                            }`}
                          >
                            “{item.text}”
                          </p>

                          <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] ${
                                item.isRead
                                  ? "text-slate-400 font-normal"
                                  : "text-teal-700 font-bold"
                              }`}
                            >
                              <MessageSquare className="w-3 h-3" />
                              Bấm để mở khung chat & trả lời
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationReadState(
                                  item.id,
                                  !item.isRead
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title={
                                item.isRead
                                  ? "Đánh dấu là Chưa xem (hiện đậm)"
                                  : "Đánh dấu là Đã xem (làm mờ)"
                              }
                            >
                              {item.isRead ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  Đánh dấu chưa xem
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  Đánh dấu đã xem
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. EMBEDDED OrderChatDrawer when user clicks a notification or "Xem & Trả lời" */}
      <OrderChatDrawer
        orderId={activeChatOrder?.orderId || null}
        isOpen={Boolean(activeChatOrder)}
        onClose={() => setActiveChatOrder(null)}
        currentRole={viewerRole}
        currentSenderName={getCurrentUserDisplayName()}
        customerName={activeChatOrder?.customerName}
        storeName={activeChatOrder?.storeName}
        shipperName={activeChatOrder?.shipperName}
        initialMessages={activeChatOrder?.messages || []}
      />
    </>
  );
};
