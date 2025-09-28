"use client";
import { useEffect, useMemo, useState } from "react";
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
  items?: Loan[];
  total?: number;
  totalItems?: number;
  pagination?: { total?: number; page?: number; pageSize?: number };
  meta?: { total?: number };
}

export default function AdminLoansPage() {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const totalPages = useMemo(() => total && total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : null, [total, pageSize]);

  async function load(targetPage = page, targetPageSize = pageSize) {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const qs = new URLSearchParams({
        page: String(targetPage),
        pageSize: String(targetPageSize),
        limit: String(targetPageSize),
      }).toString();
      const res = await fetch(`/api/admin/loans?${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Server error ${res.status}`);
      }
      const body: LoansApiResponse | Loan[] = await res.json();
      const items = Array.isArray(body) ? body : (body.data || body.items || []);
      setLoans(items);

      // Try to extract total count from common places
      const t = Array.isArray(body) ? undefined : (
        body.total ?? body.totalItems ?? body.pagination?.total ?? body.meta?.total
      );
      setTotal(typeof t === "number" ? t : null);
      if (typeof t === "number") {
        const pages = Math.max(1, Math.ceil(t / targetPageSize));
        setHasMore(targetPage < pages);
      } else {
        setHasMore(items.length >= targetPageSize);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Lỗi tải danh sách";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, pageSize); }, [page, pageSize]);

  async function updateStatus(id: string, status: string) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/loans?id=${encodeURIComponent(id)}` , {
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
      await load(page, pageSize);
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
      await load(page, pageSize);
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
      await load(page, pageSize);
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

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between" aria-label="Phân trang hồ sơ vay">
        <div className="text-sm text-gray-600">
          Trang {page}{totalPages ? ` / ${totalPages}` : ""}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">/trang</label>
          <select
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
            className="border rounded-md px-2 py-1 text-sm bg-white"
            aria-label="Số dòng mỗi trang"
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            aria-label="Trang trước"
          >
            Trước
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(totalPages ? page >= totalPages : !hasMore) || loading}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            aria-label="Trang sau"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
