"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RawNotification = Record<string, unknown>;
interface NotificationItem {
  id: string;
  text: string;
  read: boolean;
  time?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  function normalize(n: RawNotification): NotificationItem | null {
    const id = String(n.id || n._id || "");
    if (!id) return null;
    const text = n.title || n.message || n.content || n.text || "Thông báo";
    const read = Boolean(n.read ?? n.is_read ?? n.isRead ?? false);
    const time = n.createdAt || n.created_at || n.time || undefined;
    return { id, text, read, time };
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/notifications", { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error(await res.text().catch(() => `Lỗi ${res.status}`));
      const data = await res.json().catch(() => []);
      const arr: RawNotification[] = Array.isArray(data) ? data : (data?.data || []);
      const mapped = arr.map(normalize).filter(Boolean) as NotificationItem[];
      setItems(mapped);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi tải thông báo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/notifications/mark-all-read", { method: "PATCH", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error(await res.text().catch(() => "Không thể đánh dấu tất cả đã đọc"));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  }

  async function markRead(id: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error(await res.text().catch(() => "Không thể đánh dấu đã đọc"));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  }

  async function remove(id: string) {
    if (!confirm("Xóa thông báo này?")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error(await res.text().catch(() => "Không thể xóa"));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  }

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/home')} className="text-white">&lt;</button>
        <div className="font-semibold">Thông báo</div>
        <button onClick={markAllRead} className="px-2 py-1 rounded bg-white/10 text-white text-xs">Đánh dấu tất cả</button>
      </div>

      <div className="p-4">
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <div className="space-y-3">
          {loading && <p>Đang tải...</p>}
          {!loading && items.length === 0 && <p>Không có thông báo</p>}
          {!loading && items.map((n) => (
            <div key={n.id} className="p-3 bg-white rounded-lg shadow flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>i</div>
              <div className="flex-1">
                <div className="text-sm text-gray-700">{n.text}</div>
                <div className="text-xs text-gray-400 mt-1">{n.time ? new Date(n.time).toLocaleString() : 'Vừa mới'}</div>
              </div>
              <div className="flex items-center gap-2">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">Đã đọc</button>
                )}
                <button onClick={() => remove(n.id)} className="text-xs px-2 py-1 bg-gray-100 rounded">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
