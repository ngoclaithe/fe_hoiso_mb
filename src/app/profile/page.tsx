"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await fetch("/api/auth/profile", { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data);
      } catch {}
    })();
  }, []);

  const initials = profile?.username ? profile.username.slice(0,2).toUpperCase() : "U";

import { useRouter } from "next/navigation";

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => { const r = useRouter(); r.push('/home'); }} className="text-white">&lt;</button>
        <div className="font-semibold">Hồ sơ cá nhân</div>
      </div>

      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center text-2xl font-semibold">{initials}</div>
            <div>
              <div className="text-sm text-gray-500">Tên đăng nhập</div>
              <div className="font-medium text-lg">{profile?.username || "-"}</div>
              <div className="text-sm text-gray-500 mt-2">Email</div>
              <div className="font-medium">{profile?.email || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {profile?.role !== 'admin' && (
              <Link href="/history" className="block text-center bg-blue-600 text-white py-2 rounded-lg">Lịch sử hồ sơ vay</Link>
            )}
            <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="w-full border py-2 rounded-lg">Đăng xuất</button>
          </div>
        </div>
      </div>
    </div>
  );
}
