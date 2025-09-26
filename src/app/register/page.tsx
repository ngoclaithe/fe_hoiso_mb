"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const r = await fetch("/api/auth/profile", {
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
    if (password !== confirm) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone }),
        credentials: "include",
      });
      if (!r.ok) throw new Error("Đăng ký thất bại");
      router.replace("/login");
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định");
    } finally { setLoading(false); }
  }

  return (
    <div className="p-4 bg-gradient-to-b from-fuchsia-500 via-pink-500 to-rose-500">
      <div className="mt-6 bg-white/95 backdrop-blur rounded-2xl shadow p-4 max-w-[420px] mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký</h1>
          <p className="text-sm text-gray-600">Tạo tài khoản mới</p>
        </div>
        <form onSubmit={submit} className="space-y-2">
          <label className="block text-sm">Tên đăng nhập
            <input className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username" autoComplete="username" />
          </label>
          <label className="block text-sm">Email
            <input className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="block text-sm">Số điện thoại
            <input className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="09xxxxxxxx" autoComplete="tel" />
          </label>
          <label className="block text-sm">Mật khẩu
            <input type="password" className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" autoComplete="new-password" />
          </label>
          <label className="block text-sm">Xác nhận mật khẩu
            <input type="password" className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="••••••" autoComplete="new-password" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-center">
            <button disabled={loading} type="submit" className="w-64 bg-rose-600 text-white py-3 rounded-xl font-medium disabled:opacity-50">{loading?"Đang đăng ký...":"Tạo tài khoản"}</button>
          </div>
        </form>
        <p className="text-sm mt-3 text-center text-gray-700">Đã có tài khoản? <Link href="/login" className="underline font-medium">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
