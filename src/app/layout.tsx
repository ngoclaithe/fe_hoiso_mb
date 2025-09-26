import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Đăng ký hồ sơ vay",
  description: "Webapp đăng ký hồ sơ vay vốn dạng mobile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex justify-center bg-[var(--background)] text-[var(--foreground)]">
          <main className="w-full max-w-[430px] min-h-screen bg-[var(--background)]">
            <header className="bg-white/95 backdrop-blur sticky top-0 z-40 border-b">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-lg font-semibold">Hệ thống vay vốn</div>
                <div className="flex items-center gap-3">
                  <Link href="/notifications" className="p-2 rounded-md hover:bg-gray-100" aria-label="Thông báo">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </Link>

                  <Link href="/profile" className="p-2 rounded-md hover:bg-gray-100" aria-label="Tài khoản">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1119.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </header>

            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
