"use client";
"use client";
import React, { useEffect, useState, useRef } from "react";

interface LoanData {
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

interface LoansApiResponse { data?: LoanData[] }

export default function WalletPage() {
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  async function loadAll() {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      setLoading(true);
      const [loanRes, balRes] = await Promise.all([
        fetch("/api/my-loans", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/wallet/balance", { cache: "no-store", headers: { Authorization: `Bearer ${token}` } }),
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // Mock data (keep disbursements and banks visual)
  const mockDisbursements = [
    { id: 'd1', date: '2024-05-01', amount: 500000, status: 'Đã giải ngân' },
    { id: 'd2', date: '2024-06-15', amount: 750000, status: 'Đã giải ngân' },
  ];
  const mockLinkedBanks = [
    { id: 'b1', name: 'MB Bank', account: '123456789012', holder: 'Nguyễn Văn A', verified: true },
    { id: 'b2', name: 'Vietcombank', account: '098765432109', holder: 'Nguyễn Thị B', verified: false },
  ];

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
            {mockDisbursements.map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm text-gray-700">
                <div>
                  <div className="font-medium">{d.status}</div>
                  <div className="text-xs text-gray-500">{new Date(d.date).toLocaleDateString()}</div>
                </div>
                <div className="font-medium">{formatVND(d.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Linked banks */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="font-semibold mb-2">Các ngân hàng liên kết</div>
          <div className="space-y-3">
            {mockLinkedBanks.map(b => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center font-semibold">{b.name.slice(0,2)}</div>
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-sm text-gray-500">{maskAccount(b.account)} • {b.holder}</div>
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${b.verified ? 'text-green-600' : 'text-yellow-600'}`}>{b.verified ? 'Đã xác thực' : 'Chưa xác thực'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
