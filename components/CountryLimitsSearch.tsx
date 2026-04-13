// components/CountryLimitsSearch.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Limit {
  id: string;
  product_name: string;
  pesticide_name: string;
  mrl_value: number;
  unit: string;
  note?: string;
}

interface CountryLimitsSearchProps {
  countryId: string;
  countryName: string;
}

export default function CountryLimitsSearch({ countryId, countryName }: CountryLimitsSearchProps) {
  const [limits, setLimits] = useState<Limit[]>([]);
  const [filteredLimits, setFilteredLimits] = useState<Limit[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchPesticide, setSearchPesticide] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  // Ülke değiştiğinde tüm limitleri yükle
  useEffect(() => {
    loadAllLimits();
  }, [countryId]);

  const loadAllLimits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('country_limits')
      .select('id, product_name, pesticide_name, mrl_value, unit, note')
      .eq('country_id', countryId)
      .order('product_name');

    if (error) {
      console.error('Limitler yüklenemedi:', error);
      setLimits([]);
    } else {
      setLimits(data || []);
    }
    setLoading(false);
    setFilteredLimits([]);
    setHasSearched(false);
  };

  // Arama işlemi - Bu ülkenin kendi verileri üzerinde
  const handleSearch = async () => {
    if (!searchProduct.trim() && !searchPesticide.trim()) {
      setFilteredLimits([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    
    let query = supabase
      .from('country_limits')
      .select('id, product_name, pesticide_name, mrl_value, unit, note')
      .eq('country_id', countryId);

    // Ürün adına göre filtre (case-insensitive, tam eşleşme değil içerme)
    if (searchProduct.trim()) {
      query = query.ilike('product_name', `%${searchProduct.trim()}%`);
    }

    // Pestisit adına göre filtre
    if (searchPesticide.trim()) {
      query = query.ilike('pesticide_name', `%${searchPesticide.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Arama hatası:', error);
      setFilteredLimits([]);
    } else {
      setFilteredLimits(data || []);
    }
    
    setHasSearched(true);
    setLoading(false);
  };

  // Otomatik tamamlama için benzersiz değerler (mevcut limitlerden)
  const uniqueProducts = useMemo(() => {
    return [...new Set(limits.map(item => item.product_name))].sort();
  }, [limits]);

  const uniquePesticides = useMemo(() => {
    return [...new Set(limits.map(item => item.pesticide_name))].sort();
  }, [limits]);

  // Enter tuşu ile arama
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading && limits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bilgi kartı */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          <strong>{countryName}</strong> veritabanında toplam <strong>{limits.length}</strong> limit kaydı bulunmaktadır.
          Bu arama sadece bu ülkeye ait veriler üzerinde yapılır.
        </p>
      </div>

      {/* Arama formu */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı
            </label>
            <input
              type="text"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Örn: ${uniqueProducts.slice(0, 3).join(', ')}`}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              list="country-products"
            />
            <datalist id="country-products">
              {uniqueProducts.map(product => (
                <option key={product} value={product} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pestisit Adı
            </label>
            <input
              type="text"
              value={searchPesticide}
              onChange={(e) => setSearchPesticide(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Örn: ${uniquePesticides.slice(0, 3).join(', ')}`}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              list="country-pesticides"
            />
            <datalist id="country-pesticides">
              {uniquePesticides.map(pesticide => (
                <option key={pesticide} value={pesticide} />
              ))}
            </datalist>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-medium"
        >
          {countryName} İçinde Ara
        </button>

        {(searchProduct || searchPesticide) && (
          <button
            onClick={() => {
              setSearchProduct('');
              setSearchPesticide('');
              setFilteredLimits([]);
              setHasSearched(false);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Sonuçlar */}
      {hasSearched && (
        <div>
          <h3 className="font-semibold text-lg mb-3">
            Sonuçlar ({filteredLimits.length} kayıt)
          </h3>

          {filteredLimits.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pestisit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">MRL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLimits.map((limit) => (
                    <tr key={limit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{limit.product_name}</td>
                      <td className="px-4 py-2 text-sm">{limit.pesticide_name}</td>
                      <td className="px-4 py-2 text-sm text-right font-mono">{limit.mrl_value}</td>
                      <td className="px-4 py-2 text-sm">{limit.unit}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{limit.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg border">
              <p className="text-gray-500">
                &quot;{searchProduct || searchPesticide}&quot; için {countryName} verilerinde kayıt bulunamadı.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Not: Lütfen {countryName} veritabanında kullanılan orijinal yazımla arama yapınız.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}