"use client";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { loanStatusLabel } from "@/lib/loan";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return setLoading(false);
        const res = await fetch("/api/my-loans", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          setError(t || `Error ${res.status}`);
          return;
        }
        const data = await res.json();
        setLoans(Array.isArray(data) ? data : data.data || []);
      } catch (e: any) {
        setError(e?.message || 'Lỗi tải dữ liệu');
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => router.push('/home')} className="p-2 rounded-md border">&lt;</button>
        <h1 className="text-lg font-semibold">Lịch sử hồ sơ vay</h1>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && loans.length === 0 && <p>Không có hồ sơ</p>}

      <div className="space-y-3">
        {loans.map((l) => (
          <div key={l.id} className="p-4 bg-blue-50 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Số tiền</div>
                <div className="font-medium text-lg">{l.loanAmount || l.loan_amount || "-"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Trạng thái</div>
                <div className={`font-semibold ${l.status === 'approved' ? 'text-green-600' : l.status === 'rejected' ? 'text-red-600' : l.status === 'pending' ? 'text-yellow-600' : 'text-gray-700'}`}>{loanStatusLabel(l.status)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Kỳ hạn</div>
                <div className="font-medium">{l.loanTermMonths || l.loan_term_months} tháng</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Ngày tạo</div>
                <div className="font-medium">{new Date(l.createdAt || l.created_at || Date.now()).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
