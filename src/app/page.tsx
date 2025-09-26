"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Entry() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/profile", { cache: "no-store" });
      if (r.ok) router.replace("/home");
    })();
  }, [router]);

  return (
    <div className="px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Chào mừng</h1>
      <div className="space-y-3">
        <Link href="/login" className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg">Đăng nhập</Link>
        <Link href="/register" className="block w-full text-center border py-3 rounded-lg">Đăng ký</Link>
      </div>
    </div>
  );
}
