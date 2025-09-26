"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Define interface for user profile
interface UserProfile {
  username: string;
  role: string;
  email?: string;
}

export default function Header() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch("/api/auth/profile", { cache: "no-store", headers });
        if (!res.ok) {
          if (mounted) setProfile(null);
          return;
        }
        const data: UserProfile = await res.json();
        if (mounted) setProfile(data);
      } catch {
        // Remove unused 'err' parameter and handle error silently
        if (mounted) setProfile(null);
      }
    }

    fetchProfile();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') fetchProfile();
    };
    const onFocus = () => fetchProfile();
    const onAuthChanged = () => fetchProfile();

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    window.addEventListener('auth:changed', onAuthChanged);

    return () => { 
      mounted = false; 
      window.removeEventListener('storage', onStorage); 
      window.removeEventListener('focus', onFocus); 
      window.removeEventListener('auth:changed', onAuthChanged); 
    };
  }, []);

  const initials = profile?.username ? profile.username.slice(0,2).toUpperCase() : "U";

  // Hide global header on specific pages where pages render their own minimal header
  const hideOn = ["/notifications", "/profile", "/history"];
  if (hideOn.includes(pathname || "")) return null;

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/home" className="inline-flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-blue-600 rounded-full flex items-center justify-center font-semibold">MB</div>
            <div className="text-lg font-semibold">Hội sở MB</div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <>
              <Link href="/notifications" className="p-2 rounded-md hover:bg-blue-500/20" aria-label="Thông báo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>

              {profile?.role === 'admin' && (
                <Link href="/admin/dashboard" className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-sm">Admin</Link>
              )}

              <div className="relative">
                <Link href="/profile" className="inline-flex items-center gap-2 p-1 rounded-md hover:bg-blue-500/20">
                  <div className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium">{initials}</div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}