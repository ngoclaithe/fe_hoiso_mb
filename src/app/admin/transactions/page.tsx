"use client";
import React, { useEffect, useState } from "react";

interface RawTx { [k: string]: any }
interface TxItem {
  id: string;
  amount?: number | string;
  status?: string;
  type?: string;
  user?: string;
  time?: string;
  description?: string;
  balanceBefore?: number | string;
  balanceAfter?: number | string;
}

function detectAmount(t: RawTx): number | string | undefined {
  return t.amount ?? t.value ?? t.tx_amount ?? t.transaction_amount;
}

function detectType(t: RawTx): string | undefined {
  return (t.type || t.txn_type || t.transaction_type || t.kind) as string | undefined;
}

function detectStatus(t: RawTx): string | undefined {
  return (t.status || t.state || t.tx_status) as string | undefined;
}

function detectId(t: RawTx): string {
  if (typeof t.id === 'string') return t.id;
  if (typeof t._id === 'string') return t._id;
  return String(t.id ?? t._id ?? '');
}

function detectTime(t: RawTx): string | undefined {
  return (t.createdAt || t.created_at || t.time || t.date) as string | undefined;
}

function detectUser(t: RawTx): string | undefined {
  if (t.wallet?.userId) return t.wallet.userId;
  return (t.user?.username || t.user?.name || t.user) as string | undefined;
}

export default function AdminTransactionsPage() {
  const [items, setItems] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [itemLoading, setItemLoading] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/transactions/history?limit=${limit}&offset=${offset}`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => `Lỗi ${res.status}`));
      const data = await res.json().catch(() => []);

      // extract transactions array and pagination
      let txArr: RawTx[] = [];
      let pagination: any = null;

      if (Array.isArray(data)) txArr = data;
      else if (Array.isArray(data.transactions)) txArr = data.transactions;
      else if (data && Array.isArray(data.data)) txArr = data.data;
      else if (data && data.data && Array.isArray(data.data.transactions)) txArr = data.data.transactions;
      else if (data && data.transactions && Array.isArray(data.transactions)) txArr = data.transactions;

      // try to read pagination info
      if (data && data.pagination) pagination = data.pagination;
      if (data && data.data && data.data.pagination) pagination = data.data.pagination;
      if (data && data.data && data.data.transactions && data.data.pagination) pagination = data.data.pagination;

      const mapped = txArr.map((t) => ({
        id: detectId(t),
        amount: detectAmount(t),
        status: (detectStatus(t) || '').toString(),
        type: (detectType(t) || '').toString(),
        user: detectUser(t),
        time: detectTime(t),
        description: t.description,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
      }));

      // filter to only withdrawals
      const filtered = mapped.filter(m => {
        const typ = (m.type || '').toLowerCase();
        const isWithdraw = typ.includes('withdraw') || typ.includes('rút') || typ.includes('withdrawal');
        return isWithdraw;
      });

      // update pagination state
      if (pagination && typeof pagination.total === 'number') {
        setTotal(pagination.total);
        setHasMore(Boolean(pagination.hasMore || (pagination.offset + pagination.limit < pagination.total)));
      } else {
        // fallback: infer total from response
        setTotal(filtered.length + offset);
        setHasMore(filtered.length === limit);
      }

      setItems(filtered);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [limit, offset]);

  function prev() { if (offset - limit >= 0) setOffset(offset - limit); }
  function next() { if (!total || offset + limit < (total || 0)) setOffset(offset + limit); }

  function formatVND(v?: number | string) {
    const n = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.replace(/\s|,/g, '')) : NaN);
    if (!Number.isFinite(n)) return String(v ?? "—");
    return n.toLocaleString('vi-VN') + ' ₫';
  }

  function formatTime(time?: string) {
    if (!time) return 'Vừa mới';
    const date = new Date(time);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status?: string) {
    const st = (status || '').toLowerCase();
    if (st.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (st.includes('approved') || st.includes('success')) return 'bg-green-100 text-green-800';
    if (st.includes('rejected') || st.includes('failed')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  function getStatusText(status?: string) {
    const st = (status || '').toLowerCase();
    if (st.includes('pending')) return 'Chờ duyệt';
    if (st.includes('approved') || st.includes('success')) return 'Đã duyệt';
    if (st.includes('rejected') || st.includes('failed')) return 'Từ chối';
    return status || 'Không xác định';
  }

  async function approve(id: string) {
    if (!confirm('Phê duyệt lệnh rút tiền này?')) return;
    setItemLoading(prev => ({ ...prev, [id]: true }));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/v1/transactions/admin/withdraw/${encodeURIComponent(id)}/approve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Phê duyệt thất bại'));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setItemLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  async function rejectTx(id: string) {
    if (!confirm('Từ chối lệnh rút tiền này?')) return;
    setItemLoading(prev => ({ ...prev, [id]: true }));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/v1/transactions/admin/withdraw/${encodeURIComponent(id)}/reject`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Từ chối thất bại'));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setItemLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý giải ngân</h1>
        <p className="text-gray-600">Xem tất cả giao dịch rút tiền và xử lý yêu cầu</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="text-red-600 font-medium">Lỗi: {error}</div>
          </div>
        </div>
      )}

      {!loading && items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Không có giao dịch rút tiền</div>
          <button onClick={load} className="text-blue-600 hover:text-blue-700 font-medium">
            Tải lại
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin yêu cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.description || 'Rút tiền tài khoản'}
                        </div>
                        {item.user && (
                          <div className="text-sm text-gray-500">
                            User ID: {item.user.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatVND(item.amount)}
                      </div>
                      {item.balanceBefore && (
                        <div className="text-xs text-gray-500">
                          Số dư trước: {formatVND(item.balanceBefore)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(item.time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {((item.status || '').toLowerCase().includes('pending')) ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            disabled={Boolean(itemLoading[item.id])}
                            onClick={() => approve(item.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {itemLoading[item.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              'Phê duyệt'
                            )}
                          </button>
                          <button
                            disabled={Boolean(itemLoading[item.id])}
                            onClick={() => rejectTx(item.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {itemLoading[item.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-1"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              'Từ chối'
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={prev}
              disabled={offset === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={next}
              disabled={!hasMore}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{items.length}</span> kết quả
                {total !== null && (
                  <>
                    {' '}trên tổng số <span className="font-medium">{total}</span> giao dịch
                  </>
                )}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={prev}
                  disabled={offset === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Trang {Math.floor(offset / limit) + 1}
                  {total !== null && (
                    <> / {Math.max(1, Math.ceil((total || 0) / limit))}</>
                  )}
                </span>
                <button
                  onClick={next}
                  disabled={!hasMore}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Tiếp</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
