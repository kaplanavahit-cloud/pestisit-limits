// components/DataViewer.tsx

'use client';

import { useState, useEffect } from 'react';

interface CountryLimit {
  id: number;
  country_id: number;
  pesticide_name: string;
  product_name: string;
  mrl_value_numeric: number;
  mrl_value_text: string;
  unit: string;
  source_year: number;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

export default function DataViewer() {
  const [data, setData] = useState<CountryLimit[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Ülkeleri yükle
  useEffect(() => {
    fetch('/api/countries-list')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setCountries(result.data);
        }
      })
      .catch(err => console.error('Countries error:', err));
  }, []);

  // Verileri yükle
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '/api/countries';
      const params = new URLSearchParams();
      
      if (selectedCountry) {
        params.append('country_id', selectedCountry.toString());
      }
      if (searchTerm) {
        params.append('pesticide_name', searchTerm);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (response.status === 429) {
        setError('Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin.');
        setData([]);
      } else if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Veri yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCountry]); // searchTerm değişince otomatik yükleme istersen ekle

  // Arama butonu için manuel yükleme
  const handleSearch = () => {
    fetchData();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pestisit Limitleri</h1>
      
      {/* Filtreler */}
      <div className="flex gap-4 mb-4">
        <select 
          className="border p-2 rounded"
          value={selectedCountry || ''}
          onChange={(e) => setSelectedCountry(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Tüm Ülkeler</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Pestisit adı ara..."
          className="border p-2 rounded flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSearch}
        >
          Ara
        </button>
      </div>
      
      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Yükleniyor */}
      {loading && (
        <div className="text-center py-8">Yükleniyor...</div>
      )}
      
      {/* Veri tablosu */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Pestisit</th>
                <th className="border p-2">Ürün</th>
                <th className="border p-2">MRL Değeri</th>
                <th className="border p-2">Birim</th>
                <th className="border p-2">Yıl</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Veri bulunamadı
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td className="border p-2">{item.pesticide_name}</td>
                    <td className="border p-2">{item.product_name}</td>
                    <td className="border p-2">{item.mrl_value_text || item.mrl_value_numeric}</td>
                    <td className="border p-2">{item.unit}</td>
                    <td className="border p-2">{item.source_year}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}