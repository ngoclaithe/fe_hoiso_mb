"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const nav = [
    { href: "/admin/users", label: "Quản lý người dùng" },
    { href: "/admin/loans", label: "Quản lý hồ sơ" },
    { href: "/admin/transactions", label: "Quản lý giao dịch" },
  ];

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-4 py-3 border-b font-semibold">Menu quản trị</div>
        <nav className="p-3 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-lg hover:bg-blue-50" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
        aria-label="Mở menu quản trị"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menu
      </button>

      {children}
    </div>
  );
}
