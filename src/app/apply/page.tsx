"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { calcMonthlyInstallment, formatCurrencyVND, Gender, VN_BANKS, todayISO } from "@/lib/loan";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  personalSignatureUrl?: string;
};

type DocSlot = "front" | "back" | "portrait";

type Signature = {
  cloud_name: string;
  api_key: string;
  signature: string;
  timestamp: number;
  upload_preset?: string;
  folder?: string;
  tags?: string;
  transformation?: string;
};

// Define interface for error response
interface ErrorResponse {
  message?: string;
}

// Define interface for cloudinary response
interface CloudinaryResponse {
  secure_url?: string;
  url?: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{front?: File; back?: File; portrait?: File; signature?: File}>({});
  const [preview, setPreview] = useState<{front?: string; back?: string; portrait?: string; signature?: string}>({});
  const [pickerFor, setPickerFor] = useState<DocSlot | null>(null);

  // Gallery inputs
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const portraitFileRef = useRef<HTMLInputElement>(null);
  // Camera inputs
  const frontCamRef = useRef<HTMLInputElement>(null);
  const backCamRef = useRef<HTMLInputElement>(null);
  const portraitCamRef = useRef<HTMLInputElement>(null);

  // Signature capture
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [signing, setSigning] = useState(false);
  const signatureDrawnRef = useRef(false);

  function getCanvasCtx() {
    const c = signatureCanvasRef.current;
    if (!c) return null;
    return c.getContext("2d");
  }

  function resizeSignatureCanvas() {
    const c = signatureCanvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const displayWidth = c.clientWidth || 0;
    const displayHeight = c.clientHeight || 0;
    if (displayWidth === 0 || displayHeight === 0) return;
    c.width = Math.floor(displayWidth * ratio);
    c.height = Math.floor(displayHeight * ratio);
    const ctx = c.getContext("2d");
    if (ctx) ctx.scale(ratio, ratio);
  }

  useEffect(() => {
    resizeSignatureCanvas();
    const onResize = () => resizeSignatureCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onSignaturePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const ctx = getCanvasCtx();
    if (!ctx) return;
    setSigning(true);
    signatureDrawnRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    ctx.lineWidth = Math.max(2, pressure * 3);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(x, y);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  }

  function onSignaturePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!signing) return;
    e.preventDefault();
    const ctx = getCanvasCtx();
    if (!ctx) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    ctx.lineWidth = Math.max(2, pressure * 3);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onSignaturePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setSigning(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  }

  function clearSignature() {
    const c = signatureCanvasRef.current;
    const ctx = getCanvasCtx();
    if (c && ctx) {
      ctx.clearRect(0, 0, c.width, c.height);
    }
    signatureDrawnRef.current = false;
    set("personalSignatureUrl", "");
  }


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

  const [loanAmountInput, setLoanAmountInput] = useState<string>(String(20_000_000));
  useEffect(() => { setLoanAmountInput(String(f.loanAmount || "")); }, [f.loanAmount]);

  const firstInstallment = useMemo(() => (
    Math.round(calcMonthlyInstallment(f.loanAmount, f.loanTermMonths, f.interestRate))
  ), [f.loanAmount, f.loanTermMonths, f.interestRate]);

  function next() { setStep((s) => s + 1); }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  function set<K extends keyof LoanForm>(key: K, value: LoanForm[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function normalizePhoneInput(v: string): string {
    const digits = (v || "").replace(/\D/g, "");
    if (!digits) return "";
    let s = digits;
    if (s[0] !== "0") s = "0" + s.slice(0, 9);
    return s.slice(0, 10);
  }

  function getResourceType(file: File, override?: string): string {
    if (override) return override;
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "video";
    return "auto";
  }

  async function uploadToCloudinary(file: File, sig: Signature, resourceType?: string): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("signature", String(sig.signature));
    form.append("api_key", String(sig.api_key));

    const signedParams = [
      "timestamp",
      "upload_preset",
      "folder",
      "tags",
      "transformation",
    ] as const;

    (signedParams as readonly string[]).forEach((k) => {
      const v = sig[k as keyof Signature];
      if (v !== undefined && v !== null) form.append(k, String(v));
    });

    const type = resourceType || getResourceType(file);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${type}/upload`;

    const res = await fetch(uploadUrl, { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(err || "Upload thất bại");
    }
    const data: CloudinaryResponse = await res.json();
    return data.secure_url || data.url || "";
  }

  function applySelectedFile(slot: DocSlot, file: File | undefined) {
    setImages((p) => ({ ...p, [slot]: file }));
    setPreview((pv) => {
      const prevUrl = pv[slot];
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return { ...pv, [slot]: file ? URL.createObjectURL(file) : undefined } as typeof pv;
    });
  }

  async function submit() {
    try {
      setLoading(true);
      let citizenIdFrontUrl: string | undefined;
      let citizenIdBackUrl: string | undefined;
      let portraitUrl: string | undefined;
      let personalSignatureUrl: string | undefined;

      // Prepare signature file if drawn on canvas
      let signatureFile: File | undefined;
      if (signatureDrawnRef.current && signatureCanvasRef.current) {
        const c = signatureCanvasRef.current;
        const blob: Blob | null = await new Promise((resolve) => c.toBlob((b) => resolve(b), "image/png"));
        if (blob) signatureFile = new File([blob], "signature.png", { type: "image/png" });
      }

      if (images.front || images.back || images.portrait || signatureFile) {
        const options = { resource_type: "image" };
        const sigRes = await fetch("/api/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
          cache: "no-store",
        });
        if (!sigRes.ok) throw new Error("Không lấy được chữ ký Cloudinary");
        const sig: Signature = await sigRes.json();

        if (images.front) citizenIdFrontUrl = await uploadToCloudinary(images.front, sig, "image");
        if (images.back) citizenIdBackUrl = await uploadToCloudinary(images.back, sig, "image");
        if (images.portrait) portraitUrl = await uploadToCloudinary(images.portrait, sig, "image");
        if (signatureFile) {
          const url = await uploadToCloudinary(signatureFile, sig, "image");
          personalSignatureUrl = url;
        }
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
        gender: String(f.gender).toLowerCase(),
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
        personalSignatureUrl: personalSignatureUrl || f.personalSignatureUrl,
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } catch {}

      const res = await fetch("/api/loans", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err: ErrorResponse = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Tạo hồ sơ thất bại");
      }

      alert("Tạo hồ sơ thành công");
      router.replace("/");
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Có lỗi xảy ra";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500">
      <div className="mt-4 bg-white/95 backdrop-blur rounded-2xl shadow p-5">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => { if (step===1) router.replace("/home"); else prev(); }} className="text-sm px-3 py-1 rounded-full border">Trở lại</button>
        <div className="flex-1">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${((step - 1) / 4) * 100}%` }} />
          </div>
        </div>
      </div>

      {step === 1 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Thông tin khoản vay</h2>
          <label className="block text-sm">
            Số tiền vay (20.000.000 - 500.000.000)
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              value={loanAmountInput}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setLoanAmountInput(digits);
                const num = digits ? Number(digits) : 0;
                set("loanAmount", num);
              }}
              onBlur={() => {
                const num = f.loanAmount || 0;
                const clamped = Math.min(500000000, Math.max(20000000, num || 0));
                set("loanAmount", clamped);
                setLoanAmountInput(String(clamped));
              }}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block text-sm">
            Thời hạn vay
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={f.loanTermMonths}
              onChange={(e)=>set("loanTermMonths", Number(e.target.value))}
            >
              {[6,12,18,24,30,36].map((m)=> (
                <option key={m} value={m}>{m} tháng</option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="font-medium">Thông tin khoản vay</div>
            <div>Số tiền: {formatCurrencyVND(f.loanAmount)}</div>
            <div>Thời hạn vay: {f.loanTermMonths} tháng</div>
            <div>Ngày vay: {new Date().toLocaleDateString("vi-VN")}</div>
            <div>Hình thức thanh toán: Trả góp mỗi tháng</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-gray-600">Trả nợ kỳ đầu</div>
              <div className="font-medium">{formatCurrencyVND(firstInstallment)}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-gray-600">Lãi suất hàng tháng</div>
              <div className="font-medium">{f.interestRate}%</div>
            </div>
          </div>

          <button onClick={()=>setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg">Xác nhận khoản vay</button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
          <label className="block text-sm">Họ và tên
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.fullName} onChange={(e)=>set("fullName", e.target.value)} />
          </label>
          <label className="block text-sm">Giới tính
            <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.gender} onChange={(e)=>set("gender", e.target.value as Gender)}>
              <option value={Gender.MALE}>Nam</option>
              <option value={Gender.FEMALE}>Nữ</option>
              <option value={Gender.OTHER}>Khác</option>
            </select>
          </label>
          <label className="block text-sm">Ngày sinh
            <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.dateOfBirth.slice(0,10)} onChange={(e)=>set("dateOfBirth", new Date(e.target.value).toISOString())} />
          </label>
          <label className="block text-sm">Số CCCD
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.citizenId} onChange={(e)=>set("citizenId", e.target.value)} />
          </label>
          <label className="block text-sm">Nơi ở hiện nay
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.currentAddress} onChange={(e)=>set("currentAddress", e.target.value)} />
          </label>
          <label className="block text-sm">Địa chỉ thường trú
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.permanentAddress} onChange={(e)=>set("permanentAddress", e.target.value)} />
          </label>
          <label className="block text-sm">Quê quán
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.hometown} onChange={(e)=>set("hometown", e.target.value)} />
          </label>
          <div className="flex gap-2">
            <button onClick={prev} className="flex-1 border rounded-lg py-2">Trở lại</button>
            <button onClick={next} className="flex-1 bg-blue-600 text-white rounded-lg py-2">Tiếp tục</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Thông tin giấy tờ</h2>

          {/* Hidden inputs for gallery */}
          <input ref={frontFileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            applySelectedFile("front", file);
          }} />
          <input ref={backFileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            applySelectedFile("back", file);
          }} />
          <input ref={portraitFileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            applySelectedFile("portrait", file);
          }} />

          {/* Hidden inputs for camera */}
          <input ref={frontCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            applySelectedFile("front", file);
          }} />
          <input ref={backCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            applySelectedFile("back", file);
          }} />
          <input ref={portraitCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            applySelectedFile("portrait", file);
          }} />

          <div className="flex flex-col gap-4">
            <button type="button" onClick={()=>setPickerFor("front")} className="w-full h-48 rounded-lg overflow-hidden border bg-gray-100">
              {preview.front ? <Image src={preview.front} alt="front" width={400} height={192} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">Ảnh CCCD mặt trước</div>}
            </button>
            <button type="button" onClick={()=>setPickerFor("back")} className="w-full h-48 rounded-lg overflow-hidden border bg-gray-100">
              {preview.back ? <Image src={preview.back} alt="back" width={400} height={192} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">Ảnh CCCD mặt sau</div>}
            </button>
            <button type="button" onClick={()=>setPickerFor("portrait")} className="w-full h-48 rounded-lg overflow-hidden border bg-gray-100">
              {preview.portrait ? <Image src={preview.portrait} alt="portrait" width={400} height={192} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">Ảnh chân dung</div>}
            </button>
          </div>

          {pickerFor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm bg-white rounded-xl shadow p-4 space-y-3">
                <div className="text-base font-medium">Chọn nguồn ảnh</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (pickerFor === "front") frontCamRef.current?.click();
                      if (pickerFor === "back") backCamRef.current?.click();
                      if (pickerFor === "portrait") portraitCamRef.current?.click();
                      setPickerFor(null);
                    }}
                    className="bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Chụp ảnh
                  </button>
                  <button
                    onClick={() => {
                      if (pickerFor === "front") frontFileRef.current?.click();
                      if (pickerFor === "back") backFileRef.current?.click();
                      if (pickerFor === "portrait") portraitFileRef.current?.click();
                      setPickerFor(null);
                    }}
                    className="border py-2 rounded-lg"
                  >
                    Chọn từ máy
                  </button>
                </div>
                <button onClick={() => setPickerFor(null)} className="w-full border rounded-lg py-2">Huỷ</button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">Chọn ảnh, upload sẽ diễn ra khi tạo hồ sơ.</p>
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
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.occupation} onChange={(e)=>set("occupation", e.target.value)} />
          </label>
          <label className="block text-sm">Thu nhập
            <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={String(f.income)} onChange={(e)=>set("income", Number(e.target.value))}>
              <option value={5000000}>Dưới 7 triệu</option>
              <option value={12000000}>Từ 7 triệu đến 15 triệu</option>
              <option value={20000000}>Từ 15 triệu đến 25 triệu</option>
              <option value={30000000}>Trên 25 triệu</option>
            </select>
          </label>
          <label className="block text-sm">Mục đích khoản vay
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.loanPurpose} onChange={(e)=>set("loanPurpose", e.target.value)} />
          </label>
          <label className="block text-sm">Số điện thoại người thân 1
            <input type="tel" inputMode="numeric" pattern="^0\\d{9}$" maxLength={10} title="Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.contact1Phone} onChange={(e)=>set("contact1Phone", normalizePhoneInput(e.target.value))} />
          </label>
          <label className="block text-sm">Quan hệ với người thân 1
            <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.contact1Relationship} onChange={(e)=>set("contact1Relationship", e.target.value)}>
              {['Bố','Mẹ','Anh em ruột','Anh em họ','Bạn bè'].map((r)=> (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">Số điện thoại người thân 2
            <input type="tel" inputMode="numeric" pattern="^0\\d{9}$" maxLength={10} title="Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.contact2Phone} onChange={(e)=>set("contact2Phone", normalizePhoneInput(e.target.value))} />
          </label>
          <label className="block text-sm">Quan hệ với người thân 2
            <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.contact2Relationship} onChange={(e)=>set("contact2Relationship", e.target.value)}>
              {['Bố','Mẹ','Anh em ruột','Anh em họ','Bạn bè'].map((r)=> (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
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
            <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.bankName} onChange={(e)=>set("bankName", e.target.value)}>
              {VN_BANKS.map((b)=> (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">Số tài khoản thụ hưởng
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.bankAccountNumber} onChange={(e)=>set("bankAccountNumber", e.target.value)} />
          </label>
          <label className="block text-sm">Tên thụ hưởng
            <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.accountHolderName} onChange={(e)=>set("accountHolderName", e.target.value)} />
          </label>
          <label className="block text-sm">Ngày thanh toán hàng tháng
            <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={f.monthlyPaymentDate} onChange={(e)=>set("monthlyPaymentDate", Number(e.target.value))}>
              {Array.from({length:31}, (_,i)=>i+1).map((d)=> (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <div className="text-sm font-medium">Chữ ký cá nhân</div>
            <div className="rounded-lg border bg-gray-50">
              <canvas
                ref={signatureCanvasRef}
                className="w-full h-40 rounded-lg touch-none select-none"
                onPointerDown={onSignaturePointerDown}
                onPointerMove={onSignaturePointerMove}
                onPointerUp={onSignaturePointerUp}
                onPointerLeave={onSignaturePointerUp}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={clearSignature} className="flex-1 border rounded-lg py-2">Xoá</button>
            </div>
          </div>

          <button disabled={loading} onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50">{loading ? (<span className="inline-flex items-center justify-center gap-2"><svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Đang tạo...</span>) : "Tạo hồ sơ"}</button>
        </section>
      )}
      </div>
    </div>
  );
}
