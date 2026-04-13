'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [products, setProducts] = useState<string[]>([]);
  const [pesticides, setPesticides] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPesticide, setSelectedPesticide] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('EU');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      setProducts([]);
    }
  };

  const fetchPesticides = async (product: string) => {
    setSelectedProduct(product);
    setSelectedPesticide('');
    setPesticides([]);
    setResult(null);
    
    if (!product) return;
    
    try {
      const res = await fetch(`/api/pesticides?product=${encodeURIComponent(product)}`);
      const data = await res.json();
      setPesticides(data || []);
    } catch (error) {
      console.error('Pestisitler yüklenemedi:', error);
      setPesticides([]);
    }
  };

  const checkLimit = async () => {
    if (!selectedProduct || !selectedPesticide || !analysisResult) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          pesticide: selectedPesticide,
          analysisResult: parseFloat(analysisResult),
          country: selectedCountry
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Kontrol hatası:', error);
      alert('Kontrol yapılırken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const getResultClass = () => {
    switch(result?.status) {
      case 'pass': return 'bg-green-100 border-green-500 text-green-800';
      case 'fail': return 'bg-red-100 border-red-500 text-red-800';
      case 'no_limit': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'unknown': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getResultTitle = () => {
    switch(result?.status) {
      case 'pass': return '✅ UYGUN';
      case 'fail': return '❌ UYGUN DEĞİL';
      case 'no_limit': return 'ℹ️ LİMİT YOK';
      case 'unknown': return '❓ BİLİNMİYOR';
      default: return '⚠️ HATA';
    }
  };

  const countryNames: any = { EU: 'Avrupa Birliği', RU: 'Rusya', TR: 'Türkiye' };

  const getLimitDisplay = (code: string, data: any) => {
    const limit = data?.[`${code.toLowerCase()}_limit`];
    const status = data?.[`${code.toLowerCase()}_status`];
    
    if (status === 'no_mrl_required' || limit === -1) return 'Limit Yok ✓';
    if (limit === null || limit === undefined) return '-';
    return `${limit} mg/kg`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
          🧪 Pestisit Limit Kontrol
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Veritabanından ürün ve pestisit seçin
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-sm text-blue-800">
            <strong>📋 Nasıl Kullanılır:</strong>
            <br />1. Ürün seçin (dropdown'dan)
            <br />2. Pestisit seçin (otomatik dolar)
            <br />3. Analiz sonucunu girin (mg/kg)
            <br />4. Ülke seçin ve Kontrol Et'e basın
          </p>
        </div>

        <div className="space-y-5">
          {/* ÜRÜN SEÇİMİ */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🍎 Adım 1: Ürün Seçin
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => fetchPesticides(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- Ürün Seçin --</option>
              {products.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Toplam {products.length} ürün veritabanında
            </p>
          </div>

          {/* PESTISIT SEÇİMİ */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ☠️ Adım 2: Pestisit Seçin
            </label>
            <select
              value={selectedPesticide}
              onChange={(e) => {
                setSelectedPesticide(e.target.value);
                setResult(null);
              }}
              disabled={!selectedProduct || pesticides.length === 0}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedProduct 
                  ? 'Önce ürün seçin...' 
                  : pesticides.length === 0 
                    ? 'Yükleniyor...' 
                    : '-- Pestisit Seçin --'
                }
              </option>
              {pesticides.map((p, idx) => (
                <option key={idx} value={p.pesticide}>{p.pesticide}</option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-xs text-gray-500 mt-1">
                Bu üründe {pesticides.length} pestisit kaydı var
              </p>
            )}
          </div>

          {/* ANALİZ SONUCU */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔬 Adım 3: Analiz Sonucunu Girin (mg/kg)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={analysisResult}
              onChange={(e) => setAnalysisResult(e.target.value)}
              placeholder="Örn: 0.05"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ÜLKE SEÇİMİ */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📊 Adım 4: Ülke Seçin
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['EU', 'RU', 'TR'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`p-3 rounded-lg font-bold text-sm md:text-base transition-all border-2 ${
                    selectedCountry === c
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {c === 'EU' && '🇪🇺 AB'}
                  {c === 'RU' && '🇷🇺 Rusya'}
                  {c === 'TR' && '🇹🇷 Türkiye'}
                </button>
              ))}
            </div>
          </div>

          {/* KONTROL BUTONU */}
          <button
            onClick={checkLimit}
            disabled={loading || !selectedProduct || !selectedPesticide || !analysisResult}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Kontrol Ediliyor...' : '🔍 Kontrol Et'}
          </button>

          {/* SONUÇ */}
          {result && (
            <div className={`p-6 rounded-lg border-2 ${getResultClass()} animate-pulse`}>
              <h3 className="text-2xl font-bold mb-2">{getResultTitle()}</h3>
              <p className="text-lg mb-2">
                <strong>{countryNames[result.country]}:</strong> {result.message}
              </p>
              {result.limit !== null && result.limit !== -1 && (
                <p className="text-sm">
                  Limit: {result.limit} mg/kg | Analiz: {result.analysisResult} mg/kg
                </p>
              )}
            </div>
          )}

          {/* TÜM LİMİTLER TABLOSU */}
          {selectedPesticide && pesticides.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-700 mb-3 text-lg">
                📋 {selectedPesticide} - Tüm Ülke Limitleri
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['EU', 'RU', 'TR'].map((code) => {
                  const data = pesticides.find(p => p.pesticide === selectedPesticide);
                  const display = getLimitDisplay(code, data);
                  const isSelected = selectedCountry === code;
                  
                  return (
                    <div 
                      key={code} 
                      className={`p-4 rounded-lg text-center border-2 transition-all ${
                        isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      } ${
                        code === 'EU' ? 'bg-blue-100 border-blue-400' :
                        code === 'RU' ? 'bg-pink-100 border-pink-400' :
                        'bg-green-100 border-green-400'
                      }`}
                    >
                      <div className="font-bold text-gray-600 mb-1">
                        {code === 'EU' && '🇪🇺 Avrupa Birliği'}
                        {code === 'RU' && '🇷🇺 Rusya'}
                        {code === 'TR' && '🇹🇷 Türkiye'}
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {display}
                      </div>
                      {isSelected && (
                        <div className="text-xs text-blue-600 mt-1 font-bold">
                          ✓ Seçili Ülke
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}