"use client";
import { useEffect, useState } from "react";

export default function AdminLoansPage() {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/loans", { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: "no-store" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Server error ${res.status}`);
      }
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : data.data || []);
    } catch (e: any) {
      setError(e?.message || "Lỗi tải danh sách");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/loans?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Error ${res.status}`);
      }
      await load();
    } catch (e: any) {
      alert(e?.message || "Không thể cập nhật");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-3">Quản lý hồ sơ vay (Admin)</h1>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-3">
        {loans.map((l) => (
          <div key={l.id} className="p-3 bg-blue-50 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Người vay</div>
                <div className="font-medium">{l.fullName || l.user?.username || "-"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Số tiền</div>
                <div className="font-medium">{l.loanAmount || l.loan_amount}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Kỳ hạn</div>
                <div className="font-medium">{l.loanTermMonths || l.loan_term_months} tháng</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Trạng thái</div>
                <div className="font-medium">{loanStatusLabel(l.status)}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => updateStatus(l.id, "approved")} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Phê duyệt</button>
              <button onClick={() => updateStatus(l.id, "rejected")} className="flex-1 border py-2 rounded-lg">Từ chối</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
