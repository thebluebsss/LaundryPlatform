import { Request, Response } from "express";

export type RealtimeEventType =
  | "DRIVER_GPS_UPDATED"
  | "ORDER_CHAT_MESSAGE"
  | "ORDER_PAYMENT_RECONCILED"
  | "ORDER_UPDATED";

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  orderId?: string;
  data: any;
  timestamp: string;
}

class RealtimeHub {
  private clients: Set<Response> = new Set();

  public subscribe = (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    // Send initial connection ack
    res.write(
      `data: ${JSON.stringify({
        type: "CONNECTED",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    this.clients.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(heartbeat);
        this.clients.delete(res);
      }
    }, 20000);

    req.on("close", () => {
      clearInterval(heartbeat);
      this.clients.delete(res);
    });
  };

  public broadcast(
    type: RealtimeEventType,
    data: any,
    orderId?: string
  ): void {
    const payload: RealtimeEventPayload = {
      type,
      orderId,
      data,
      timestamp: new Date().toISOString(),
    };

    const serialized = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(serialized);
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
