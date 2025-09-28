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

export default function AdminTransactionsPage() {
  const [items, setItems] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

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

      // Normalize transaction array from various backend shapes
      let txArr: RawTx[] = [];
      if (Array.isArray(data)) txArr = data;
      else if (Array.isArray(data.transactions)) txArr = data.transactions;
      else if (data && Array.isArray(data.data)) txArr = data.data;
      else if (data && data.data && Array.isArray(data.data.transactions)) txArr = data.data.transactions;
      else if (data && data.transactions && Array.isArray(data.transactions)) txArr = data.transactions;
      else txArr = [];

      const mapped = txArr.map((t) => ({
        id: detectId(t),
        amount: detectAmount(t),
        status: (detectStatus(t) || '').toString(),
        type: (detectType(t) || '').toString(),
        user: (t.user?.username || t.user?.name || t.user) as string | undefined,
        time: detectTime(t),
      }));

      // filter to only withdrawal and pending
      const filtered = mapped.filter(m => {
        const typ = (m.type || '').toLowerCase();
        const st = (m.status || '').toLowerCase();
        const isWithdraw = typ.includes('withdraw') || typ.includes('rút') || typ.includes('withdrawal');
        const isPending = st.includes('pending') || st.includes('pend') || st.includes('chờ') || st.includes('pending');
        return isWithdraw && isPending;
      });

      setItems(filtered);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [limit, offset]);

  function prev() { if (offset - limit >= 0) setOffset(offset - limit); }
  function next() { setOffset(offset + limit); }

  function formatVND(v?: number | string) {
    const n = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v.replace(/\s|,/g, '')) : NaN);
    if (!Number.isFinite(n)) return String(v ?? "-");
    return n.toLocaleString('vi-VN') + ' ₫';
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-3">Quản lý giải ngân</h1>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-3">
        {items.map(it => (
          <div key={it.id} className="p-3 bg-white border rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium">{it.user || '—'}</div>
              <div className="text-sm text-gray-500">ID: {it.id}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Số tiền</div>
              <div className="font-medium">{formatVND(it.amount)}</div>
              <div className="text-xs text-gray-500 mt-1">{it.time ? new Date(it.time).toLocaleString() : 'Vừa mới'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={prev} disabled={offset === 0} className="px-3 py-2 border rounded">Trước</button>
        <button onClick={next} className="px-3 py-2 border rounded">Kế</button>
        <div className="text-sm text-gray-500">Hiển thị {items.length} mục</div>
      </div>
    </div>
  );
}
