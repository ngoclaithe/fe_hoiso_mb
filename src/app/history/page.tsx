"use client";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return setLoading(false);
        const res = await fetch("/api/my-loans", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!res.ok) return setLoading(false);
        const data = await res.json();
        setLoans(Array.isArray(data) ? data : data.data || []);
      } catch (e) {
        // ignore
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-3">Lịch sử hồ sơ vay</h1>
      {loading && <p>Đang tải...</p>}
      {!loading && loans.length === 0 && <p>Không có hồ sơ</p>}
      <div className="space-y-3">
        {loans.map((l) => (
          <div key={l.id} className="p-3 bg-white border rounded-lg">
            <div className="text-sm text-gray-600">Số tiền</div>
            <div className="font-medium">{l.loanAmount || l.loan_amount || "-"}</div>
            <div className="text-sm text-gray-600 mt-2">Kỳ hạn</div>
            <div className="font-medium">{l.loanTermMonths || l.loan_term_months} tháng</div>
            <div className="text-sm text-gray-600 mt-2">Trạng thái</div>
            <div className="font-medium">{l.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
