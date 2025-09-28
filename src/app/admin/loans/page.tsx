"use client";
import { useEffect, useState } from "react";
import { loanStatusLabel } from "@/lib/loan";

// Define interface for User object
interface User {
  username?: string;
}

// Define interface for Loan object
interface Loan {
  id: string;
  fullName?: string;
  user?: User;
  loanAmount?: number | string;
  loan_amount?: number | string;
  loanTermMonths?: number;
  loan_term_months?: number;
  status: string;
}

// Define interface for API response
interface LoansApiResponse {
  data?: Loan[];
}

export default function AdminLoansPage() {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/loans", { 
        headers: token ? { Authorization: `Bearer ${token}` } : undefined, 
        cache: "no-store" 
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Server error ${res.status}`);
      }
      const data: Loan[] | LoansApiResponse = await res.json();
      setLoans(Array.isArray(data) ? data : data.data || []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Lỗi tải danh sách";
      setError(errorMessage);
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/loans?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Error ${res.status}`);
      }
      await load();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Không thể cập nhật";
      alert(errorMessage);
    }
  }

  async function approveLoan(id: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/loans/${encodeURIComponent(id)}/approve`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Phê duyệt thất bại"));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  }

  async function completeLoan(id: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/loans/${encodeURIComponent(id)}/complete`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Hoàn tất thất bại"));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
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
              {String(l.status || '').toLowerCase() === 'pending' && (
                <>
                  <button onClick={() => approveLoan(l.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Phê duyệt</button>
                  <button onClick={() => updateStatus(l.id, "rejected")} className="flex-1 border py-2 rounded-lg">Từ chối</button>
                </>
              )}

              {(String(l.status || '').toLowerCase() === 'approved' || String(l.status || '').toLowerCase() === 'active') && (
                <button onClick={() => completeLoan(l.id)} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Tất toán</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
