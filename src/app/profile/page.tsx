"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data);
      } catch {}
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-3">Hồ sơ cá nhân</h1>
      <div className="bg-white p-4 rounded-lg border mb-3">
        <div className="text-sm text-gray-600">Tên đăng nhập</div>
        <div className="font-medium">{profile?.username || "-"}</div>
        <div className="text-sm text-gray-600 mt-2">Email</div>
        <div className="font-medium">{profile?.email || "-"}</div>
      </div>

      <div className="space-y-2">
        <Link href="/history" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg">Lịch sử hồ sơ vay</Link>
        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="w-full border py-2 rounded-lg">Đăng xuất</button>
      </div>
    </div>
  );
}
