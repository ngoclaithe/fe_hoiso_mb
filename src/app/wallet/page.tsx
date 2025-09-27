"use client";
import { useEffect, useState } from "react";

interface LoanData {
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

interface LoansApiResponse { data?: LoanData[] }

export default function WalletPage() {
  const [latestLoan, setLatestLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Mock data
  const mockBalance = 1250000; // VND
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

  function handleWithdraw() {
    try { window.alert('Mô phỏng: yêu cầu rút tiền đã được gửi.'); } catch {}
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
              <div className="text-2xl font-semibold text-gray-800">{formatVND(mockBalance)}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={handleWithdraw} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Rút tiền về tài khoản liên kết</button>
              <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">Nạp tiền</button>
            </div>
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
