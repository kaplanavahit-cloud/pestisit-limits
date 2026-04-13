import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pestisit Limit Kontrol",
  description: "AB, Türkiye ve Rusya pestisit limit kontrolü",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full w-full">
      <body className="min-h-screen w-full bg-gray-50 antialiased text-gray-900 overflow-x-hidden">
        {/* Ana içerik alanı */}
        <main className="min-h-screen w-full flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}