// app/layout.tsx

import type { Metadata } from "next";
import Link from "next/link";
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
      <body className="min-h-screen w-full bg-gray-50 antialiased text-gray-900 overflow-x-hidden flex flex-col">
        {/* Ana içerik alanı - flex-grow ile footer'ı aşağı iter */}
        <main className="flex-grow w-full">
          {children}
        </main>

        {/* Footer - Kullanıcı Sözleşmesi ve Gizlilik Politikası linkleri */}
        <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-500">
              <div className="flex gap-4">
                <Link 
                  href="/terms" 
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  Kullanıcı Sözleşmesi
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                  href="/privacy" 
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  Gizlilik Politikası
                </Link>
              </div>
              <div className="text-xs text-gray-400">
                © {new Date().getFullYear()} Pestisit Limit Kontrol - MRL Control
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}