"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          if (mounted) setProfile(null);
          return;
        }
        // Fetch profile via BFF; rely on cookie or forwarded Authorization header
        const res = await fetch("/api/auth/profile", { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) {
          if (mounted) setProfile(null);
          return;
        }
        const data = await res.json();
        if (mounted) setProfile(data);
      } catch (err) {
        if (mounted) setProfile(null);
      }
    }

    fetchProfile();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') fetchProfile();
    };
    const onFocus = () => fetchProfile();

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);

    return () => { mounted = false; window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus); };
  }, []);

  const initials = profile?.username ? profile.username.slice(0,2).toUpperCase() : "U";

  return (
    <header className="bg-white/95 backdrop-blur sticky top-0 z-40 border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">MB</div>
          <div className="text-lg font-semibold">Hệ thống vay vốn</div>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <>
              <Link href="/notifications" className="p-2 rounded-md hover:bg-gray-100" aria-label="Thông báo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>

              {profile?.role === 'admin' && (
                <Link href="/admin/dashboard" className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-sm">Admin</Link>
              )}

              <div className="relative">
                <Link href="/profile" className="inline-flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center font-medium">{initials}</div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
