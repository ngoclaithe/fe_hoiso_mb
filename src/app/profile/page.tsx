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

// Define interface for loan data
interface LoanData {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  income?: string;
  hometown?: string;
  currentAddress?: string;
  contact1Phone?: string;
  contact1Relationship?: string;
  contact2Phone?: string;
  contact2Relationship?: string;
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

// Define interface for loans API response
interface LoansApiResponse {
  data?: LoanData[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loadingLoan, setLoadingLoan] = useState(false);
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

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        setLoadingLoan(true);
        const res = await fetch("/api/my-loans", { 
          cache: "no-store", 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (!res.ok) return;
        const data: LoanData[] | LoansApiResponse = await res.json().catch(() => null);
        // Accept either array or { data: [...] }
        const arr = Array.isArray(data) ? data : (data?.data || []);
        if (arr && arr.length > 0) {
          setLatestLoan(arr[0]);
        }
      } catch {
        // Handle error silently - removed unused parameter
      } finally { 
        setLoadingLoan(false); 
      }
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

  // Removed unused 'initials' variable

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
          <div className="mt-3">
            {profile?.role !== 'admin' && (
              <Link href="/history" className="inline-block text-center bg-blue-600 text-white py-2 px-3 rounded-lg">Lịch sử hồ sơ vay</Link>
            )}
          </div>
        </div>

        {/* Latest loan personal info styled */}
        <div className="mt-4">
          {loadingLoan && <div className="p-3 bg-white rounded-lg">Đang tải...</div>}
          {!loadingLoan && !latestLoan && <div className="p-3 bg-white rounded-lg">Không có hồ sơ</div>}

          {!loadingLoan && latestLoan && (
            <div className="grid grid-cols-1 gap-3">
              {/* Personal info card */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-300 rounded-lg shadow-sm">
                <div>
                  <div className="text-sm text-gray-500">Họ và tên</div>
                  <div className="font-medium text-lg">{latestLoan.fullName || '-'}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Ngày sinh: <span className="font-medium text-gray-800">{latestLoan.dateOfBirth ? new Date(latestLoan.dateOfBirth).toLocaleDateString() : '-'}</span></div>
                    <div>Giới tính: <span className="font-medium text-gray-800">{genderLabel(latestLoan.gender)}</span></div>
                    <div className="col-span-2">Nghề nghiệp: <span className="font-medium text-gray-800">{latestLoan.occupation || '-'}</span></div>
                    <div>Thu nhập: <span className="font-medium text-gray-800">{latestLoan.income || '-'}</span></div>
                    <div>Quê quán: <span className="font-medium text-gray-800">{latestLoan.hometown || '-'}</span></div>
                    <div className="col-span-2">Nơi ở hiện nay: <span className="font-medium text-gray-800">{latestLoan.currentAddress || '-'}</span></div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>Liên hệ 1: <div className="font-medium">{latestLoan.contact1Phone || '-'}</div></div>
                  <div>Quan hệ 1: <div className="font-medium">{latestLoan.contact1Relationship || '-'}</div></div>
                  <div>Liên hệ 2: <div className="font-medium">{latestLoan.contact2Phone || '-'}</div></div>
                  <div>Quan hệ 2: <div className="font-medium">{latestLoan.contact2Relationship || '-'}</div></div>
                </div>
              </div>

              {/* Bank info card separate */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="text-sm text-indigo-700">Ngân hàng thụ hưởng</div>
                <div className="mt-2 grid grid-cols-1 gap-2 text-gray-800">
                  <div className="font-medium">{latestLoan.bankName || '-'}</div>
                  <div className="text-sm text-gray-500">Số tài khoản</div>
                  <div className="font-medium">{latestLoan.bankAccountNumber || '-'}</div>
                  <div className="text-sm text-gray-500">Tên thụ hưởng</div>
                  <div className="font-medium">{latestLoan.accountHolderName || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}