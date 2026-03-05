"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationService, type Notification } from "@/lib/services/notification.service";
import { toast } from "sonner";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const disconnectSSE = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteracted = useRef(false);

  // Initialize audio and unlock on first click
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/bell.mp3");
      audioRef.current.load();

      const unlockAudio = () => {
        if (audioRef.current && !hasInteracted.current) {
          // Play and immediately pause to "unlock" audio in many browsers
          audioRef.current.play().then(() => {
            audioRef.current?.pause();
            audioRef.current!.currentTime = 0;
            hasInteracted.current = true;
            console.log("Audio unlocked successfully");
          }).catch((err) => {
            console.error("Failed to unlock audio:", err);
          });
        }
        window.removeEventListener("click", unlockAudio);
      };

      window.addEventListener("click", unlockAudio);
      return () => window.removeEventListener("click", unlockAudio);
    }
  }, []);

  const initAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        audioRef.current!.currentTime = 0;
        hasInteracted.current = true;
      }).catch(console.error);
    }
  }, []);

  // Fetch initial notifications and unread count
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications(1, 10, true);
      setNotifications(response.data);
      setUnreadCount(response.meta.unreadCount);
    } catch {
      console.error("Failed to fetch notifications");
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      console.error("Failed to fetch unread count");
    }
  }, []);

  // Setup SSE connection
  useEffect(() => {
    fetchUnreadCount();

      // Connect to SSE
      disconnectSSE.current = notificationService.connectSSE(
        (newNotification) => {
          // Add new notification to the list
          setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
          setUnreadCount((prev) => prev + 1);
          
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((err) => {
              console.warn("Notification sound blocked by browser:", err.message);
            });
          }
          
          // Show toast based on notification type
          if (newNotification.type === "ORDER_REQUEST") {
            toast.info(newNotification.title, {
              description: newNotification.message,
              action: {
                label: "Lihat",
                onClick: () => {
                  window.location.href = "/dashboard/order-requests";
                },
              },
            });
          } else if (newNotification.type === "BOOKING") {
            toast.info(newNotification.title, {
              description: newNotification.message,
              action: {
                label: "Lihat",
                onClick: () => {
                  window.location.href = "/dashboard/booking";
                },
              },
            });
          } else if (newNotification.type === "TRANSACTION") {
            toast.info(newNotification.title, {
              description: newNotification.message,
              action: {
                label: "Lihat",
                onClick: () => {
                  window.location.href = "/transactions";
                },
              },
            });
          }
        },
        () => {
          console.log("Notification SSE connected");
        },
        (error) => {
          console.error("Notification SSE error:", error);
        }
      );

    return () => {
      disconnectSSE.current?.();
    };
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error("Gagal menandai notifikasi");
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch {
      toast.error("Gagal menandai semua notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Recalculate unread count
      const deleted = notifications.find((n) => n.id === id);
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error("Gagal menghapus notifikasi");
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      notificationService.markAsRead(notification.id).catch(console.error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Navigate based on notification type
    if (notification.type === "ORDER_REQUEST" && notification.orderRequestId) {
      window.location.href = "/dashboard/order-requests";
    }

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full"
          onClick={initAudio}
        >
          <Bell className="h-5 w-5 text-[var(--gray-600)]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--status-danger)] text-xs font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="h-auto py-1 text-xs text-[var(--brand-600)]"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tandai Baca Semua
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--gray-500)]">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex cursor-pointer flex-col items-start gap-1 p-3 ${
                  !notification.isRead ? "bg-[var(--brand-50)]" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.isRead ? "font-semibold" : ""}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-[var(--gray-500)] line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-[var(--gray-400)]">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[var(--gray-400)] hover:text-[var(--status-danger)]"
                      onClick={(e) => handleDelete(notification.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center text-center text-sm text-[var(--brand-600)]"
              onClick={async () => {
                try {
                  await notificationService.markAllAsRead();
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
                  );
                  setUnreadCount(0);
                  setIsOpen(false);
                  toast.success("Semua notifikasi ditandai sudah dibaca");
                } catch {
                  toast.error("Gagal menandai semua notifikasi");
                }
              }}
            >
              Tandai Semua Sudah Dibaca
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
