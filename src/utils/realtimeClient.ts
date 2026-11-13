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
  private listeners: Set<Listener> = new Set();
  private reconnectTimer: number | null = null;

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

  private ensureConnected() {
    if (typeof window === "undefined" || this.eventSource) return;

    try {
      const es = new EventSource("/api/laundry-orders/stream");
      this.eventSource = es;

      es.onmessage = (ev) => {
        try {
          const parsed: RealtimeMessage = JSON.parse(ev.data);
          this.listeners.forEach((cb) => cb(parsed));
        } catch {
          // ignore malformed event
        }
      };

      es.onerror = () => {
        this.close();
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

  private close() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
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
