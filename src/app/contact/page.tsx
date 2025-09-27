"use client";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  return (
    <div>
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">&lt;</button>
        <div className="font-semibold">Tư vấn - Hỗ trợ</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="font-semibold mb-2">Liên hệ</div>
          <p className="text-sm text-gray-600">Vui lòng liên hệ để được tư vấn và hỗ trợ nhanh chóng:</p>
          <ul className="mt-2 text-sm text-blue-700 space-y-2">
            <li>
              <a href="tel:19001234" className="underline">Gọi tổng đài: 1900 1234</a>
            </li>
            <li>
              <a href="mailto:support@example.com" className="underline">Email: support@example.com</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
