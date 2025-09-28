"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  citizenId?: string;
}

export default function PersonalInfoPage() {
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        setLoading(true);
        const res = await fetch("/api/loans/first-loan", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data: LoanData | null = await res.json().catch(() => null);
        if (data) setLatestLoan(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function genderLabel(g?: string) {
    if (!g) return '-';
    const s = String(g).toLowerCase();
    if (s === 'male' || s === 'm') return 'Nam';
    if (s === 'female' || s === 'f') return 'Nữ';
    return 'Khác';
  }

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 relative">
        <button onClick={() => router.push('/profile')} aria-label="Quay lại" className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-semibold text-center">Thông tin cá nhân</div>
      </div>

      <div className="p-4">
        {loading && <div className="p-3 bg-white rounded-lg">Đang tải...</div>}
        {!loading && !latestLoan && <div className="p-3 bg-white rounded-lg">Không có hồ sơ</div>}

        {!loading && latestLoan && (
          <div className="space-y-4">
            {/* Main profile card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-lg">{(latestLoan.fullName||"-").slice(0,2).toUpperCase()}</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Họ và tên</div>
                  <div className="font-semibold text-lg text-gray-800">{latestLoan.fullName || '-'}</div>
                  <div className="text-sm text-gray-500 mt-1">{latestLoan.occupation || ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Giới tính</div>
                  <div className="font-medium text-gray-800">{genderLabel(latestLoan.gender)}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">Ngày sinh</div>
                  <div className="font-medium text-gray-800">{latestLoan.dateOfBirth ? new Date(latestLoan.dateOfBirth).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Thu nhập</div>
                  <div className="font-medium text-gray-800">{latestLoan.income || '-'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">CCCD</div>
                  <div className="font-medium text-gray-800">{latestLoan.citizenId || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nơi ở hiện nay</div>
                  <div className="font-medium text-gray-800">{latestLoan.currentAddress || '-'}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Quê quán</div>
                  <div className="font-medium text-gray-800">{latestLoan.hometown || '-'}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500">Thông tin liên hệ người thân</div>
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-500">Người liên hệ 1 • {latestLoan.contact1Relationship || '-'}</div>
                    <div className="font-medium text-gray-800">{latestLoan.contact1Phone || '-'}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-500">Người liên hệ 2 • {latestLoan.contact2Relationship || '-'}</div>
                    <div className="font-medium text-gray-800">{latestLoan.contact2Phone || '-'}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
