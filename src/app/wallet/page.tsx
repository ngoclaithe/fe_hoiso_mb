"use client";
import React, { useEffect, useState, useRef } from "react";

interface LoanData {
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

interface LoansApiResponse { data?: LoanData[] }

type Txn = {
  id: string;
  type: string;
  amount: string;
  status: string;
  balanceBefore?: string;
  balanceAfter?: string;
  description?: string;
  createdAt: string;
};

export default function WalletPage() {
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);

  async function loadAll() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [loanRes, balRes, profRes] = await Promise.all([
        fetch("/api/my-loans", { cache: "no-store", headers }),
        fetch("/api/wallet/balance", { cache: "no-store", headers }),
        fetch("/api/auth/profile", { cache: "no-store", headers }),
      ]);

      if (loanRes.ok) {
        const data: LoanData[] | LoansApiResponse = await loanRes.json().catch(() => null);
        const arr = Array.isArray(data) ? data : (data?.data || []);
        if (arr && arr.length > 0) setLatestLoan(arr[0]);
      }
      if (balRes.ok) {
        const b = await balRes.json().catch(() => null);
        let val = 0;
        if (typeof b === 'number') {
          val = b;
        } else if (b && typeof b.balance === 'number') {
          val = b.balance;
        } else if (b && typeof b.balance === 'string') {
          const parsed = Number(b.balance);
          val = Number.isFinite(parsed) ? parsed : 0;
        }
        setBalance(val || 0);
      }

      let userId: string | undefined;
      if (profRes.ok) {
        const p = await profRes.json().catch(() => null);
        userId = p?.id || p?.userId || p?.userID || p?.uid || p?.user?.id;
      }
      if (userId) {
        const histRes = await fetch(`/api/transactions/history/${encodeURIComponent(userId)}?limit=50&offset=0`, { cache: "no-store", headers });
        if (histRes.ok) {
          const h = await histRes.json().catch(() => null);
          const rawList = h?.data?.transactions ?? h?.transactions ?? (Array.isArray(h) ? h : []);
          const list: Txn[] = Array.isArray(rawList) ? (rawList as Txn[]) : [];
          if (Array.isArray(list)) setTxns(list);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  function formatVND(n: number) {
    return n.toLocaleString('vi-VN') + ' ₫';
  }

  function maskAccount(a?: string) {
    if (!a) return '••••••••••';
    return '**** ' + a.slice(-4);
  }

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const amountRef = useRef<HTMLInputElement | null>(null);
  const defaultWithdrawDesc = "rút tiền tài khoản";

  useEffect(() => {
    if (showWithdrawModal) setTimeout(() => amountRef.current?.focus(), 0);
  }, [showWithdrawModal]);

  function openWithdraw() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return alert("Bạn cần đăng nhập");
    setShowWithdrawModal(true);
  }

  function submitWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const raw = amountRef.current?.value || "";
    const cleaned = raw.replace(/\s|,/g, "");
    const num = Number(cleaned);
    if (!Number.isFinite(num) || num <= 0) { alert("Số tiền không hợp lệ"); return; }
    if (num > balance) { alert("Số tiền vượt quá số dư ví"); return; }
    const amount = Math.floor(num);
    handleWithdrawConfirm(amount, defaultWithdrawDesc);
  }

  async function handleWithdrawConfirm(amount: number, description: string) {
    if (!Number.isFinite(amount) || amount <= 0) { alert("Số tiền không hợp lệ"); return; }
    if (amount > balance) { alert("Số tiền vượt quá số dư ví"); return; }
    setShowWithdrawModal(false);
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return alert("Bạn cần đăng nhập");
      const payload = { amount, description };
      const res = await fetch(`/api/transactions/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Rút tiền thất bại");
      }
      await loadAll();
      alert("Đã gửi yêu cầu rút tiền");
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Lỗi";
      alert(m);
    } finally {
      setLoading(false);
    }
  }

  const bankName = latestLoan?.bankName || 'MB Bank';
  const accountNumber = latestLoan?.bankAccountNumber || '123456789012';
  const accountHolder = latestLoan?.accountHolderName || 'Nguyễn Văn A';

  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-center">
        <div className="font-semibold">Ví tiền</div>
      </div>

      <div className="p-4 space-y-4">
        {loading && <div className="p-3 bg-white rounded-lg">Đang tải...</div>}

        {/* Physical-style bank card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs opacity-90">Ngân hàng</div>
              <div className="font-semibold text-lg">{bankName}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">Số tài khoản</div>
              <div className="font-mono font-semibold text-lg">{maskAccount(accountNumber)}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Chủ tài khoản</div>
              <div className="font-medium">{accountHolder}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80">Loại ví</div>
              <div className="font-semibold">Ví chính</div>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-8 opacity-10 transform rotate-12 text-8xl font-black">MB</div>
        </div>

        {/* Balance and actions */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Số dư ví</div>
              <div className="text-2xl font-semibold text-gray-800">{formatVND(balance)}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={openWithdraw} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Rút tiền về tài khoản liên kết</button>
            </div>
            {showWithdrawModal && (
              <div className="modal-overlay fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="modal-container w-full max-w-md bg-white rounded-lg shadow-lg p-4">
                  <form onSubmit={submitWithdraw} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Rút tiền</h3>
                      <button type="button" aria-label="Close" onClick={() => setShowWithdrawModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                    </div>

                    <label className="block text-sm">
                      Số tiền (VND)
                      <input
                        ref={amountRef}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={Math.max(0, Math.floor(balance))}
                        step={1}
                        placeholder="100000"
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 border rounded-lg py-2">Huỷ</button>
                      <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2">Xác nhận</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disbursement details */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="font-semibold mb-2">Chi tiết giải ngân</div>
          <div className="space-y-2">
            {txns.length === 0 && <div className="text-sm text-gray-500">Chưa có giao dịch</div>}
            {txns.map((t) => {
              const amount = Number(t.amount);
              const date = t.createdAt ? new Date(t.createdAt) : null;
              return (
                <button key={t.id} onClick={() => setSelectedTxn(t)} className="w-full flex items-center justify-between text-left text-sm text-gray-700">
                  <div>
                    <div className="font-medium capitalize">{t.description || t.type}</div>
                    <div className="text-xs text-gray-500">{date ? date.toLocaleDateString() : ""}</div>
                  </div>
                  <div className="font-medium">{Number.isFinite(amount) ? formatVND(amount) : t.amount}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linked banks */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="font-semibold mb-2">Các ngân hàng liên kết</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center font-semibold">MB</div>
                <div>
                  <div className="font-medium">{bankName}</div>
                  <div className="text-sm text-gray-500">{maskAccount(accountNumber)} • {accountHolder}</div>
                </div>
              </div>
              <div>
                <div className={`text-sm text-green-600`}>Đã xác thực</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {selectedTxn && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Chi tiết giao dịch</h3>
              <button onClick={() => setSelectedTxn(null)} className="text-gray-500 hover:text-gray-800" aria-label="Đóng">✕</button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Loại</span><span className="font-medium capitalize">{selectedTxn.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Số tiền</span><span className="font-medium">{formatVND(Number(selectedTxn.amount))}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Trạng thái</span><span className="font-medium">{selectedTxn.status}</span></div>
              {selectedTxn.balanceBefore !== undefined && <div className="flex justify-between"><span className="text-gray-500">Số dư trước</span><span className="font-medium">{formatVND(Number(selectedTxn.balanceBefore || 0))}</span></div>}
              {selectedTxn.balanceAfter !== undefined && <div className="flex justify-between"><span className="text-gray-500">Số dư sau</span><span className="font-medium">{formatVND(Number(selectedTxn.balanceAfter || 0))}</span></div>}
              {selectedTxn.description && <div className="flex justify-between"><span className="text-gray-500">Mô tả</span><span className="font-medium">{selectedTxn.description}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Thời gian</span><span className="font-medium">{selectedTxn.createdAt ? new Date(selectedTxn.createdAt).toLocaleString() : ""}</span></div>
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={() => setSelectedTxn(null)} className="border rounded-lg px-4 py-2">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
