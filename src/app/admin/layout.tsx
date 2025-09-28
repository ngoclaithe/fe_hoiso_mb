import React from "react";
import Header from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="flex max-w-[1000px] mx-auto">
        <aside className="w-56 bg-white border-r p-4 min-h-[calc(100vh-64px)]">
          <div className="font-semibold mb-4">Admin</div>
          <nav className="space-y-2 text-sm">
            <a href="/admin" className="block px-3 py-2 rounded hover:bg-blue-50">Dashboard</a>
            <a href="/admin/users" className="block px-3 py-2 rounded hover:bg-blue-50">Quản lý user</a>
            <a href="/admin/loans" className="block px-3 py-2 rounded hover:bg-blue-50">Quản lý hồ sơ vay</a>
            <a href="/admin/transactions" className="block px-3 py-2 rounded hover:bg-blue-50">Quản lý giải ngân</a>
          </nav>
        </aside>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
