'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function TurkeyBannedPage() {
  const [pesticides, setPesticides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/restricted-pesticides?listType=turkey-banned&source=custom');
      const data = await res.json();
      setPesticides(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredPesticides = pesticides.filter(p => 
    p.pesticide_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          ← Ana Sayfaya Dön
        </Link>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🇹🇷</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Türkiye Yasaklı Pestisitler</h1>
                <p className="text-sm text-gray-500 mt-1">Türkiye'de kullanımı sonlandırılan yasaklı pestisitlerin tam listesi</p>
              </div>
              <span className="ml-auto text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                {pesticides.length} pestisit
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="relative mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Pestisit adı ile ara..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            
            {loading ? (
              <div className="text-center py-20">Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPesticides.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-700 border border-gray-100">
                    {item.pesticide_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}