"use client";
import React, { useEffect, useRef } from "react";

export default function AmountModal({
  open,
  initialAmount = 0,
  initialDescription = "",
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialAmount?: number;
  initialDescription?: string;
  onClose: () => void;
  onConfirm: (amount: number, description: string) => void;
}) {
  const amountRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      // focus amount input when opened
      setTimeout(() => amountRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const raw = amountRef.current?.value || "";
    const cleaned = raw.replace(/\s|,/g, "");
    const num = Number(cleaned);
    if (!Number.isFinite(num) || num <= 0) {
      alert("Số tiền không hợp lệ");
      return;
    }
    const rounded = Math.round(num * 100) / 100;
    const desc = descRef.current?.value || initialDescription || "";
    onConfirm(rounded, desc);
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="modal-container w-full max-w-md bg-white rounded-lg shadow-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rút tiền</h3>
            <button type="button" aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
          </div>

          <label className="block text-sm">
            Số tiền (VND)
            <input ref={amountRef} defaultValue={initialAmount || undefined} placeholder="100000" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block text-sm">
            Mô tả
            <input ref={descRef} defaultValue={initialDescription} placeholder="Mô tả" className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2">Huỷ</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2">Xác nhận</button>
          </div>
        </form>
      </div>
    </div>
  );
}
