"use client";
import { useEffect, useState } from "react";

// Define interface for User object
interface User {
  id: string;
  username?: string;
  email?: string;
  role: string;
}

// Define interface for API response
interface UsersApiResponse {
  data?: User[];
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch('/api/admin/users', { 
        headers: token ? { Authorization: `Bearer ${token}` } : undefined, 
        cache: 'no-store' 
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `Server error ${res.status}`);
      }
      const data: User[] | UsersApiResponse = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Lỗi tải danh sách người dùng';
      setError(errorMessage);
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { load(); }, []);

  async function removeUser(id: string) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { 
        method: 'DELETE', 
        headers: token ? { Authorization: `Bearer ${token}` } : undefined 
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      await load();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Không thể xóa';
      alert(errorMessage);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-3">Quản lý người dùng</h1>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="p-3 bg-white border rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium">{u.username || u.email || '-'}</div>
              <div className="text-sm text-gray-500">{u.email || ''} • {u.role}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => removeUser(u.id)} className="border text-sm px-3 py-1 rounded-lg">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
