import { useEffect } from "react";

export type RealtimeEventType =
  | "DRIVER_GPS_UPDATED"
  | "ORDER_CHAT_MESSAGE"
  | "ORDER_PAYMENT_RECONCILED"
  | "ORDER_UPDATED"
  | "CONNECTED";

export interface RealtimeMessage {
  type: RealtimeEventType;
  orderId?: string;
  data?: any;
  timestamp: string;
}

type Listener = (msg: RealtimeMessage) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectTimer: number | null = null;
  private processedEventKeys: Set<string> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.ensureConnected();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.close();
      }
    };
  }

  private getDedupeKey(msg: RealtimeMessage): string | null {
    if (msg.type === "ORDER_CHAT_MESSAGE" && msg.data?.message?.id) {
      return `CHAT_${msg.data.message.id}`;
    }
    if (msg.type === "ORDER_PAYMENT_RECONCILED" && msg.data?.paymentTransactionId) {
      return `PAY_${msg.data.paymentTransactionId}`;
    }
    return null;
  }

  private dispatchToListeners(msg: RealtimeMessage) {
    const key = this.getDedupeKey(msg);
    if (key) {
      if (this.processedEventKeys.has(key)) {
        return;
      }
      this.processedEventKeys.add(key);
      if (this.processedEventKeys.size > 200) {
        const firstKey = this.processedEventKeys.values().next().value;
        if (firstKey) this.processedEventKeys.delete(firstKey);
      }
    }
    this.listeners.forEach((cb) => cb(msg));
  }

  public publishCrossTab(msg: RealtimeMessage) {
    this.dispatchToListeners(msg);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch {
        // ignore BroadcastChannel error
      }
    }
  }

  private ensureConnected() {
    if (typeof window === "undefined") return;

    if (!this.broadcastChannel && typeof BroadcastChannel !== "undefined") {
      try {
        this.broadcastChannel = new BroadcastChannel("sachse_realtime_bus");
        this.broadcastChannel.onmessage = (ev) => {
          if (ev?.data && ev.data.type) {
            this.dispatchToListeners(ev.data as RealtimeMessage);
          }
        };
      } catch {
        // ignore if BroadcastChannel is unsupported
      }
    }

    if (this.eventSource) return;

    try {
      const es = new EventSource("/api/laundry-orders/stream");
      this.eventSource = es;

      es.onmessage = (ev) => {
        try {
          const parsed: RealtimeMessage = JSON.parse(ev.data);
          this.dispatchToListeners(parsed);
          if (this.broadcastChannel && parsed.type !== "CONNECTED") {
            try {
              this.broadcastChannel.postMessage(parsed);
            } catch {}
          }
        } catch {
          // ignore malformed event
        }
      };

      es.onerror = () => {
        this.closeEventSource();
        if (this.listeners.size > 0 && !this.reconnectTimer) {
          this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            this.ensureConnected();
          }, 3000);
        }
      };
    } catch {
      // Fallback if EventSource fails
    }
  }

  private closeEventSource() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }
  }

  private close() {
    this.closeEventSource();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
      this.broadcastChannel = null;
    }
  }
}

export const realtimeClient = new RealtimeClient();

export const useRealtimeOrders = (
  onEvent: (event: RealtimeMessage) => void,
  filterOrderId?: string
) => {
  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe((msg) => {
      if (filterOrderId && msg.orderId && msg.orderId !== filterOrderId) {
        return;
      }
      onEvent(msg);
    });
    return unsubscribe;
  }, [onEvent, filterOrderId]);
};
