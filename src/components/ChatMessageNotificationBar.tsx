import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  X,
  Reply,
  User,
  Bike,
  Store,
  ShieldCheck,
  Zap,
  BellRing,
} from "lucide-react";
import { OrderChatMessage } from "../types";
import { useRealtimeOrders } from "../utils/realtimeClient";
import { OrderChatDrawer } from "./OrderChatDrawer";
import { getScopedProfile } from "../utils/authStorage";

interface IncomingChatNotification {
  id: string;
  orderId: string;
  message: OrderChatMessage;
  messages: OrderChatMessage[];
  customerName: string;
  storeName: string;
  shipperName: string;
  receivedAt: number;
}

const SENDER_BADGE_MAP: Record<
  "customer" | "driver" | "store" | "system",
  {
    label: string;
    badgeBg: string;
    iconBg: string;
    accentBorder: string;
  }
> = {
  customer: {
    label: "Khách hàng",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    iconBg: "bg-blue-600 text-white",
    accentBorder: "border-blue-500/50",
  },
  driver: {
    label: "Tài xế (Shipper)",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    iconBg: "bg-emerald-600 text-white",
    accentBorder: "border-emerald-500/50",
  },
  store: {
    label: "Chủ tiệm (Owner)",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    iconBg: "bg-amber-600 text-white",
    accentBorder: "border-amber-500/50",
  },
  system: {
    label: "Hệ thống",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    iconBg: "bg-teal-600 text-white",
    accentBorder: "border-teal-500/50",
  },
};

const RECEIVER_ROLE_LABELS: Record<"customer" | "driver" | "store", string> = {
  customer: "Khách hàng",
  driver: "Shipper / Tài xế",
  store: "Chủ tiệm giặt (Owner)",
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
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.11); // A5
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

export const ChatMessageNotificationBar: React.FC = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState<
    IncomingChatNotification[]
  >([]);
  const [isHovered, setIsHovered] = useState(false);

  // State for opening OrderChatDrawer directly from the notification bar
  const [activeChatOrder, setActiveChatOrder] = useState<{
    orderId: string;
    customerName: string;
    storeName: string;
    shipperName: string;
    messages: OrderChatMessage[];
  } | null>(null);

  const seenByRoleRef = useRef<Set<string>>(new Set());

  // Determine active role from the current portal route
  const viewerRole: "customer" | "driver" | "store" =
    location.pathname.startsWith("/mobile-driver")
      ? "driver"
      : location.pathname.startsWith("/store-owner")
        ? "store"
        : "customer";

  const getCurrentUserDisplayName = useCallback((): string | undefined => {
    const scope =
      viewerRole === "driver"
        ? "driver"
        : viewerRole === "store"
          ? "store_owner"
          : "customer";
    const profile = getScopedProfile(scope);
    return profile?.name || undefined;
  }, [viewerRole]);

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

      // Only notify the OTHER participants (Khách hàng, Shipper, Owner) — not the role that sent it
      if (msg.senderRole === viewerRole) {
        return;
      }

      const roleSeenKey = `${viewerRole}_${msg.id}`;
      if (seenByRoleRef.current.has(roleSeenKey)) {
        return;
      }
      seenByRoleRef.current.add(roleSeenKey);

      // Mark seen in localStorage for this viewerRole
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

      const newNotif: IncomingChatNotification = {
        id: msg.id,
        orderId,
        message: msg,
        messages: Array.isArray(payload.messages) ? payload.messages : [msg],
        customerName: payload.customerName || "Khách hàng",
        storeName: payload.storeName || "Tiệm Giặt Sạch Sẽ",
        shipperName: payload.shipperName || "Tài xế Sạch Sẽ",
        receivedAt: Date.now(),
      };

      setNotifications((prev) =>
        [newNotif, ...prev.filter((n) => n.id !== msg.id)].slice(0, 3)
      );
    },
    [viewerRole, activeChatOrder]
  );

  const handleRealtimeEvent = useCallback(
    (event: any) => {
      if (event.type === "ORDER_CHAT_MESSAGE" && event.data?.message) {
        enqueueIncomingMessage(event.data);
      }
    },
    [enqueueIncomingMessage]
  );

  useRealtimeOrders(handleRealtimeEvent);

  // Also check localStorage when switching portals in the same tab or receiving storage events across tabs
  useEffect(() => {
    const checkStoredChatEvent = () => {
      try {
        const raw = localStorage.getItem("sachse_latest_chat_event");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed?.message?.id || !parsed?.savedAt) return;
        // Only trigger for messages sent within the last 3 minutes
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
  }, [viewerRole, enqueueIncomingMessage]);

  // Auto-dismiss notifications after 8 seconds unless hovered
  useEffect(() => {
    if (notifications.length === 0 || isHovered) return;

    const timer = window.setInterval(() => {
      const now = Date.now();
      setNotifications((prev) =>
        prev.filter((item) => now - item.receivedAt < 8000)
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [notifications.length, isHovered]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenReplyDrawer = (notif: IncomingChatNotification) => {
    setActiveChatOrder({
      orderId: notif.orderId,
      customerName: notif.customerName,
      storeName: notif.storeName,
      shipperName: notif.shipperName,
      messages: notif.messages,
    });
    setNotifications((prev) =>
      prev.filter((n) => n.orderId !== notif.orderId)
    );
  };

  const renderSenderIcon = (
    role: "customer" | "driver" | "store" | "system"
  ) => {
    if (role === "driver") return <Bike className="w-4 h-4" />;
    if (role === "store") return <Store className="w-4 h-4" />;
    if (role === "system") return <ShieldCheck className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const latestNotif = notifications[0] || null;

  return (
    <>
      {latestNotif && (
        <div
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[1250] w-[calc(100%-1.5rem)] max-w-lg pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {(() => {
            const senderCfg =
              SENDER_BADGE_MAP[latestNotif.message.senderRole] ||
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
                      #{latestNotif.orderId.toUpperCase()}
                    </span>
                    {notifications.length > 1 && (
                      <span className="text-[10px] font-extrabold bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded-md">
                        +{notifications.length - 1} tin mới
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissNotification(latestNotif.id)}
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
                    {renderSenderIcon(latestNotif.message.senderRole)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${senderCfg.badgeBg}`}
                      >
                        {senderCfg.label}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {latestNotif.message.senderName}
                      </span>
                      {latestNotif.message.isQuickReply && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-300 bg-teal-500/15 px-1.5 py-0.5 rounded">
                          <Zap className="w-2.5 h-2.5" />
                          Nhanh
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-100 font-medium mt-1 line-clamp-2 break-words">
                      “{latestNotif.message.text}”
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Vừa xong • Bấm để mở Kênh Chat 3 bên
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenReplyDrawer(latestNotif)}
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

      {/* Embedded OrderChatDrawer when user clicks "Xem & Trả lời" on the notification bar */}
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
