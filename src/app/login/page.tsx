"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/profile", { cache: "no-store" });
      if (r.ok) router.replace("/home");
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Đăng nhập thất bại");
      router.replace("/home");
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định");
    } finally { setLoading(false); }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Đăng nhập</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm">Email
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="block text-sm">Mật khẩu
          <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">{loading?"Đang đăng nhập...":"Đăng nhập"}</button>
      </form>
      <p className="text-sm mt-3">Chưa có tài khoản? <Link href="/register" className="underline">Đăng ký</Link></p>
    </div>
  );
}
