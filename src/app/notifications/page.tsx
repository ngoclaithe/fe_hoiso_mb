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
      <div className="space-y-3">
        {loading && <p>Đang tải...</p>}
        {!loading && items.length === 0 && <p>Không có thông báo</p>}
        {!loading && items.map((t, i) => (
          <div key={i} className="p-3 bg-white rounded-lg shadow flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">i</div>
            <div>
              <div className="text-sm text-gray-700">{t}</div>
              <div className="text-xs text-gray-400 mt-1">Vừa mới</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
