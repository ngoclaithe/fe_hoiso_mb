"use client";
import { useMemo, useState } from "react";
import { calcMonthlyInstallment, formatCurrencyVND, Gender, VN_BANKS, todayISO } from "@/lib/loan";
import { useRouter } from "next/navigation";

type LoanForm = {
  loanAmount: number;
  loanTermMonths: number;
  interestRate: number; // percent per month
  monthlyPaymentDate: number;
  fullName: string;
  gender: Gender;
  dateOfBirth: string; // ISO
  citizenId: string;
  currentAddress: string;
  permanentAddress: string;
  hometown: string;
  occupation: string;
  income: number;
  loanPurpose: string;
  contact1Phone: string;
  contact1Relationship: string;
  contact2Phone: string;
  contact2Relationship: string;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
  citizenIdFrontUrl?: string;
  citizenIdBackUrl?: string;
  portraitUrl?: string;
};

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{front?: File; back?: File; portrait?: File}>({});
  const [f, setF] = useState<LoanForm>({
    loanAmount: 20_000_000,
    loanTermMonths: 6,
    interestRate: 1,
    monthlyPaymentDate: new Date().getDate(),

    fullName: "",
    gender: Gender.OTHER,
    dateOfBirth: todayISO(),
    citizenId: "",
    currentAddress: "",
    permanentAddress: "",
    hometown: "",

    occupation: "",
    income: 5_000_000,
    loanPurpose: "",

    contact1Phone: "",
    contact1Relationship: "",
    contact2Phone: "",
    contact2Relationship: "",

    bankAccountNumber: "",
    bankName: VN_BANKS[0],
    accountHolderName: "",
  });

  const firstInstallment = useMemo(() => (
    Math.round(calcMonthlyInstallment(f.loanAmount, f.loanTermMonths, f.interestRate))
  ), [f.loanAmount, f.loanTermMonths, f.interestRate]);

  function next() { setStep((s) => s + 1); }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  function set<K extends keyof LoanForm>(key: K, value: LoanForm[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadToCloudinary(file: File, sig: any): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    if (sig.upload_preset) form.append("upload_preset", String(sig.upload_preset));
    if (sig.folder) form.append("folder", String(sig.folder));
    if (sig.tags) form.append("tags", String(sig.tags));
    if (sig.transformation) form.append("transformation", String(sig.transformation));
    form.append("api_key", String(sig.api_key));
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", String(sig.signature));
    form.append("use_filename", String(sig.use_filename));
    form.append("unique_filename", String(sig.unique_filename));
    form.append("overwrite", String(sig.overwrite));

    const cloudName = String(sig.cloud_name);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error("Upload thất bại");
    const data = await res.json();
    return data.secure_url || data.url;
  }

  async function submit() {
    try {
      setLoading(true);
      let citizenIdFrontUrl: string | undefined;
      let citizenIdBackUrl: string | undefined;
      let portraitUrl: string | undefined;

      if (images.front || images.back || images.portrait) {
        const sigRes = await fetch("/api/signature", { cache: "no-store" });
        if (!sigRes.ok) throw new Error("Không lấy được chữ ký Cloudinary");
        const sig = await sigRes.json();

        if (images.front) citizenIdFrontUrl = await uploadToCloudinary(images.front, sig);
        if (images.back) citizenIdBackUrl = await uploadToCloudinary(images.back, sig);
        if (images.portrait) portraitUrl = await uploadToCloudinary(images.portrait, sig);
      }

      const payload = {
        fullName: f.fullName,
        currentAddress: f.currentAddress,
        permanentAddress: f.permanentAddress,
        hometown: f.hometown,
        citizenId: f.citizenId,
        citizenIdFrontUrl,
        citizenIdBackUrl,
        portraitUrl,
        gender: f.gender,
        dateOfBirth: f.dateOfBirth,
        occupation: f.occupation,
        income: Number(f.income),
        loanPurpose: f.loanPurpose,
        contact1Phone: f.contact1Phone,
        contact1Relationship: f.contact1Relationship,
        contact2Phone: f.contact2Phone,
        contact2Relationship: f.contact2Relationship,
        bankAccountNumber: f.bankAccountNumber,
        bankName: f.bankName,
        accountHolderName: f.accountHolderName,
        loanAmount: Number(f.loanAmount),
        loanTermMonths: Number(f.loanTermMonths),
        interestRate: Number(f.interestRate),
        monthlyPaymentDate: Number(f.monthlyPaymentDate),
      };

      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Tạo hồ sơ thất bại");
      }

      alert("Tạo hồ sơ thành công");
      router.replace("/");
    } catch (e: any) {
      alert(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} disabled={step===1} className="text-sm px-3 py-1 rounded-full border disabled:opacity-50">Trở lại</button>
        <div className="text-sm">Bước {step} / 5</div>
      </div>

      {step === 1 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Thông tin khoản vay</h2>
          <label className="block text-sm">
            Số tiền vay (20.000.000 - 500.000.000)
            <input type="number" min={20000000} max={500000000} value={f.loanAmount}
              onChange={(e)=>set("loanAmount", Math.min(500000000, Math.max(20000000, Number(e.target.value||0))))}
              className="mt-1 w-full border rounded-lg px-3 py-2" />
          </label>
          <label className="block text-sm">
            Thời hạn vay (6 - 36 tháng)
            <input type="number" min={6} max={36} value={f.loanTermMonths}
              onChange={(e)=>set("loanTermMonths", Math.min(36, Math.max(6, Number(e.target.value||0))))}
              className="mt-1 w-full border rounded-lg px-3 py-2" />
          </label>

          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="font-medium">Preview</div>
            <div>Số tiền: {formatCurrencyVND(f.loanAmount)}</div>
            <div>Thời hạn vay: {f.loanTermMonths} tháng</div>
            <div>Ngày vay: {new Date().toLocaleDateString("vi-VN")}</div>
            <div>Hình thức thanh toán: Trả góp mỗi tháng</div>
            <div>Trả nợ kỳ đầu: {formatCurrencyVND(firstInstallment)}</div>
            <div>Lãi suất hàng tháng: {f.interestRate}%</div>
          </div>

          <button onClick={()=>setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg">Xác nhận khoản vay</button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
          <label className="block text-sm">Họ và tên
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.fullName} onChange={(e)=>set("fullName", e.target.value)} />
          </label>
          <label className="block text-sm">Giới tính
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={f.gender} onChange={(e)=>set("gender", e.target.value as Gender)}>
              <option value={Gender.MALE}>Nam</option>
              <option value={Gender.FEMALE}>Nữ</option>
              <option value={Gender.OTHER}>Khác</option>
            </select>
          </label>
          <label className="block text-sm">Ngày sinh
            <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={f.dateOfBirth.slice(0,10)} onChange={(e)=>set("dateOfBirth", new Date(e.target.value).toISOString())} />
          </label>
          <label className="block text-sm">Số CCCD
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.citizenId} onChange={(e)=>set("citizenId", e.target.value)} />
          </label>
          <label className="block text-sm">Nơi ở hiện nay
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.currentAddress} onChange={(e)=>set("currentAddress", e.target.value)} />
          </label>
          <label className="block text-sm">Địa chỉ thường trú
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.permanentAddress} onChange={(e)=>set("permanentAddress", e.target.value)} />
          </label>
          <label className="block text-sm">Quê quán
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.hometown} onChange={(e)=>set("hometown", e.target.value)} />
          </label>
          <div className="flex gap-2">
            <button onClick={prev} className="flex-1 border rounded-lg py-2">Trở lại</button>
            <button onClick={next} className="flex-1 bg-blue-600 text-white rounded-lg py-2">Tiếp tục</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Tải ảnh giấy tờ</h2>
          <label className="block text-sm">Ảnh mặt trước
            <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e)=> setImages((p)=>({ ...p, front: e.target.files?.[0] }))} />
          </label>
          <label className="block text-sm">Ảnh mặt sau
            <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e)=> setImages((p)=>({ ...p, back: e.target.files?.[0] }))} />
          </label>
          <label className="block text-sm">Ảnh chân dung
            <input type="file" accept="image/*" className="mt-1 w-full" onChange={(e)=> setImages((p)=>({ ...p, portrait: e.target.files?.[0] }))} />
          </label>
          <p className="text-xs text-gray-500">Chỉ chọn ảnh, upload sẽ thực hiện khi tạo hồ sơ.</p>
          <div className="flex gap-2">
            <button onClick={prev} className="flex-1 border rounded-lg py-2">Trở lại</button>
            <button onClick={next} className="flex-1 bg-blue-600 text-white rounded-lg py-2">Tiếp tục</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Công việc & liên hệ</h2>
          <label className="block text-sm">Nghề nghiệp
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.occupation} onChange={(e)=>set("occupation", e.target.value)} />
          </label>
          <label className="block text-sm">Thu nhập
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={String(f.income)} onChange={(e)=>set("income", Number(e.target.value))}>
              <option value={5000000}>Dưới 7 triệu</option>
              <option value={12000000}>Từ 7 triệu đến 15 triệu</option>
              <option value={20000000}>Từ 15 triệu đến 25 triệu</option>
              <option value={30000000}>Trên 25 triệu</option>
            </select>
          </label>
          <label className="block text-sm">Mục đích khoản vay
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.loanPurpose} onChange={(e)=>set("loanPurpose", e.target.value)} />
          </label>
          <label className="block text-sm">Số điện thoại người thân 1
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.contact1Phone} onChange={(e)=>set("contact1Phone", e.target.value)} />
          </label>
          <label className="block text-sm">Quan hệ với người thân 1
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.contact1Relationship} onChange={(e)=>set("contact1Relationship", e.target.value)} />
          </label>
          <label className="block text-sm">Số điện thoại người thân 2
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.contact2Phone} onChange={(e)=>set("contact2Phone", e.target.value)} />
          </label>
          <label className="block text-sm">Quan hệ với người thân 2
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.contact2Relationship} onChange={(e)=>set("contact2Relationship", e.target.value)} />
          </label>
          <div className="flex gap-2">
            <button onClick={prev} className="flex-1 border rounded-lg py-2">Trở lại</button>
            <button onClick={next} className="flex-1 bg-blue-600 text-white rounded-lg py-2">Tiếp tục</button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Tài khoản nhận tiền</h2>
          <label className="block text-sm">Tên ngân hàng
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={f.bankName} onChange={(e)=>set("bankName", e.target.value)}>
              {VN_BANKS.map((b)=> (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">Số tài khoản thụ hưởng
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.bankAccountNumber} onChange={(e)=>set("bankAccountNumber", e.target.value)} />
          </label>
          <label className="block text-sm">Tên thụ hưởng
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={f.accountHolderName} onChange={(e)=>set("accountHolderName", e.target.value)} />
          </label>
          <label className="block text-sm">Ngày thanh toán hàng tháng
            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={f.monthlyPaymentDate} onChange={(e)=>set("monthlyPaymentDate", Number(e.target.value))}>
              {Array.from({length:31}, (_,i)=>i+1).map((d)=> (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <button disabled={loading} onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50">{loading?"Đang tạo...":"Tạo hồ sơ"}</button>
        </section>
      )}
    </div>
  );
}
