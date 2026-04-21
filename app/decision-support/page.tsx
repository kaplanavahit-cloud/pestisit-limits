'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Country = {
  id: number;
  name: string;
  code: string;
};

type EvalResult = {
  id: string;
  product: string;
  pesticide: string;
  measured: number;
  country: Country;
  limit: number;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'BANNED' | 'ZERO_TOLERANCE' | 'NOT_FOUND';
  ratio: number;
  adjustedValue: number;
  measurementUncertainty: number;
  specialFlags: SpecialFlag[];
  isTurkeyBanned: boolean;
  isRussiaZero: boolean;
  isRussiaNoLimit: boolean;
};

type SpecialFlag = {
  type: 'turkey-banned' | 'russia-zero' | 'russia-no-limit';
  label: string;
};

type PastedRow = {
  product: string;
  pesticide: string;
  reportedLimit: number;
};

type ActiveTab = 'input' | 'report' | 'special';
type SpecialListTab = 'turkey-banned' | 'russia-zero' | 'russia-no-limit';

// ✅ Maksimum satır sınırı
const MAX_ROWS = 12;

export default function DecisionSupportPage() {
  const supabase = createClient();

  const [pasteData, setPasteData] = useState('');
  const [allResults, setAllResults] = useState<EvalResult[]>([]);
  const [hiddenResultIds, setHiddenResultIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState('');
  const [measurementUncertainty, setMeasurementUncertainty] = useState(50);
  const [useUncertainty, setUseUncertainty] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('input');
  const [specialListTab, setSpecialListTab] = useState<SpecialListTab>('turkey-banned');
  const [specialSearch, setSpecialSearch] = useState('');

  // Özel listeler
  const [turkeyBanned, setTurkeyBanned] = useState<string[]>([]);
  const [russiaZero, setRussiaZero] = useState<string[]>([]);
  const [russiaNoLimit, setRussiaNoLimit] = useState<string[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const FLAG: Record<string, string> = {
    TR: '🇹🇷', RU: '🇷🇺', EU: '🇪🇺', SA: '🇸🇦', CODEX: '📋',
  };
  const getFlag = (code?: string) => FLAG[code ?? ''] ?? '🌍';

  // Özel listeleri yükle
  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const [resTR, resRU0, resRUNL] = await Promise.all([
          fetch('/api/restricted-pesticides?listType=turkey-banned&source=custom'),
          fetch('/api/restricted-pesticides?listType=russia-zero-tolerance&source=custom'),
          fetch('/api/restricted-pesticides?listType=russia-no-limit&source=custom'),
        ]);
        const [dataTR, dataRU0, dataRUNL] = await Promise.all([
          resTR.ok ? resTR.json() : [],
          resRU0.ok ? resRU0.json() : [],
          resRUNL.ok ? resRUNL.json() : [],
        ]);
        setTurkeyBanned(Array.isArray(dataTR) ? dataTR.map((d: any) => d.pesticide_name ?? d.name ?? d) : []);
        setRussiaZero(Array.isArray(dataRU0) ? dataRU0.map((d: any) => d.pesticide_name ?? d.name ?? d) : []);
        setRussiaNoLimit(Array.isArray(dataRUNL) ? dataRUNL.map((d: any) => d.pesticide_name ?? d.name ?? d) : []);
      } catch (err) {
        console.error('Özel listeler yüklenemedi:', err);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const matchesList = useCallback((pesticide: string, list: string[]) => {
    const n = normalize(pesticide);
    return list.some(p => {
      const pn = normalize(p);
      return pn.includes(n) || n.includes(pn);
    });
  }, []);

  const getSpecialFlags = useCallback((pesticide: string): SpecialFlag[] => {
    const flags: SpecialFlag[] = [];
    if (matchesList(pesticide, turkeyBanned)) flags.push({ type: 'turkey-banned', label: '🇹🇷 TR Yasaklı' });
    if (matchesList(pesticide, russiaZero)) flags.push({ type: 'russia-zero', label: '⛔ RU Sıfır Tolerans' });
    if (matchesList(pesticide, russiaNoLimit)) flags.push({ type: 'russia-no-limit', label: '🔬 RU Limitsiz' });
    return flags;
  }, [turkeyBanned, russiaZero, russiaNoLimit, matchesList]);

  // AKILLI PARSE FONKSİYONU (12 satır sınırlı)
  const parseTableData = (text: string): PastedRow[] => {
    const lines = text.trim().split(/\r?\n/);
    const data: PastedRow[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      
      // ✅ 12 satır sınırı kontrolü
      if (data.length >= MAX_ROWS) {
        alert(`En fazla ${MAX_ROWS} satır veri işlenebilir. Fazla satırlar atlandı.`);
        break;
      }

      let parts: string[];
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      } else {
        parts = line.trim().split(/\s+/);
      }

      if (parts.length < 3) continue;

      const measured = parseFloat(parts[parts.length - 1].replace(',', '.'));
      if (isNaN(measured)) continue;

      let product: string;
      let pesticide: string;

      if (parts.length === 3) {
        product = parts[0];
        pesticide = parts[1];
      } else {
        const lastSecond = parts[parts.length - 2];
        const isSingleWordPesticide = !lastSecond.includes(' ') && !/[0-9]/.test(lastSecond);
        const commonPesticideEndings = ['thion', 'phos', 'zole', 'conazole', 'ectin', 'sulfate', 'ine', 'ate'];
        const looksLikePesticide = commonPesticideEndings.some(ending => 
          lastSecond.toLowerCase().endsWith(ending)
        );
        
        if (isSingleWordPesticide || looksLikePesticide) {
          pesticide = lastSecond;
          product = parts.slice(0, -2).join(' ');
        } else {
          product = parts[0];
          pesticide = parts.slice(1, -1).join(' ');
        }
      }

      data.push({ product, pesticide, reportedLimit: measured });
    }
    return data;
  };

  const searchLimits = async (product: string, pesticide: string) => {
    let query = supabase.from('country_limitsa').select('*, countriesa(id, name, code)');
    if (product.trim()) query = query.ilike('product_name', `%${product.trim()}%`);
    if (pesticide.trim()) query = query.ilike('pesticide_name', `%${pesticide.trim()}%`);
    const { data, error } = await query;
    if (error) return [];
    return data || [];
  };

  const handleAnalyze = async () => {
    if (!pasteData.trim()) {
      alert('Lütfen veriyi yapıştırın.');
      return;
    }
    const parsed = parseTableData(pasteData);
    if (!parsed.length) {
      alert('Veri formatı anlaşılamadı.');
      return;
    }
    
    // ✅ Satır sayısı kontrolü
    if (parsed.length > MAX_ROWS) {
      alert(`En fazla ${MAX_ROWS} satır analiz edilebilir. Lütfen verinizi ${MAX_ROWS} satır veya daha az olacak şekilde düzenleyin.`);
      return;
    }

    setLoading(true);
    setHiddenResultIds(new Set());
    const evalResults: EvalResult[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      setLoadStatus(`${i + 1}/${parsed.length} — "${row.product}" / "${row.pesticide}" sorgulanıyor...`);

      const specialFlags = getSpecialFlags(row.pesticide);
      const isTurkeyBanned = matchesList(row.pesticide, turkeyBanned);
      const isRussiaZero = matchesList(row.pesticide, russiaZero);
      const isRussiaNoLimit = matchesList(row.pesticide, russiaNoLimit);

      const limits = await searchLimits(row.product, row.pesticide);

      if (!limits.length) {
        evalResults.push({
          id: `${Date.now()}-${i}-notfound`,
          product: row.product,
          pesticide: row.pesticide,
          measured: row.reportedLimit,
          country: { id: 0, name: 'Veritabanında yok', code: 'NA' },
          limit: 0,
          adjustedValue: row.reportedLimit,
          measurementUncertainty: 0,
          status: 'NOT_FOUND',
          ratio: 0,
          specialFlags,
          isTurkeyBanned,
          isRussiaZero,
          isRussiaNoLimit,
        });
        continue;
      }

      // TÜM varyasyonları ekle (her ülke için ayrı satır)
      for (let idx = 0; idx < limits.length; idx++) {
        const limit = limits[idx];
        const country: Country = limit.countriesa || { id: 0, name: 'Bilinmiyor', code: 'XX' };
        const isRussia = country.code === 'RU';
        const isTurkey = country.code === 'TR';
        const isCodex = country.code === 'CODEX' || country.name?.toLowerCase().includes('codex');
        const numericMRL = Number(limit.mrl_value_numeric) || 0;

        if (isTurkey && isTurkeyBanned) {
          evalResults.push({
            id: `${Date.now()}-${i}-${idx}-banned`,
            product: limit.product_name,
            pesticide: limit.pesticide_name,
            measured: row.reportedLimit,
            country,
            limit: numericMRL,
            adjustedValue: row.reportedLimit,
            measurementUncertainty: 0,
            status: 'BANNED',
            ratio: 999,
            specialFlags,
            isTurkeyBanned,
            isRussiaZero,
            isRussiaNoLimit,
          });
          continue;
        }

        if (isRussia && isRussiaZero) {
          evalResults.push({
            id: `${Date.now()}-${i}-${idx}-zero`,
            product: limit.product_name,
            pesticide: limit.pesticide_name,
            measured: row.reportedLimit,
            country,
            limit: 0,
            adjustedValue: row.reportedLimit,
            measurementUncertainty: 0,
            status: 'ZERO_TOLERANCE',
            ratio: 999,
            specialFlags,
            isTurkeyBanned,
            isRussiaZero,
            isRussiaNoLimit,
          });
          continue;
        }

        // *** MEVZUATA UYGUN: Ölçüm Belirsizliği sonucun ALT limitine uygulanır ***
        // *** CODEX için ÖB uygulanmaz ***
        let adjustedValue = row.reportedLimit;
        let obPct = 0;
        let applyOB = useUncertainty && !isRussia && !isCodex;

        if (applyOB) {
          obPct = measurementUncertainty;
          adjustedValue = row.reportedLimit * (1 - obPct / 100); // ALT LİMİT: Ölçülen - ÖB
        }

        let status: EvalResult['status'] = 'PASS';
        let ratio = 0;
        
        if (numericMRL > 0) {
          ratio = adjustedValue / numericMRL;
          if (adjustedValue > numericMRL) {
            status = 'FAIL';
          } else if (adjustedValue > numericMRL * 0.8) {
            status = 'WARNING';
          }
        } else if (numericMRL === 0 && row.reportedLimit > 0) {
          status = 'FAIL';
          ratio = 999;
        }

        evalResults.push({
          id: `${Date.now()}-${i}-${idx}-normal`,
          product: limit.product_name,
          pesticide: limit.pesticide_name,
          measured: row.reportedLimit,
          country,
          limit: numericMRL,
          adjustedValue: adjustedValue,
          measurementUncertainty: obPct,
          status,
          ratio,
          specialFlags,
          isTurkeyBanned,
          isRussiaZero,
          isRussiaNoLimit,
        });
      }
    }

    setAllResults(evalResults);
    setLoading(false);
    setLoadStatus('');
    setActiveTab('report');
  };

  // Bir sonucu gizle (sadece görsel, veritabanından silme yok)
  const hideResult = (id: string) => {
    setHiddenResultIds(prev => new Set(prev).add(id));
  };

  // Tüm gizlenenleri geri getir
  const unhideAll = () => {
    setHiddenResultIds(new Set());
  };

  // Gizlenmeyen sonuçlar
  const visibleResults = useMemo(() => {
    return allResults.filter(r => !hiddenResultIds.has(r.id));
  }, [allResults, hiddenResultIds]);

  const clearAll = () => {
    setPasteData('');
    setAllResults([]);
    setHiddenResultIds(new Set());
    setLoadStatus('');
    setActiveTab('input');
  };

  const exportCSV = () => {
    const header = ['Ürün', 'Pestisit', 'Ölçülen (mg/kg)', 'Ülke', 'MRL (mg/kg)', 'ÖB ile Ölçüm (mg/kg)', 'ÖB (%)', 'Durum', 'Oran %', 'Özel Bayraklar'];
    const rows = visibleResults.map(r => [
      r.product, r.pesticide, r.measured,
      r.country.name, r.limit, r.adjustedValue.toFixed(3),
      r.measurementUncertainty,
      r.status, r.ratio > 0 ? (r.ratio * 100).toFixed(0) + '%' : '—',
      r.specialFlags.map(f => f.label).join(' | '),
    ]);
    const csv = [header, ...rows].map(row =>
      row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = `mrl-karar-destek-${Date.now()}.csv`;
    a.click();
  };

  const stats = useMemo(() => {
    if (!visibleResults.length) return null;
    const pass = visibleResults.filter(r => r.status === 'PASS').length;
    const warn = visibleResults.filter(r => r.status === 'WARNING').length;
    const fail = visibleResults.filter(r => ['FAIL', 'BANNED', 'ZERO_TOLERANCE'].includes(r.status)).length;
    const notFound = visibleResults.filter(r => r.status === 'NOT_FOUND').length;
    const total = visibleResults.length;
    const compliance = total > 0 ? Math.round((pass / total) * 100) : 0;
    const bannedCount = visibleResults.filter(r => r.isTurkeyBanned).length;
    const zeroCount = visibleResults.filter(r => r.isRussiaZero).length;
    const noLimitCount = visibleResults.filter(r => r.isRussiaNoLimit).length;
    return { pass, warn, fail, notFound, total, compliance, bannedCount, zeroCount, noLimitCount };
  }, [visibleResults]);

  const groupedResults = useMemo(() => {
    const map = new Map<string, EvalResult[]>();
    visibleResults.forEach(r => {
      const key = `${r.product}|||${r.pesticide}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [visibleResults]);

  const hiddenCount = allResults.length - visibleResults.length;

  const currentSpecialList = useMemo(() => {
    const lists: Record<SpecialListTab, { items: string[]; color: string; badge: string; description: string }> = {
      'turkey-banned': {
        items: turkeyBanned,
        color: 'orange',
        badge: 'bg-orange-100 text-orange-700',
        description: 'Türkiye\'de kullanımı yasaklanmış aktif maddeler. Bu maddeler hiçbir üründe tespit edilmemelidir.',
      },
      'russia-zero': {
        items: russiaZero,
        color: 'red',
        badge: 'bg-red-100 text-red-700',
        description: 'Rusya mevzuatına göre hiçbir üründe bulunmaması gereken, MRL = 0 olan maddeler.',
      },
      'russia-no-limit': {
        items: russiaNoLimit,
        color: 'purple',
        badge: 'bg-purple-100 text-purple-700',
        description: 'Rusya mevzuatına göre MRL belirlenmesine gerek olmayan, kısıtsız kullanılabilen maddeler.',
      },
    };
    return lists[specialListTab];
  }, [specialListTab, turkeyBanned, russiaZero, russiaNoLimit]);

  const filteredSpecialList = useMemo(() => {
    if (!specialSearch.trim()) return currentSpecialList.items;
    return currentSpecialList.items.filter(p => p.toLowerCase().includes(specialSearch.toLowerCase()));
  }, [currentSpecialList.items, specialSearch]);

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    PASS: { label: 'Uyumlu', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
    WARNING: { label: 'Uyarı', bg: 'bg-amber-100', text: 'text-amber-700', icon: '!' },
    FAIL: { label: 'Kaldı', bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
    BANNED: { label: 'Yasaklı', bg: 'bg-red-100', text: 'text-red-700', icon: '⛔' },
    ZERO_TOLERANCE: { label: 'Sıfır Tol.', bg: 'bg-red-100', text: 'text-red-700', icon: '0' },
    NOT_FOUND: { label: 'Bulunamadı', bg: 'bg-gray-100', text: 'text-gray-500', icon: '?' },
  };

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-xl transition-all duration-200 ${
      activeTab === t
        ? 'bg-white text-emerald-600 border border-b-white border-gray-200 shadow-sm -mb-px'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Karar Destek Sistemi</h1>
              <p className="text-xs text-gray-500">MRL Uyumluluk Analizi — Çok Ülke & Özel Liste Entegrasyonu</p>
            </div>
          </div>
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-all duration-200 shadow-sm text-sm">
              ← Ana Sayfa
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-0 border-b border-gray-200">
          <button className={tabClass('input')} onClick={() => setActiveTab('input')}>
            📋 Veri Girişi
          </button>
          <button
            className={tabClass('report')}
            onClick={() => setActiveTab('report')}
            disabled={allResults.length === 0}
          >
            📊 Analiz Raporu {visibleResults.length > 0 && `(${visibleResults.length})`}
            {hiddenCount > 0 && <span className="ml-1 text-xs text-gray-400">+{hiddenCount} gizli</span>}
          </button>
          <button className={tabClass('special')} onClick={() => setActiveTab('special')}>
            🔖 Özel Listeler
          </button>
        </div>

        {/* ===== TAB: VERİ GİRİŞİ ===== */}
        {activeTab === 'input' && (
          <div className="pt-6 space-y-5">
            {/* Ölçüm Belirsizliği (ÖB) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-base">⚖️</div>
                  <span className="text-sm font-medium text-gray-700">Ölçüm Belirsizliği (ÖB)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={useUncertainty}
                    onChange={e => setUseUncertainty(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 border-gray-300 focus:ring-emerald-200"
                  />
                  Aktif
                </label>
                {useUncertainty && (
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="10" max="100" step="5"
                      value={measurementUncertainty}
                      onChange={e => setMeasurementUncertainty(Number(e.target.value))}
                      className="w-28 accent-emerald-500"
                    />
                    <span className="text-sm font-semibold text-gray-800 min-w-[36px]">%{measurementUncertainty}</span>
                  </div>
                )}
                <span className="text-xs text-gray-400 ml-auto">💡 ÖB sonucun ALT limitine uygulanır (mevzuata uygun) - Rusya ve CODEX hariç</span>
              </div>
            </div>

            {/* Yapıştırma Alanı */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Laboratuvar Sonuçlarını Yapıştır</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sekme veya boşlukla ayrılmış tablo verilerini kopyalayın</p>
              </div>
              <div className="p-6">
                <textarea
                  value={pasteData}
                  onChange={e => setPasteData(e.target.value)}
                  placeholder={`Örnek format (3 sütun: Ürün | Pestisit | Değer):

citrus frut	malathion	10
apple	glyphosate	0.05
wheat	chlorpyrifos	0.02

⚠️ EN FAZLA ${MAX_ROWS} SATIR ANALİZ EDİLEBİLİR
💡 Ürün adı birden fazla kelimeyken SEKME (Tab) kullanın
💡 Tüm veritabanı varyasyonları gösterilir, yanlış eşleşmeyi X ile kaldırabilirsiniz
💡 ÖB, sonucun ALT limitine uygulanır (Ölçülen - ÖB). CODEX ve Rusya'ya uygulanmaz.`}
                  className="w-full h-44 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                />

                {loadStatus && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {loadStatus}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !pasteData.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analiz Ediliyor...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">⚡ Analizi Başlat</span>
                    )}
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 text-sm"
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: ANALİZ RAPORU ===== */}
        {activeTab === 'report' && stats && (
          <div className="pt-6 space-y-5">

            {/* Özet Kartlar */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: 'Toplam', value: stats.total, icon: '📊', color: 'text-gray-900' },
                { label: 'Uyumlu', value: stats.pass, icon: '✅', color: 'text-emerald-600' },
                { label: 'Uyarı', value: stats.warn, icon: '⚠️', color: 'text-amber-600' },
                { label: 'Uyumsuz', value: stats.fail, icon: '❌', color: 'text-red-600' },
                { label: 'Uyumluluk', value: `${stats.compliance}%`, icon: '📈', color: stats.compliance >= 80 ? 'text-emerald-600' : stats.compliance >= 50 ? 'text-amber-600' : 'text-red-600' },
                { label: 'Gizli', value: hiddenCount, icon: '🙈', color: 'text-gray-500' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Gizlenenleri geri getir butonu */}
            {hiddenCount > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={unhideAll}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition-colors"
                >
                  🔄 Tüm gizlenenleri göster ({hiddenCount})
                </button>
              </div>
            )}

            {/* Detaylı Sonuçlar */}
            {Array.from(groupedResults.entries()).map(([key, results]) => {
              const [product, pesticide] = key.split('|||');
              const hasFail = results.some(r => ['FAIL', 'BANNED', 'ZERO_TOLERANCE'].includes(r.status));
              const hasWarn = results.some(r => r.status === 'WARNING');
              const flags = results[0]?.specialFlags ?? [];

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className={`px-5 py-4 border-b flex items-center gap-3 flex-wrap ${
                    hasFail ? 'bg-red-50 border-red-100' : hasWarn ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <span className="text-xl">{hasFail ? '❌' : hasWarn ? '⚠️' : '✅'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{product}</h3>
                      <p className="text-xs text-gray-500">{pesticide}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {flags.map(f => (
                        <span key={f.type} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          f.type === 'turkey-banned' ? 'bg-orange-100 text-orange-700' :
                          f.type === 'russia-zero' ? 'bg-red-100 text-red-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>{f.label}</span>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-100">
                        <tr className="bg-gray-50">
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 w-8"></th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Ülke</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">MRL (mg/kg)</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Ölçülen (mg/kg)</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">ÖB ile Ölçüm (mg/kg)</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Durum</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">MRL Kullanımı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results.map((r) => {
                          const cfg = statusConfig[r.status];
                          const ratioPercent = Math.min((r.ratio ?? 0) * 100, 150);
                          const barColor =
                            r.status === 'PASS' ? '#10b981' :
                            r.status === 'WARNING' ? '#f59e0b' : '#ef4444';

                          return (
                            <tr
                              key={r.id}
                              className={`transition-colors hover:bg-gray-50 ${
                                ['FAIL', 'BANNED', 'ZERO_TOLERANCE'].includes(r.status) ? 'bg-red-50/40' :
                                r.status === 'WARNING' ? 'bg-amber-50/40' : ''
                              }`}
                            >
                              <td className="px-3 py-3">
                                <button
                                  onClick={() => hideResult(r.id)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                  title="Bu sonucu gizle (veritabanından silmez)"
                                >
                                  ✕
                                </button>
                                </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className="mr-1.5">{getFlag(r.country.code)}</span>
                                <span className="font-medium text-gray-800">{r.country.name}</span>
                               </td>
                              <td className="px-5 py-3 font-mono text-gray-700">
                                {r.status === 'ZERO_TOLERANCE' ? (
                                  <span className="text-red-600 font-semibold">0.000</span>
                                ) : r.status === 'BANNED' ? (
                                  <span className="text-red-600 font-semibold">Yasaklı</span>
                                ) : r.status === 'NOT_FOUND' ? (
                                  <span className="text-gray-400">—</span>
                                ) : (
                                  <>{r.limit.toFixed(3)}</>
                                )}
                               </td>
                              <td className="px-5 py-3 font-mono text-gray-700">
                                {r.measured.toFixed(3)}
                              </td>
                              <td className="px-5 py-3">
                                {r.measurementUncertainty > 0 ? (
                                  <div>
                                    <span className="font-mono text-amber-700 font-semibold">{r.adjustedValue.toFixed(3)}</span>
                                    <div className="text-xs text-gray-400">±{r.measurementUncertainty}% ÖB</div>
                                    <div className="text-xs text-gray-400">Alt limit: Ölçülen - ÖB</div>
                                  </div>
                                ) : (
                                  <span className="font-mono text-gray-700">{r.measured.toFixed(3)}</span>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                                  {cfg.icon} {cfg.label}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {r.status !== 'NOT_FOUND' && r.limit > 0 ? (
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(ratioPercent, 100)}%`, backgroundColor: barColor }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500 w-10 text-right font-mono">
                                      {ratioPercent.toFixed(0)}%
                                    </span>
                                  </div>
                                ) : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Alt Butonlar */}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setActiveTab('input')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 rounded-xl text-sm transition-all duration-200 shadow-sm"
              >
                🔄 Yeni Analiz
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 rounded-xl text-sm transition-all duration-200 shadow-sm"
              >
                ⬇ CSV İndir
              </button>
            </div>
          </div>
        )}

        {/* ===== TAB: ÖZEL LİSTELER ===== */}
        {activeTab === 'special' && (
          <div className="pt-6 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'turkey-banned' as SpecialListTab, icon: '🇹🇷', label: 'Türkiye Yasaklı', count: turkeyBanned.length, color: 'orange' },
                { key: 'russia-zero' as SpecialListTab, icon: '⛔', label: 'Rusya Sıfır Tolerans', count: russiaZero.length, color: 'red' },
                { key: 'russia-no-limit' as SpecialListTab, icon: '🔬', label: 'Rusya Limitsiz', count: russiaNoLimit.length, color: 'purple' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => { setSpecialListTab(item.key); setSpecialSearch(''); }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                    specialListTab === item.key
                      ? item.color === 'orange' ? 'bg-orange-50 border-orange-300'
                        : item.color === 'red' ? 'bg-red-50 border-red-300'
                        : 'bg-purple-50 border-purple-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-semibold text-sm text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {loadingLists ? 'Yükleniyor...' : `${item.count} madde`}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-5 py-4 border-b ${
                specialListTab === 'turkey-banned' ? 'bg-orange-50 border-orange-100' :
                specialListTab === 'russia-zero' ? 'bg-red-50 border-red-100' :
                'bg-purple-50 border-purple-100'
              }`}>
                <p className="text-sm text-gray-600">{currentSpecialList.description}</p>
              </div>
              <div className="p-5">
                <input
                  type="text"
                  value={specialSearch}
                  onChange={e => setSpecialSearch(e.target.value)}
                  placeholder="Pestisit adı ara..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all mb-4"
                />
                {loadingLists ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    <svg className="animate-spin h-6 w-6 text-emerald-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Liste yükleniyor...
                  </div>
                ) : filteredSpecialList.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    {specialSearch ? 'Eşleşme bulunamadı' : 'Liste boş veya yüklenemedi'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {filteredSpecialList.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                          specialListTab === 'turkey-banned' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                          specialListTab === 'russia-zero' ? 'bg-red-50 border-red-100 text-red-800' :
                          'bg-purple-50 border-purple-100 text-purple-800'
                        }`}
                      >
                        <span className="text-xs opacity-60">•</span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {filteredSpecialList.length} / {currentSpecialList.items.length} madde gösteriliyor
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}