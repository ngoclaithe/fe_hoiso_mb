"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrencyVND } from "@/lib/loan";
import { useRouter } from "next/navigation";

const firstSlides = [
  "https://www.anphabe.com/file-deliver.php?key=hcWDxaBjm7TXnZedhtmlrtKWiG3ZcGOgWtaWr1qhqG5mbluboZ1UoKNrZp1aa2dmZ2maVXHXamiXclaUx8vF1tDYwdrHnNaehp7VnZSgU1ehrg",
  "https://news.mbbank.com.vn/file-service/uploads/v1/images/ee3a94ed-b53c-46e8-89e3-ddd15b0e9449-imagejpg.jpg",
  "https://statictttc.kinhtedothi.vn/zoom/1000/Uploaded/nguyengiang/2024_11_04/screenshot_2024-09-03_070257_BTOS.jpg",
];

const secondSlides = [
  "https://hopdongdientuhanoi.mobifone.vn/wp-content/uploads/2025/04/vay-tien-bang-cccd.jpg",
  "https://cdn.chanhtuoi.com/uploads/2022/08/vay-tien-chi-can-cmnd-va-bang-lai-01.jpg",
  "https://simg.zalopay.com.vn/zlp-website/assets/app_vay_tien_online_9_4fe133af9d.jpg",
];

function maskPhone(phone: string) {
  if (phone.length < 5) return phone;
  return phone.slice(0, 3) + "********" + phone.slice(-2);
}

function getDisplayName(p: any): string {
  return p?.fullName || p?.username || p?.name || p?.email || "bạn";
}

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) { router.replace("/"); return; }
        const r = await fetch("/api/auth/profile", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const data = await r.json().catch(() => null);
          setProfile(data);
        } else {
          try { localStorage.removeItem("token"); } catch {}
          router.replace("/");
        }
      } catch {
        try { localStorage.removeItem("token"); } catch {}
        router.replace("/");
      }
    })();
  }, [router]);

  const activities = useMemo(() => {
    const phones = [
      "03312345682",
      "09876543210",
      "09011223345",
      "09155667788",
      "09733445566",
      "08566778899",
      "08244556677",
      "08812349876",
      "07099887766",
      "03955667788",
    ];
    const amounts = [
      100_000_000,
      50_000_000,
      200_000_000,
      80_000_000,
      150_000_000,
      120_000_000,
      90_000_000,
      60_000_000,
      110_000_000,
      75_000_000,
    ];
    return phones.map((p, i) => `${maskPhone(p)} đã rút ${formatCurrencyVND(amounts[i])}`);
  }, []);

  const [firstIdx, setFirstIdx] = useState(0);
  const [secondIdx, setSecondIdx] = useState(0);
  const [activityIdx, setActivityIdx] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setFirstIdx((i) => (i + 1) % firstSlides.length), 10000);
    const t2 = setInterval(() => setSecondIdx((i) => (i + 1) % secondSlides.length), 10000);
    const t3 = setInterval(() => setActivityIdx((i) => (i + 1) % activities.length), 3000);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, [activities.length]);

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="text-xl font-semibold">Xin chào, {getDisplayName(profile)}</h1>
      </header>

      <section aria-label="recent-approvals" className="mb-4">
        <div className="flex justify-center">
          <div className="px-3 py-2 rounded-full border text-xs whitespace-nowrap">
            {activities[activityIdx]}
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="relative w-[360px] h-[160px] rounded-lg overflow-hidden border mx-auto">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${firstIdx * 100}%)` }}
          >
            {firstSlides.map((src, i) => (
              <div key={i} className="min-w-full h-full">
                <img src={src} alt={`slide-${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {firstSlides.map((_, i) => (
            <button
              key={i}
              aria-label={`Chuyển slide ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full ${i === firstIdx ? "bg-blue-600" : "bg-gray-300"}`}
              onClick={() => setFirstIdx(i)}
            />
          ))}
        </div>
      </section>

      <div className="mb-4 flex justify-center">
        <Link href="/apply" className="w-60 text-center bg-blue-600 text-white py-3 rounded-lg font-medium">Đăng ký khoản vay</Link>
      </div>

      <ul className="text-sm space-y-1 mb-4">
        <li>• Thủ tục vay nhanh chóng, đơn giản</li>
        <li>• Hạn mức vay lên đến 500 tr VNĐ</li>
        <li>• Nhận tiền chỉ sau 30 phút làm hồ sơ</li>
      </ul>

      <section>
        <div className="relative w-[360px] h-[160px] rounded-lg overflow-hidden border mx-auto">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${secondIdx * 100}%)` }}
          >
            {secondSlides.map((src, i) => (
              <div key={i} className="min-w-full h-full">
                <img src={src} alt={`info-${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-2">
          {secondSlides.map((_, i) => (
            <button
              key={i}
              aria-label={`Chuyển ảnh ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full ${i === secondIdx ? "bg-blue-600" : "bg-gray-300"}`}
              onClick={() => setSecondIdx(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
