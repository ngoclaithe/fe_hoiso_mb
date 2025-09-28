"use client";
import React, { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex max-w-[1000px] mx-auto">
        <aside className={`${open ? 'w-56' : 'w-12'} bg-white border-r p-4 min-h-[calc(100vh-64px)] transition-all` }>
          <div className="flex items-center justify-between mb-4">
            {open && <div className="font-semibold">Quản trị</div>}
            <button aria-label="Toggle sidebar" onClick={() => setOpen(!open)} className="text-sm px-2 py-1 rounded hover:bg-gray-100">☰</button>
          </div>
          <nav className="space-y-2 text-sm">
            <a href="/admin/users" className="block px-3 py-2 rounded hover:bg-blue-50">Quản lý người dùng</a>
            <a href="/admin/loans" className="block px-3 py-2 rounded hover:bg-blue-50">Quản lý hồ sơ vay</a>
            <a href="/admin/transactions" className="block px-3 py-2 rounded hover:bg-blue-50">Quản lý giải ngân</a>
          </nav>
        </aside>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
