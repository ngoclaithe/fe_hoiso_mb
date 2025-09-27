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
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

interface LoansApiResponse { data?: LoanData[] }

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
        const res = await fetch("/api/my-loans", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data: LoanData[] | LoansApiResponse = await res.json().catch(() => null);
        const arr = Array.isArray(data) ? data : (data?.data || []);
        if (arr && arr.length > 0) setLatestLoan(arr[0]);
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
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">&lt;</button>
        <div className="font-semibold">Thông tin cá nhân</div>
      </div>

      <div className="p-4">
        {loading && <div className="p-3 bg-white rounded-lg">Đang tải...</div>}
        {!loading && !latestLoan && <div className="p-3 bg-white rounded-lg">Không có hồ sơ</div>}

        {!loading && latestLoan && (
          <div className="grid grid-cols-1 gap-3">
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

          </div>
        )}
      </div>
    </div>
  );
}
