const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export interface Notification {
  id: string;
  type: "ORDER_REQUEST" | "BOOKING" | "TRANSACTION" | "SYSTEM";
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  orderRequestId?: string;
}

export interface NotificationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationResponse {
  data: Notification[];
  meta: NotificationMeta;
}

class NotificationService {
  private getToken(): string | undefined {
    if (typeof document === "undefined") return undefined;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
  }

  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<NotificationResponse> {
    const token = this.getToken();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (unreadOnly) params.append("unread", "true");

    const res = await fetch(`${API_BASE}/notifications?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch notifications");
    const json = await res.json();
    return json.data;
  }

  async getUnreadCount(): Promise<number> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch unread count");
    const json = await res.json();
    return json.data.count;
  }

  async markAsRead(id: string): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to mark notification as read");
  }

  async markAllAsRead(): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to mark all notifications as read");
  }

  async deleteNotification(id: string): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete notification");
  }

  // SSE Connection with auto-reconnect
  connectSSE(
    onMessage: (notification: Notification) => void,
    onConnect?: () => void,
    onError?: (error: Event) => void
  ): () => void {
    const token = this.getToken();
    if (!token) {
      console.error("No token available for SSE connection");
      return () => {};
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isClosed = false;

    const connect = () => {
      if (isClosed) return;

      eventSource = new EventSource(
        `${API_BASE}/notifications/sse?token=${token}`
      );

      eventSource.onopen = () => {
        console.log("SSE connection established");
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          // Skip heartbeat comments
          if (!event.data || event.data === "") return;
          
          const data = JSON.parse(event.data);
          if (data.type === "notification" && data.data) {
            onMessage(data.data);
          }
        } catch (err) {
          // Ignore parse errors for non-JSON messages
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error, will reconnect...", error);
        onError?.(error);
        
        // Close current connection
        eventSource?.close();
        
        // Reconnect after 5 seconds
        if (!isClosed && !reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connect();
          }, 5000);
        }
      };
    };

    // Initial connection
    connect();

    // Return cleanup function
    return () => {
      isClosed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
    };
  }
}

export const notificationService = new NotificationService();
