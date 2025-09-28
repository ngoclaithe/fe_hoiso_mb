"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define interface for user profile
interface UserProfile {
  username: string;
  email: string;
  phone?: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await fetch("/api/auth/profile", { 
          cache: "no-store", 
          headers: token ? { Authorization: `Bearer ${token}` } : undefined 
        });
        if (!res.ok) return;
        const data: UserProfile = await res.json();
        setProfile(data);
      } catch {}
    })();
  }, []);

  function logout() {
    try { localStorage.removeItem("token"); } catch {}
    router.push('/login');
  }

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* <button onClick={() => router.push('/home')} className="text-white">&lt;</button> */}
          <div className="font-semibold">Hồ sơ cá nhân</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={logout} className="text-white border border-white/20 px-3 py-1 rounded-md">Đăng xuất</button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Tài khoản</div>
              <div className="font-semibold text-xl">{profile?.username || "-"}</div>
              <div className="text-sm text-gray-500 mt-1">Email</div>
              <div className="font-medium">{profile?.email || "-"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Số điện thoại</div>
              <div className="font-medium">{profile?.phone || "-"}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          {profile?.role !== 'admin' && (
            <Link href="/history" className="action-btn flex items-center gap-3 w-58 justify-center bg-white text-blue-600 py-3 px-4 rounded-lg border border-blue-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 8v5h5a1 1 0 0 1 0 2h-6a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0Z" />
                <path d="M21 12a9 9 0 1 1-3-6.708l1.307-1.307a1 1 0 1 1 1.414 1.414l-1.307 1.307A8.962 8.962 0 0 1 21 12Z" />
              </svg>
              <span className="font-medium">Lịch sử hồ sơ vay</span>
            </Link>
          )}

          <Link href="/profile/personal" className="action-btn flex items-center gap-3 w-58 justify-center bg-white text-blue-600 py-3 px-4 rounded-lg border border-blue-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" />
            </svg>
            <span className="font-medium">Thông tin cá nhân</span>
          </Link>

          <Link href="/contact" className="action-btn flex items-center gap-3 w-58 justify-center bg-white text-blue-600 py-3 px-4 rounded-lg border border-blue-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M21 15.46V20a1 1 0 0 1-1.14 1 19.86 19.86 0 0 1-8.63-3.07 19.38 19.38 0 0 1-6-6A19.86 19.86 0 0 1 1 4.14 1 1 0 0 1 2 3h4.54a1 1 0 0 1 1 .76 12.66 12.66 0 0 0 .7 2.21 1 1 0 0 1-.23 1.11L7.38 8.71a16 16 0 0 0 6 6l1.63-1.63a1 1 0 0 1 1.11-.23 12.66 12.66 0 0 0 2.21.7 1 1 0 0 1 .76 1.01Z" />
            </svg>
            <span className="font-medium">Liên hệ tư vấn - hỗ trợ</span>
          </Link>

          <div className="mt-6 flex flex-col items-center gap-2">
            <img src="/images/dathongbao.png" alt="đã thông báo" className="w-36 h-auto" />
            <div className="text-xs text-gray-500">Bản quyền thuộc về MB Bank</div>
          </div>
        </div>
      </div>
    </div>
  );
}
