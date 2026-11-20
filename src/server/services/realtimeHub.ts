import { Request, Response } from "express";
import { normalizeRole } from "../middleware/auth";

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

export interface RealtimeAudience {
  userId?: string;
  phoneNumber?: string;
  storeId?: string;
  shipperId?: string;
  driverId?: string;
}

interface SseClient {
  res: Response;
  userId: string;
  role: string;
  phone: string;
  assignedStoreId: string;
}

const cleanId = (val: unknown): string => String(val ?? "").trim().toLowerCase();

class RealtimeHub {
  private clients: Set<SseClient> = new Set();

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

    const user = req.user || {};
    const client: SseClient = {
      res,
      userId: cleanId(user._id || user.id),
      role: normalizeRole(user.role),
      phone: cleanId(user.phone),
      assignedStoreId: cleanId(user.assignedStoreId),
    };

    this.clients.add(client);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(heartbeat);
        this.clients.delete(client);
      }
    }, 20000);

    req.on("close", () => {
      clearInterval(heartbeat);
      this.clients.delete(client);
    });
  };

  private extractAudience(data: any, explicit?: RealtimeAudience): RealtimeAudience {
    const order = data?.order || data || {};
    return {
      userId: explicit?.userId ?? data?.userId ?? order?.userId,
      phoneNumber: explicit?.phoneNumber ?? data?.phoneNumber ?? order?.phoneNumber,
      storeId: explicit?.storeId ?? data?.storeId ?? order?.storeId,
      shipperId:
        explicit?.shipperId ??
        explicit?.driverId ??
        data?.shipperId ??
        data?.driverId ??
        data?.driverLocation?.driverId ??
        order?.shipperId,
    };
  }

  private canReceive(client: SseClient, audience: RealtimeAudience): boolean {
    if (client.role === "admin") return true;

    const targetUserId = cleanId(audience.userId);
    const targetPhone = cleanId(audience.phoneNumber);
    const targetStoreId = cleanId(audience.storeId);
    const targetShipperId = cleanId(audience.shipperId || audience.driverId);

    if (client.role === "store_owner") {
      if (!client.assignedStoreId || !targetStoreId) return true;
      return client.assignedStoreId === targetStoreId;
    }

    if (client.role === "driver") {
      if (!targetShipperId) return false;
      return (
        (client.userId !== "" && targetShipperId === client.userId) ||
        (client.phone !== "" && targetShipperId === client.phone)
      );
    }

    // Customer ("user"): only receive events for their own orders
    return (
      (client.userId !== "" && targetUserId !== "" && targetUserId === client.userId) ||
      (client.phone !== "" && targetPhone !== "" && targetPhone === client.phone)
    );
  }

  public broadcast(
    type: RealtimeEventType,
    data: any,
    orderId?: string,
    audience?: RealtimeAudience
  ): void {
    const payload: RealtimeEventPayload = {
      type,
      orderId,
      data,
      timestamp: new Date().toISOString(),
    };

    const resolvedAudience = this.extractAudience(data, audience);
    const serialized = `data: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.clients) {
      if (!this.canReceive(client, resolvedAudience)) continue;
      try {
        client.res.write(serialized);
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
