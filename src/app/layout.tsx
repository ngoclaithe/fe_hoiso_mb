import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

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
          <main className="w-full max-w-[430px] min-h-screen bg-gradient-to-b from-white to-blue-50 pb-16">
            <Header />

            {children}

            <BottomNav />
          </main>
        </div>
      </body>
    </html>
  );
}
