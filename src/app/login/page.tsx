"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { publicApiUrl } from "@/lib/http";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const r = await fetch(publicApiUrl("/auth/profile"), {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) router.replace("/home");
      } catch {}
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(publicApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Đăng nhập thất bại");
      const data = await res.json().catch(() => null);
      if (data?.access_token) {
        try { localStorage.setItem("token", data.access_token); } catch {}
      }
      router.replace("/home");
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500">
      <div className="mt-10 bg-white/95 backdrop-blur rounded-2xl shadow p-5">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
          <p className="text-sm text-gray-600">Chào mừng quay lại</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">
            Tên đăng nhập
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
            />
          </label>
          <label className="block text-sm">
            Mật khẩu
            <input
              type="password"
              className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <p className="text-sm mt-3 text-center text-gray-700">
          Chưa có tài khoản? <Link href="/register" className="underline font-medium">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
