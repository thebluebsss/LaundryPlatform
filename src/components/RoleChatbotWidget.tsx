import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  MessageCircleQuestion,
  X,
  Send,
  RotateCcw,
  User,
  Bike,
  Bot,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { assistantAPI } from "../services/api";
import { getScopedProfile } from "../utils/authStorage";

type ChatRole = "customer" | "driver";

interface ChatTurn {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  source?: string;
}

interface ContextStat {
  label: string;
  value: string;
}

const STORAGE_KEY_MAP: Record<ChatRole, string> = {
  customer: "sachse_qa_chatbot_customer_v1",
  driver: "sachse_qa_chatbot_driver_v1",
};

const QUICK_PROMPTS_BY_ROLE: Record<ChatRole, string[]> = {
  customer: [
    "Bảng giá dịch vụ giặt sấy hiện tại?",
    "Danh sách các chi nhánh tiệm giặt tại Hà Nội?",
    "Kiểm tra trạng thái đơn giặt gần nhất của tôi",
    "Quy trình cân đồ, xác nhận giá và thanh toán VietQR?",
  ],
  driver: [
    "Hướng dẫn quy trình giao nhận 4 bước cho Shipper?",
    "Kiểm tra số dư Ví thu nhập và số chuyến hoàn thành",
    "Xem lộ trình, điểm lấy và điểm giao chuyến đang chạy",
    "Quy định tính cước phí giao hàng và thưởng tài xế?",
  ],
};

const getInitialGreeting = (role: ChatRole, userName?: string): ChatTurn => {
  if (role === "driver") {
    return {
      id: "welcome-driver",
      sender: "bot",
      text: `Xin chào tài xế ${userName || "Đối tác Sạch Sẽ"}! Tôi là Trợ lý Hỏi Đáp Shipper (kết nối AI Gemini & dữ liệu hệ thống). Bạn có thể hỏi tôi về:\n• Quy trình giao nhận 2 chiều (4 bước chuẩn)\n• Số dư Ví thu nhập & lịch sử chuyến hoàn thành\n• Tuyến đường, điểm lấy – điểm giao của chuyến đang chạy`,
      timestamp: new Date().toISOString(),
    };
  }
  return {
    id: "welcome-customer",
    sender: "bot",
    text: `Xin chào ${userName || "Quý khách"}! Tôi là Trợ lý Hỏi Đáp Giặt Là Sạch Sẽ (kết nối AI Gemini & dữ liệu thực tế hệ thống). Tôi có thể giúp bạn tra cứu:\n• Bảng giá giặt sấy theo cân, giặt khô, giặt chăn ga, vệ sinh giày\n• Địa chỉ các chi nhánh tiệm giặt tại TP. Hà Nội\n• Trạng thái đơn hàng, quy trình cân đồ & thanh toán VietQR`,
    timestamp: new Date().toISOString(),
  };
};

export const RoleChatbotWidget: React.FC = () => {
  const location = useLocation();

  // Hide on login, admin, or store-owner pages so it specifically serves Customer & Shipper
  const isHiddenRoute =
    location.pathname.includes("/login") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/store-owner");

  const routeRole: ChatRole = location.pathname.startsWith("/mobile-driver")
    ? "driver"
    : "customer";

  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<ChatRole>(routeRole);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [contextStats, setContextStats] = useState<ContextStat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync activeRole automatically when switching between Customer App and Driver App routes
  useEffect(() => {
    setActiveRole(routeRole);
  }, [routeRole]);

  const getActiveUserProfile = useCallback((role: ChatRole) => {
    const scope = role === "driver" ? "driver" : "customer";
    return getScopedProfile(scope);
  }, []);

  // Load conversation history for the active role
  useEffect(() => {
    const profile = getActiveUserProfile(activeRole);
    const displayName =
      profile?.fullName || profile?.name || profile?.username || undefined;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MAP[activeRole]);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}
    setMessages([getInitialGreeting(activeRole, displayName)]);
  }, [activeRole, getActiveUserProfile]);

  // Save conversation history
  const persistMessages = useCallback((role: ChatRole, list: ChatTurn[]) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_MAP[role],
        JSON.stringify(list.slice(-30))
      );
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [messages.length, isOpen, isSending]);

  if (isHiddenRoute) {
    return null;
  }

  const handleResetChat = () => {
    const profile = getActiveUserProfile(activeRole);
    const displayName =
      profile?.fullName || profile?.name || profile?.username || undefined;
    const fresh = [getInitialGreeting(activeRole, displayName)];
    setMessages(fresh);
    setContextStats([]);
    persistMessages(activeRole, fresh);
  };

  const handleSendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isSending) return;

    const userTurn: ChatTurn = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updatedWithUser = [...messages, userTurn];
    setMessages(updatedWithUser);
    persistMessages(activeRole, updatedWithUser);
    setInputText("");
    setIsSending(true);

    try {
      const profile = getActiveUserProfile(activeRole);
      const res = await assistantAPI.chat({
        role: activeRole,
        message: trimmed,
        history: updatedWithUser.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
        userId: profile?.id || profile?._id || "",
        phone: profile?.phone || "",
        userName: profile?.fullName || profile?.name || profile?.username || "",
      });

      const replyText =
        res.data?.data?.reply ||
        "Trợ lý đã ghi nhận câu hỏi của bạn. Vui lòng thử lại sau giây lát.";
      const stats = res.data?.data?.contextSummary?.stats;
      if (Array.isArray(stats) && stats.length > 0) {
        setContextStats(stats);
      }

      const botTurn: ChatTurn = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: replyText,
        timestamp: new Date().toISOString(),
        source: res.data?.data?.source,
      };

      const finalMessages = [...updatedWithUser, botTurn];
      setMessages(finalMessages);
      persistMessages(activeRole, finalMessages);
    } catch {
      const fallbackTurn: ChatTurn = {
        id: "bot-err-" + Date.now(),
        sender: "bot",
        text:
          activeRole === "driver"
            ? "Hiện kết nối mạng đang bận. Quy trình Shipper gồm 4 bước: (1) Bật Radar nhận chuyến trong 1km -> (2) Di chuyển & bật Live GPS -> (3) Bấm Xác nhận Đã Lấy Đồ -> (4) Giao đồ & nhận 100% cước phí vào Ví thu nhập."
            : "Hiện kết nối mạng đang bận. Bảng giá tiêu chuẩn: Giặt sấy theo cân 18.000đ/kg, Giặt khô 65.000đ/món, Giặt chăn ga 85.000đ/bộ, Phí giao nhận 25.000đ/đơn tại toàn bộ chi nhánh Hà Nội.",
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedWithUser, fallbackTurn];
      setMessages(finalMessages);
      persistMessages(activeRole, finalMessages);
    } finally {
      setIsSending(false);
    }
  };

  const renderFormattedBotText = (rawText: string) => {
    const lines = rawText.split("\n").filter((l) => l.trim().length > 0);
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pIdx} className="font-bold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const isDriverMode = activeRole === "driver";
  const quickPrompts = QUICK_PROMPTS_BY_ROLE[activeRole];

  return (
    <>
      {/* FLOATING BUBBLE BUTTON (Bottom-Right Corner of Customer App & Shipper App) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở Trợ lý Chatbot Hỏi Đáp"
          className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[1150] min-h-[52px] px-4 py-3 rounded-full shadow-[0_10px_28px_rgba(15,23,42,0.25)] border text-white flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform duration-150 ${
            isDriverMode
              ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-400/40"
              : "bg-blue-600 hover:bg-blue-700 border-blue-400/40"
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <MessageCircleQuestion className="w-4 h-4 text-white" />
          </div>
          <div className="text-left pr-1">
            <span className="text-xs font-extrabold block leading-none whitespace-nowrap">
              {isDriverMode ? "Trợ lý Shipper" : "Trợ lý Khách hàng"}
            </span>
            <span className="text-[10px] text-white/85 font-medium block leading-tight mt-0.5 whitespace-nowrap">
              Hỏi đáp AI · Bảng giá & Lộ trình
            </span>
          </div>
        </button>
      )}

      {/* CHATBOT DRAWER / MODAL */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1280] bg-slate-900/50 backdrop-blur-xs flex items-end md:items-center justify-center md:justify-end p-0 md:p-6 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full md:w-[430px] max-w-full rounded-t-3xl md:rounded-2xl border border-slate-200 shadow-2xl flex flex-col h-[84vh] md:h-[640px] max-h-[88vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`px-4 py-3.5 text-white flex items-center justify-between gap-2 ${
                isDriverMode ? "bg-emerald-700" : "bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDriverMode
                      ? "bg-emerald-500/30 border border-emerald-400/40"
                      : "bg-blue-500/20 border border-blue-400/30"
                  }`}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {isDriverMode
                      ? "Chatbot Hỗ Trợ Tài Xế (Shipper)"
                      : "Chatbot Hỏi Đáp Khách Hàng"}
                  </h3>
                  <p className="text-[11px] text-white/80 truncate mt-0.5">
                    Gemini AI · Đồng bộ dữ liệu hệ thống thời gian thực
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Làm mới hội thoại"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Đóng cửa sổ"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Segmented Role Switcher Bar (Customer vs Shipper Q&A Mode) */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-600">
                Chế độ hỏi đáp:
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveRole("customer")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeRole === "customer"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Khách hàng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole("driver")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeRole === "driver"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  Shipper
                </button>
              </div>
            </div>

            {/* Live System Context Metrics Strip */}
            {contextStats.length > 0 && (
              <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 grid grid-cols-3 gap-2">
                {contextStats.map((st, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl px-2.5 py-1.5 border border-slate-200/80 text-center"
                  >
                    <span className="text-[10px] text-slate-500 block truncate">
                      {st.label}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 tabular-nums block truncate mt-0.5">
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {isUser
                          ? isDriverMode
                            ? "Shipper"
                            : "Khách hàng"
                          : isDriverMode
                            ? "Trợ lý Điều phối Shipper"
                            : "Trợ lý Giặt Là Sạch Sẽ"}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">
                        {new Date(m.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                        isUser
                          ? isDriverMode
                            ? "bg-emerald-600 text-white rounded-br-xs"
                            : "bg-blue-600 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/90 shadow-2xs rounded-bl-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs sm:text-sm leading-relaxed break-words">
                          {m.text}
                        </p>
                      ) : (
                        renderFormattedBotText(m.text)
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Trợ lý đang tra cứu dữ liệu hệ thống...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 1-Tap Quick Prompts */}
            <div className="px-3.5 py-2.5 bg-white border-t border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                Câu hỏi gợi ý 1 chạm ({isDriverMode ? "Shipper" : "Khách hàng"}):
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSendQuestion(q)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ${
                      isDriverMode
                        ? "bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200"
                        : "bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 border-blue-200"
                    }`}
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuestion(inputText);
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isDriverMode
                    ? "Hỏi về quy trình, ví thu nhập, lộ trình chuyến..."
                    : "Hỏi về bảng giá, chi nhánh Hà Nội, đơn giặt..."
                }
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`min-h-[42px] min-w-[44px] px-3.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45 shrink-0 ${
                  isDriverMode
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
