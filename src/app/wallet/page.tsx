"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LoanData {
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

interface LoansApiResponse { data?: LoanData[] }

export default function WalletPage() {
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

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">&lt;</button>
        <div className="font-semibold">Ví tiền</div>
      </div>

      <div className="p-4">
        {loading && <div className="p-3 bg-white rounded-lg">Đang tải...</div>}
        {!loading && !latestLoan && <div className="p-3 bg-white rounded-lg">Không có dữ liệu</div>}

        {!loading && latestLoan && (
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
        )}
      </div>
    </div>
  );
}
