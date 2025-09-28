import React from "react";
import AdminShell from "@/components/AdminShell";

export const metadata = {
  title: 'Admin - Quản trị',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="w-full max-w-6xl mx-auto min-h-screen p-6">
        <AdminShell>
          {children}
        </AdminShell>
      </main>
    </div>
  );
}
