// app/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import TermsModal from '@/components/TermsModal';
import CookieConsent from '@/components/CookieConsent';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accepted = localStorage.getItem('terms_accepted');
    if (!accepted) {
      setShowTerms(true);
    }
    setIsLoading(false);
  }, []);

  const handleAcceptTerms = () => {
    setShowTerms(false);
  };

  if (isLoading) {
    return (
      <html lang="tr" className="h-full w-full">
        <body className="min-h-screen w-full bg-gray-50 antialiased flex items-center justify-center">
          <div className="text-gray-500">Yükleniyor...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="tr" className="h-full w-full">
      <body className="min-h-screen w-full bg-gray-50 antialiased text-gray-900 overflow-x-hidden flex flex-col">
        {/* Terms Modal - İlk girişte zorunlu onay */}
        {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
        
        {/* Cookie Consent - Çerez onay popup'ı */}
        <CookieConsent />

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