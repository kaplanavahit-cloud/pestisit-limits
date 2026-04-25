// components/CountryDetailModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import CountryLimitsSearch from './CountryLimitsSearch';

interface CountryDetailModalProps {
    countryId: string;
    onClose: () => void;
}

interface CountryInfo {
    id: string;
    name: string;
    flag_emoji?: string;
    description?: string;
}

export default function CountryDetailModal({ countryId, onClose }: CountryDetailModalProps) {
    const [country, setCountry] = useState<CountryInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchCountryInfo();
    }, [countryId]);

    const fetchCountryInfo = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('countries')
            .select('id, name, flag_emoji, description')
            .eq('id', countryId)
            .single();

        if (!error && data) {
            setCountry(data);
        }
        setLoading(false);
    };

    // Modal'ı kapatmak için ESC tuşu
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto animate-slide-in">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{country?.flag_emoji || '🌍'}</span>
                        <h2 className="text-xl font-bold">
                            {loading ? 'Yükleniyor...' : country?.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {!loading && country && (
                        <CountryLimitsSearch countryId={countryId} countryName={country.name} />
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </>
    );
}