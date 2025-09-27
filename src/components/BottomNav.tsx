"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/home") return pathname === "/home" || pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const baseItem = "flex flex-col items-center justify-center flex-1 py-2 text-xs";
  const activeCls = "text-blue-600";
  const inactiveCls = "text-gray-500";

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 shadow-sm z-40">
      <div className="flex">
        <Link href="/apply" className={`${baseItem} ${isActive("/apply") ? activeCls : inactiveCls}`} aria-label="Ví tiền">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M21 7H5a2 2 0 0 0-2 2v8a3 3 0 0 0 3 3h15V7Zm0-2V3H6a3 3 0 0 0-3 3v1a3 3 0 0 1 3-3h15Z" />
            <path d="M17 13h2a1 1 0 1 1 0 2h-2a1 1 0 0 1 0-2Z" />
          </svg>
          <span>Ví tiền</span>
        </Link>
        <Link href="/home" className={`${baseItem} ${isActive("/home") ? activeCls : inactiveCls}`} aria-label="Trang chủ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3L12 3Z" />
          </svg>
          <span>Trang chủ</span>
        </Link>
        <Link href="/profile" className={`${baseItem} ${isActive("/profile") ? activeCls : inactiveCls}`} aria-label="Hồ sơ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z" />
          </svg>
          <span>Hồ sơ</span>
        </Link>
      </div>
    </nav>
  );
}
