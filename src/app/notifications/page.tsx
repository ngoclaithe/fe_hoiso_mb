"use client";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    // Placeholder - no backend for notifications in current API
    setTimeout(() => {
      setItems(["Bạn có 1 hồ sơ đang chờ duyệt", "Hệ thống bảo trì vào 00:00"]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-3">Thông báo</h1>
      {loading && <p>Đang tải...</p>}
      {!loading && items.length === 0 && <p>Không có thông báo</p>}
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="p-3 border rounded-lg bg-white">{t}</li>
        ))}
      </ul>
    </div>
  );
}
