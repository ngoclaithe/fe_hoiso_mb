"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    localStorage.setItem("app.username", username.trim());
    router.replace("/");
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Đăng nhập</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm">
          Tên đăng nhập
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên của bạn"
          />
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Đăng nhập</button>
      </form>
    </div>
  );
}
