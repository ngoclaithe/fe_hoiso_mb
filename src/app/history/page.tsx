"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loanStatusLabel } from "@/lib/loan";

// Define interface for loan list item
interface LoanHistoryItem {
  id: string;
  loanAmount?: number | string;
  loan_amount?: number | string;
  status: string;
  loanTermMonths?: number;
  loan_term_months?: number;
  createdAt?: string;
  created_at?: string;
}

// Backend loan detail (subset based on provided example)
interface LoanDetail {
  id: string;
  userId?: string;
  fullName?: string;
  citizenId?: string;
  contractCode?: string;
  interestRate?: string | number;
  loanTermMonths?: number;
  loanAmount?: number | string;
  personalSignatureUrl?: string;
  approvedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

// Define interface for list API response
interface LoansApiResponse {
  data?: LoanHistoryItem[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<LoanHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Contract modal state
  const [showContract, setShowContract] = useState(false);
  const [contract, setContract] = useState<{
    borrowerName: string;
    borrowerCCCD: string;
    signedAt: string;
    amount: string;
    code: string;
    term: string;
    interest: string;
    signatureUrl?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) { setLoading(false); return; }
        const res = await fetch("/api/my-loans", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          setError(t || `Error ${res.status}`);
          return;
        }
        const data: LoanHistoryItem[] | LoansApiResponse = await res.json();
        setLoans(Array.isArray(data) ? data : data.data || []);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Lỗi tải dữ liệu";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function openContractForLoan(l: LoanHistoryItem) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/loans/${encodeURIComponent(l.id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text().catch(() => `Không tải được hợp đồng #${l.id}`));
      const detail: LoanDetail = await res.json();

      const amount = String(detail.loanAmount ?? l.loanAmount ?? l.loan_amount ?? "-");
      const termMonths = detail.loanTermMonths ?? l.loanTermMonths ?? l.loan_term_months;
      const signedAt = detail.approvedDate || detail.updatedAt || detail.createdAt || l.createdAt || l.created_at || new Date().toISOString();
      const interest = typeof detail.interestRate === 'number' ? `${detail.interestRate}%/tháng` : (detail.interestRate || "");

      setContract({
        borrowerName: detail.fullName || "",
        borrowerCCCD: detail.citizenId || "",
        signedAt: new Date(signedAt).toLocaleString(),
        amount,
        code: detail.contractCode || "",
        term: termMonths ? `${termMonths} tháng` : "",
        interest,
        signatureUrl: detail.personalSignatureUrl,
      });
      setShowContract(true);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi tải hợp đồng");
    }
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

            {l.status === 'approved' && (
              <div className="mt-3 text-right">
                <button onClick={() => openContractForLoan(l)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Xem hợp đồng</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showContract && contract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-3xl w-full rounded-lg shadow-lg overflow-auto max-h-[90vh] p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Hợp đồng vay tiền</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowContract(false)} className="text-gray-500 hover:text-gray-800">Đóng</button>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="prose max-w-none">
                <h3 className="text-center uppercase tracking-wide">HỢP ĐỒNG VAY TIỀN</h3>
                <p><strong>Bên cho vay (Bên A):</strong> Ngân hàng MB Quân đội</p>
                <p><strong>Bên vay (Bên B):</strong> {contract.borrowerName || '-'}</p>
                <p><strong>Số CCCD:</strong> {contract.borrowerCCCD || '-'}</p>
                <p><strong>Ngày ký:</strong> {contract.signedAt}</p>
                <p><strong>Số tiền vay:</strong> {contract.amount}</p>
                <p><strong>Mã hợp đồng:</strong> {contract.code || '-'}</p>
                <p><strong>Thời hạn vay:</strong> {contract.term || '-'}</p>
                <p><strong>Lãi suất:</strong> {contract.interest || '-'}</p>

                <p>Hợp đồng nêu rõ các bên đã đặt được thỏa thuận vay sau khi thương lượng và trên cơ sở bình đẳng, tự nguyện và nhất trí. Tất cả các bên cần đọc kỹ tất cả các điều khoản trong thỏa thuận này, sau khi ký vào thỏa thuận này coi như các bên đã hiểu đầy đủ và đồng ý hoàn toàn với tất cả các điều khoản và nội dung trong thỏa thuận này.</p>

                <p><strong>Mục đích vay:</strong> Bên B sử dụng vốn đúng mục đích hợp pháp, không vi phạm pháp luật.</p>

                <p><strong>Thanh toán:</strong> Bên B trả gốc và lãi hàng tháng theo lịch của Bên A; trả trước hạn phải thông báo và thanh toán toàn bộ lãi phát sinh.</p>

                <p><strong>Phạt chậm trả:</strong> Nếu quá hạn, Bên B chịu lãi phạt theo quy định của Bên A.</p>

                <p><strong>Bảo đảm:</strong> Bên B cung cấp đầy đủ giấy tờ tùy thân, chịu trách nhiệm về tính chính xác của thông tin.</p>

                <p><strong>Giải quyết tranh chấp:</strong> Hai bên ưu tiên thương lượng, nếu không thành thì đưa ra cơ quan có thẩm quyền.</p>

                <p>Hai bên đã đọc, hiểu và đồng ý ký kết.</p>

                <div className="flex items-start justify-between mt-8 gap-6">
                  <div className="text-center flex-1">
                    <div className="mb-2">Chữ ký bên B</div>
                    {contract.signatureUrl ? (
                      <img src={contract.signatureUrl} alt="Chữ ký bên B" className="h-16 object-contain mx-auto" />
                    ) : (
                      <div className="italic text-gray-500">(Chưa có chữ ký)</div>
                    )}
                  </div>
                  <div className="text-center flex-1">
                    <div className="mb-2">Chữ ký bên A</div>
                    <div className="font-semibold">Ngân hàng MB Quân đội</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowContract(false)} className="px-4 py-2 border rounded-md">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
