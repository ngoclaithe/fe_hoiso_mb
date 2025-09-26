export function formatCurrencyVND(value: number): string {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${Math.round(value).toLocaleString("vi-VN")} đ`;
  }
}

export function calcMonthlyInstallment(principal: number, months: number, monthlyRatePercent: number): number {
  const r = monthlyRatePercent / 100; // convert to decimal
  if (months <= 0 || principal <= 0) return 0;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export function todayISO(): string {
  const d = new Date();
  const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
  return iso;
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

export function loanStatusLabel(status?: string) {
  switch ((status || '').toLowerCase()) {
    case LoanStatus.PENDING: return 'Đang chờ';
    case LoanStatus.APPROVED: return 'Đã duyệt';
    case LoanStatus.REJECTED: return 'Từ chối';
    case LoanStatus.ACTIVE: return 'Đang vay';
    case LoanStatus.COMPLETED: return 'Hoàn thành';
    case LoanStatus.OVERDUE: return 'Quá hạn';
    default: return status || '-';
  }
}

export const VN_BANKS: string[] = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "MB Bank",
  "ACB",
  "VPBank",
  "Sacombank",
  "TPBank",
  "SHB",
  "VIB",
  "HDBank",
  "OCB",
  "SCB",
  "Eximbank",
  "Nam A Bank",
  "SeABank",
  "MSB",
  "OceanBank",
  "PVcomBank",
  "Bac A Bank",
  "Saigonbank",
  "BaoViet Bank",
  "NCB",
  "LienVietPostBank",
  "KienLongBank",
  "DongA Bank"
];
