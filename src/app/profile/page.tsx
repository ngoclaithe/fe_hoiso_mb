"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [latestLoan, setLatestLoan] = useState<any | null>(null);
  const [loadingLoan, setLoadingLoan] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        setLoadingLoan(true);
        const res = await fetch("/api/my-loans", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        // Accept either array or { data: [...] }
        const arr = Array.isArray(data) ? data : (data?.data || []);
        if (arr && arr.length > 0) {
          setLatestLoan(arr[0]);
        }
      } catch (e) {
        // ignore
      } finally { setLoadingLoan(false); }
    })();
  }, []);

  function logout() {
    try { localStorage.removeItem("token"); } catch {}
    router.push('/login');
  }

  function genderLabel(g?: string) {
    if (!g) return '-';
    const s = String(g).toLowerCase();
    if (s === 'male' || s === 'm') return 'Nam';
    if (s === 'female' || s === 'f') return 'Nữ';
    return 'Khác';
  }

  const initials = profile?.username ? profile.username.slice(0,2).toUpperCase() : "U";

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="text-white">&lt;</button>
          <div className="font-semibold">Hồ sơ cá nhân</div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={logout} className="text-white border border-white/20 px-3 py-1 rounded-md">Đăng xuất</button>
        </div>
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

          <div className="mt-4">
            {profile?.role !== 'admin' && (
              <Link href="/history" className="inline-block text-center bg-blue-600 text-white py-2 px-3 rounded-lg">Lịch sử hồ sơ vay</Link>
            )}
          </div>
        </div>

        {/* Latest loan personal info */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Thông tin hồ sơ gần nhất</h2>
          {loadingLoan && <div className="p-3 bg-white rounded-lg">Đang tải...</div>}
          {!loadingLoan && !latestLoan && <div className="p-3 bg-white rounded-lg">Không có hồ sơ</div>}
          {!loadingLoan && latestLoan && (
            <div className="p-4 bg-blue-50 rounded-lg shadow">
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                <div><span className="text-gray-500">Họ và tên: </span><span className="font-medium">{latestLoan.fullName || '-'}</span></div>
                <div><span className="text-gray-500">Ngày sinh: </span><span className="font-medium">{latestLoan.dateOfBirth ? new Date(latestLoan.dateOfBirth).toLocaleDateString() : '-'}</span></div>
                <div><span className="text-gray-500">Giới tính: </span><span className="font-medium">{genderLabel(latestLoan.gender)}</span></div>
                <div><span className="text-gray-500">Nơi ở hiện nay: </span><span className="font-medium">{latestLoan.currentAddress || '-'}</span></div>
                <div><span className="text-gray-500">Địa chỉ thường trú: </span><span className="font-medium">{latestLoan.permanentAddress || '-'}</span></div>
                <div><span className="text-gray-500">Quê quán: </span><span className="font-medium">{latestLoan.hometown || '-'}</span></div>
                <div><span className="text-gray-500">Nghề nghiệp: </span><span className="font-medium">{latestLoan.occupation || '-'}</span></div>
                <div><span className="text-gray-500">Thu nhập: </span><span className="font-medium">{latestLoan.income || '-'}</span></div>
                <div><span className="text-gray-500">Số điện thoại liên hệ 1: </span><span className="font-medium">{latestLoan.contact1Phone || '-'}</span></div>
                <div><span className="text-gray-500">Quan hệ 1: </span><span className="font-medium">{latestLoan.contact1Relationship || '-'}</span></div>
                <div><span className="text-gray-500">Số điện thoại liên hệ 2: </span><span className="font-medium">{latestLoan.contact2Phone || '-'}</span></div>
                <div><span className="text-gray-500">Quan hệ 2: </span><span className="font-medium">{latestLoan.contact2Relationship || '-'}</span></div>
                <div><span className="text-gray-500">Ngân hàng thụ hưởng: </span><span className="font-medium">{latestLoan.bankName || '-'}</span></div>
                <div><span className="text-gray-500">Số tài khoản: </span><span className="font-medium">{latestLoan.bankAccountNumber || '-'}</span></div>
                <div><span className="text-gray-500">Tên thụ hưởng: </span><span className="font-medium">{latestLoan.accountHolderName || '-'}</span></div>
                <div><span className="text-gray-500">Mục đích vay: </span><span className="font-medium">{latestLoan.loanPurpose || '-'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
