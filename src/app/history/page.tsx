"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loanStatusLabel } from "@/lib/loan";

// Define interface for loan data
interface LoanHistory {
  id: string;
  loanAmount?: number | string;
  loan_amount?: number | string;
  status: string;
  loanTermMonths?: number;
  loan_term_months?: number;
  createdAt?: string;
  created_at?: string;
  // optional extended fields for contract prefilling
  borrowerName?: string;
  name?: string;
  cccd?: string;
  contractCode?: string;
  interest?: string;
}

// Define interface for API response
interface LoansApiResponse {
  data?: LoanHistory[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<LoanHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Contract modal state
  const [showContract, setShowContract] = useState(false);
  const [contractData, setContractData] = useState({
    borrowerName: 'Nguyễn Thanh Hải',
    borrowerCCCD: '083056010492',
    signedAt: '2025-09-25T16:01',
    amount: '30.000.000 VNĐ',
    code: '58012188',
    term: '36 tháng',
    interest: '1%/tháng',
    signatureB: 'Nguyễn Thanh Hải',
  });

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return setLoading(false);
        const res = await fetch("/api/my-loans", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          setError(t || `Error ${res.status}`);
          return;
        }
        const data: LoanHistory[] | LoansApiResponse = await res.json();
        setLoans(Array.isArray(data) ? data : data.data || []);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Lỗi tải dữ liệu';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openContractForLoan(l: LoanHistory) {
    // Prefill contract fields from loan when available
    setContractData(prev => ({
      borrowerName: l.borrowerName || l.name || prev.borrowerName,
      borrowerCCCD: l.cccd || prev.borrowerCCCD,
      signedAt: (l.createdAt || l.created_at) ? new Date(l.createdAt || l.created_at || Date.now()).toISOString().slice(0,16) : prev.signedAt,
      amount: String(l.loanAmount || l.loan_amount || prev.amount),
      code: l.contractCode || prev.code,
      term: String(l.loanTermMonths || l.loan_term_months || prev.term),
      interest: l.interest || prev.interest,
      signatureB: prev.signatureB,
    }));
    setShowContract(true);
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => router.push('/profile')} className="p-2 rounded-md border">&lt;</button>
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

            {/* If approved show view contract button */}
            {l.status === 'approved' && (
              <div className="mt-3 text-right">
                <button onClick={() => openContractForLoan(l)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Xem hợp đồng</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contract modal */}
      {showContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg overflow-auto max-h-[90vh] p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Hợp đồng vay tiền</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowContract(false)} className="text-gray-500 hover:text-gray-800">Đóng</button>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-sm text-gray-600">Bên cho vay (Bên A) và chữ k�� bên A mặc định</div>
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="font-medium">Bên cho vay (Bên A): Ngân hàng MB Quân đội</div>
                <div className="mt-2">Chữ ký bên A: <span className="font-semibold">Ngân hàng MB Quân đội</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bên vay (Bên B) - Họ và tên</label>
                <input value={contractData.borrowerName} onChange={(e) => setContractData(prev => ({...prev, borrowerName: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số CCCD</label>
                <input value={contractData.borrowerCCCD} onChange={(e) => setContractData(prev => ({...prev, borrowerCCCD: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ngày ký</label>
                <input type="datetime-local" value={contractData.signedAt} onChange={(e) => setContractData(prev => ({...prev, signedAt: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số tiền vay</label>
                <input value={contractData.amount} onChange={(e) => setContractData(prev => ({...prev, amount: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mã hợp đồng</label>
                <input value={contractData.code} onChange={(e) => setContractData(prev => ({...prev, code: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Thời hạn</label>
                <input value={contractData.term} onChange={(e) => setContractData(prev => ({...prev, term: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Lãi suất</label>
                <input value={contractData.interest} onChange={(e) => setContractData(prev => ({...prev, interest: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Chữ ký bên B</label>
                <input value={contractData.signatureB} onChange={(e) => setContractData(prev => ({...prev, signatureB: e.target.value}))} className="w-full border rounded-md p-2" />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="prose max-w-none">
                <h3>HỢP ĐỒNG VAY TIỀN</h3>
                <p><strong>Bên cho vay (Bên A):</strong> Ngân hàng MB Quân đội</p>
                <p><strong>Bên vay (Bên B):</strong> {contractData.borrowerName}</p>
                <p><strong>Số CCCD:</strong> {contractData.borrowerCCCD}</p>
                <p><strong>Ngày ký:</strong> {contractData.signedAt.replace('T',' – ')}</p>
                <p><strong>Số tiền vay:</strong> {contractData.amount}</p>
                <p><strong>Mã hợp đồng:</strong> {contractData.code}</p>
                <p><strong>Thời hạn vay:</strong> {contractData.term}</p>
                <p><strong>Lãi suất:</strong> {contractData.interest}</p>

                <p>Hợp đồng nêu rõ các bên đã đặt được thỏa thuận vay sau khi thương lượng và trên cơ sở bình đẳng, t�� nguyện và nhất trí. Tất cả các bên cần đọc kỹ tất cả các điều khoản trong thỏa thuận này, sau khi ký vào thỏa thuận này coi như các bên đã hiểu đầy đủ và đồng ý hoàn toàn với tất cả các điều khoản và nội dung trong thỏa thuận này.</p>

                <p><strong>Mục đích vay:</strong> Bên B sử dụng vốn đúng mục đích hợp pháp, không vi phạm pháp luật.</p>

                <p><strong>Thanh toán:</strong> Bên B trả gốc và lãi hàng tháng theo lịch của Bên A; trả trước hạn phải thông báo và thanh toán toàn bộ lãi phát sinh.</p>

                <p><strong>Phạt chậm trả:</strong> Nếu quá hạn, Bên B chịu lãi phạt theo quy định của Bên A.</p>

                <p><strong>Bảo đảm:</strong> Bên B cung cấp đầy đủ giấy tờ tùy thân, chịu trách nhiệm về tính chính xác của thông tin.</p>

                <p><strong>Giải quyết tranh chấp:</strong> Hai bên ưu tiên thương lượng, nếu không thành thì đưa ra cơ quan có thẩm quyền.</p>

                <p>Hai bên đã đọc, hiểu và đồng ý ký kết.</p>

                <div className="flex items-center justify-between mt-8">
                  <div className="text-center">
                    <div className="mb-8">Chữ ký bên B</div>
                    <div className="font-semibold">{contractData.signatureB}</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-8">Chữ ký bên A</div>
                    <div className="font-semibold">Ngân hàng MB Quân đội</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowContract(false)} className="px-4 py-2 border rounded-md">Đóng</button>
              <button onClick={() => { alert('Lưu thay đổi thành công'); setShowContract(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
