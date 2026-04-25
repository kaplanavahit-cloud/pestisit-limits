// app/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import TermsModal from '@/components/TermsModal';
import CookieConsent from '@/components/CookieConsent';
import LastUpdateBadge from '@/components/LastUpdateBadge';
import FeedbackFloatingButton from '@/components/FeedbackFloatingButton';
import "./globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showTerms, setShowTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Cookie'den terms kontrolü
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const cookieAccepted = getCookie('terms_accepted');
        const localStorageAccepted = localStorage.getItem('terms_accepted');

        // Eğer daha önce kabul edilmemişse modal göster
        if (!cookieAccepted && !localStorageAccepted) {
            setShowTerms(true);
        }
        setIsLoading(false);
    }, []);

    const handleAcceptTerms = () => {
        // Cookie ve localStorage'a kaydet
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `terms_accepted=true; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
        localStorage.setItem('terms_accepted', 'true');
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

                {/* Ana içerik alanı */}
                <main className="flex-grow w-full">
                    <LastUpdateBadge />
                    <FeedbackFloatingButton />
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-500">
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/terms"
                                    className="hover:text-blue-600 hover:underline transition-colors"
                                >
                                    Kullanıcı Sözleşmesi
                                </Link>
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <Link
                                    href="/privacy"
                                    className="hover:text-blue-600 hover:underline transition-colors"
                                >
                                    Gizlilik Politikası
                                </Link>
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <Link
                                    href="/changelog"
                                    className="hover:text-green-600 hover:underline transition-colors"
                                >
                                    📋 Güncelleme Geçmişi
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