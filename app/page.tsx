'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import InfoCard from '@/components/InfoCard';
// ─── Ürün → Kategori eşleme haritası ───────────────────────────
const PRODUCT_CATEGORY_MAP: Record<string, string[]> = {
    // ==================== STONE FRUITS ====================
    apricot: ['Stone fruits', 'Stone fruits (group)', 'fruit stone fruit', 'soft and stone fruits', 'Apricots'],
    peach: ['Stone fruits', 'Stone fruits (group)', 'fruit stone fruit', 'soft and stone fruits', 'Peaches'],
    nectarine: ['Stone fruits', 'Stone fruits (group)', 'fruit stone fruit', 'Nectarines'],
    plum: ['Stone fruits', 'Stone fruits (group)', 'fruit stone fruit', 'Plums'],
    cherry: ['Stone fruits', 'Stone fruits (group)', 'Cherries'],
    sour_cherry: ['Stone fruits', 'Stone fruits (group)', 'Cherries', 'Sour cherries'], // ✅ EKLENDI
    persimmon: ['Stone fruits', 'Persimmons', 'Tropical fruits'], // ✅ EKLENDI
    mango: ['Stone fruits', 'Tropical fruits', 'Mangoes'],
    lychee: ['Stone fruits', 'Tropical fruits', 'Lychees'],
    date: ['Stone fruits', 'Dates'],
    olive: ['Stone fruits', 'Olives'],

    // ==================== POME FRUITS ====================
    apple: ['Pome fruits', 'Pome fruits (group)', 'fruit pome fruit', 'pome fruit and stone fruit', 'Apples'],
    pear: ['Pome fruits', 'Pome fruits (group)', 'fruit pome fruit', 'Pears'],
    quince: ['Pome fruits', 'Quinces'],
    loquat: ['Pome fruits', 'Stone fruits', 'Loquats'], // ✅ EKLENDI
    medlar: ['Pome fruits', 'Medlars'],

    // ==================== CITRUS ====================
    orange: ['Citrus fruits', 'Citrus fruits (group)', 'Oranges'],
    lemon: ['Citrus fruits', 'Citrus fruits (group)', 'Lemons'],
    lime: ['Citrus fruits', 'Citrus fruits (group)', 'Limes'],
    grapefruit: ['Citrus fruits', 'Citrus fruits (group)', 'Grapefruits'],
    mandarin: ['Citrus fruits', 'Citrus fruits (group)', 'Mandarins', 'Tangerines'],
    tangerine: ['Citrus fruits', 'Citrus fruits (group)', 'Tangerines', 'Mandarins'],
    clementine: ['Citrus fruits', 'Citrus fruits (group)', 'Clementines', 'Mandarins'],
    bergamot: ['Citrus fruits', 'Citrus fruits (group)', 'Bergamots'], // ✅ EKLENDI
    bitter_orange: ['Citrus fruits', 'Citrus fruits (group)', 'Bitter oranges'], // ✅ EKLENDI
    kumquat: ['Citrus fruits', 'Kumquats'],
    pomelo: ['Citrus fruits', 'Pomelo', 'Citrus fruits (group)'],

    // ==================== SOFT SEEDED / BERRIES ====================
    strawberry: ['Soft-seeded fruits', 'Soft-seeded', 'soft-seeded-fruit', 'soft seeded fruit', 'fruit with soft seeds', 'Berries and small fruits', 'Strawberries'],
    raspberry: ['Soft-seeded fruits', 'Soft-seeded', 'Berries and small fruits', 'Raspberries'],
    blackberry: ['Soft-seeded fruits', 'Soft-seeded', 'Berries and small fruits', 'Blackberries'],
    blueberry: ['Soft-seeded fruits', 'Soft-seeded', 'Berries and small fruits', 'Blueberries'],
    cranberry: ['Soft-seeded fruits', 'Soft-seeded', 'Berries and small fruits', 'Cranberries'],
    grape: ['Soft-seeded fruits', 'Soft-seeded', 'Berries and small fruits', 'Grapes', 'Table grapes', 'Wine grapes'],
    fig: ['Soft-seeded fruits', 'Soft-seeded', 'fruit with soft seeds', 'Figs'],
    mulberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Mulberries'], // ✅ EKLENDI
    pomegranate: ['Soft-seeded fruits', 'Pomegranates'], // ✅ EKLENDI
    rosehip: ['Soft-seeded fruits', 'Berries and small fruits', 'Rose hips'], // ✅ EKLENDI
    goji_berry: ['Soft-seeded fruits', 'Berries and small fruits', 'Goji berries'], // ✅ EKLENDI
    gooseberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Gooseberries'],
    currant: ['Soft-seeded fruits', 'Berries and small fruits', 'Currants'],
    elderberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Elderberries'],

    // ==================== TROPICAL & EXOTIC ====================
    banana: ['Tropical fruits', 'FRESH OR FROZEN FRUITS', 'Bananas'],
    pineapple: ['Tropical fruits', 'FRESH OR FROZEN FRUITS', 'Pineapples'],
    papaya: ['Tropical fruits', 'FRESH OR FROZEN FRUITS', 'Papayas'],
    avocado: ['Tropical fruits', 'FRESH OR FROZEN FRUITS', 'Avocados'],
    kiwi: ['Tropical fruits', 'FRESH OR FROZEN FRUITS', 'Kiwis', 'Kiwifruit'],
    guava: ['Tropical fruits', 'FRESH OR FROZEN FRUITS', 'Guavas'],
    star_fruit: ['Tropical fruits', 'Carambola'], // ✅ EKLENDI
    physalis: ['Tropical fruits', 'Berries and small fruits', 'Physalis'], // ✅ EKLENDI
    passion_fruit: ['Tropical fruits', 'Soft-seeded fruits', 'Passion fruit'], // ✅ EKLENDI
    dragonfruit: ['Tropical fruits', 'Dragon fruit'],
    mangosteen: ['Tropical fruits', 'Mangosteens'],
    durian: ['Tropical fruits', 'Durians'],
    jackfruit: ['Tropical fruits', 'Jackfruits'],
    breadfruit: ['Tropical fruits', 'Breadfruits'],
    okra: ['Tropical fruits', 'Okra'], // ✅ EKLENDI

    // ==================== CUCURBITS (KABAKGİLLER) ====================
    melon: ['Cucurbit fruits', 'Melons'], // ✅ EKLENDI
    watermelon: ['Cucurbit fruits', 'Watermelons'], // ✅ EKLENDI
    pumpkin: ['Cucurbit fruits', 'Pumpkins'], // ✅ EKLENDI
    cucumber: ['Cucurbit fruits', 'Cucumbers'],
    zucchini: ['Cucurbit fruits', 'Courgettes', 'Zucchinis'],

    // ==================== HARD SHELL (NUTS) ====================
    almond: ['Fruits with hard shells', 'hard-seeded', 'NUTS WITH HARD SHELLS', 'Tree nuts', 'Almonds'],
    walnut: ['Fruits with hard shells', 'hard-seeded', 'NUTS WITH HARD SHELLS', 'Tree nuts', 'Walnuts'],
    hazelnut: ['Fruits with hard shells', 'hard-seeded', 'NUTS WITH HARD SHELLS', 'Tree nuts', 'Hazelnuts', 'Cobnuts'],
    pistachio: ['Fruits with hard shells', 'hard-seeded', 'NUTS WITH HARD SHELLS', 'Tree nuts', 'Pistachios'],
    cashew: ['Fruits with hard shells', 'NUTS WITH HARD SHELLS', 'Tree nuts', 'Cashews'],
    chestnut: ['Fruits with hard shells', 'NUTS WITH HARD SHELLS', 'Tree nuts', 'Chestnuts'],
    pecan: ['Fruits with hard shells', 'Tree nuts', 'Pecans'],
    pecan_nut: ['Fruits with hard shells', 'Pecans'], // ✅ EKLENDI
    macadamia: ['Fruits with hard shells', 'Tree nuts', 'Macadamias'],
    brazilnut: ['Fruits with hard shells', 'Tree nuts', 'Brazil nuts'],
    pine_nut: ['Fruits with hard shells', 'Tree nuts', 'Pine nuts'],
    peanut: ['Fruits with hard shells', 'Peanuts'], // ✅ EKLENDI
    coconut: ['Fruits with hard shells', 'Coconuts'],

    // ==================== FRESH OR FROZEN (GENEL FALLBACK) ====================
    fruit: ['FRESH OR FROZEN FRUITS', 'fruit (soft-core and hard-core)', 'fruit (soft and hard-shelled)'],
    berry: ['Berries and small fruits', 'Soft-seeded fruits', 'soft-seeded-fruit'],
};

// Arama metninden ilgili kategorileri döndürür
function getRelatedCategories(searchTerm: string): string[] {
    const lower = searchTerm.toLowerCase().trim();
    const categories = new Set<string>();

    for (const [keyword, cats] of Object.entries(PRODUCT_CATEGORY_MAP)) {
        if (lower.includes(keyword) || keyword.includes(lower)) {
            cats.forEach(c => categories.add(c));
        }
    }
    return [...categories];
}

type CountryResult = {
  id: number;
  country_id: number;
  pesticide_name: string;
  product_name: string;
  mrl_value: string | null;
  mrl_value_numeric: number | null;
  mrl_value_text: string | null;
  unit: string | null;
  note: string | null;
  source_text: string | null;
  source_year: number | null;
  source_date: string | null;
  country?: { id: number; name: string; code: string };
};

type ViewMode = 'list' | 'group' | 'table';
type SortMode = '' | 'mrl-asc' | 'mrl-desc' | 'country' | 'product' | 'pesticide' | 'country-priority-eu' | 'country-priority-tr' | 'country-priority-ru' | 'country-priority-sa' | 'country-priority-codex';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [product, setProduct] = useState('');
  const [pesticide, setPesticide] = useState('');
  const [rawResults, setRawResults] = useState<CountryResult[]>([]);
  const [results, setResults] = useState<CountryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('');

  const [turkeyBanned, setTurkeyBanned] = useState<any[]>([]);
  const [russiaZeroTolerance, setRussiaZeroTolerance] = useState<any[]>([]);
  const [russiaNoLimit, setRussiaNoLimit] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  const supabase = createClient();

  const FLAG: Record<string, string> = {
    TR: '🇹🇷', RU: '🇷🇺', EU: '🇪🇺', SA: '🇸🇦', CODEX: '📋',
  };
  const getFlag = (code?: string) => FLAG[code ?? ''] ?? '🌍';

  const fetchTurkeyBanned = async () => {
    try {
      const res = await fetch('/api/restricted-pesticides?listType=turkey-banned&source=custom');
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      setTurkeyBanned(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Türkiye yasaklı listesi çekilemedi:', error);
      setTurkeyBanned([]);
    }
  };

  const fetchRussiaZeroTolerance = async () => {
    try {
      const res = await fetch('/api/restricted-pesticides?listType=russia-zero-tolerance&source=custom');
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      setRussiaZeroTolerance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Rusya sıfır tolerans listesi çekilemedi:', error);
      setRussiaZeroTolerance([]);
    }
  };

  const fetchRussiaNoLimit = async () => {
    try {
      const res = await fetch('/api/restricted-pesticides?listType=russia-no-limit&source=custom');
      if (!res.ok) throw new Error('HTTP error');
      const data = await res.json();
      setRussiaNoLimit(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Rusya limit gerektirmeyen listesi çekilemedi:', error);
      setRussiaNoLimit([]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    else setAuthError('Kayıt başarılı! E-postanı kontrol et.');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRawResults([]);
    setResults([]);
    setSearched(false);
    setProduct('');
    setPesticide('');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllLists = async () => {
      setLoadingCards(true);
      await Promise.all([
        fetchTurkeyBanned(),
        fetchRussiaZeroTolerance(),
        fetchRussiaNoLimit()
      ]);
      setLoadingCards(false);
    };
    fetchAllLists();
  }, []);

    const applySortTo = useCallback((data: CountryResult[], mode: SortMode): CountryResult[] => {
        const d = [...data];

        // Ülke öncelikli sıralama
        const priorityMap: Record<string, number> = {
            'country-priority-eu': 3,    // EU
            'country-priority-tr': 1,    // Türkiye
            'country-priority-ru': 2,    // Rusya
            'country-priority-sa': 5,    // Suudi Arabistan
            'country-priority-codex': 4, // CODEX
        };

        if (mode.startsWith('country-priority-')) {
            const targetId = priorityMap[mode];
            d.sort((a, b) => {
                if (a.country_id === targetId && b.country_id !== targetId) return -1;
                if (a.country_id !== targetId && b.country_id === targetId) return 1;
                return (a.country?.name ?? '').localeCompare(b.country?.name ?? '');
            });
        } else if (mode === 'mrl-asc') {
            d.sort((a, b) => (a.mrl_value_numeric ?? 0) - (b.mrl_value_numeric ?? 0));
        } else if (mode === 'mrl-desc') {
            d.sort((a, b) => (b.mrl_value_numeric ?? 0) - (a.mrl_value_numeric ?? 0));
        } else if (mode === 'country') {
            d.sort((a, b) => (a.country?.name ?? '').localeCompare(b.country?.name ?? ''));
        } else if (mode === 'product') {
            d.sort((a, b) => a.product_name.localeCompare(b.product_name));
        } else if (mode === 'pesticide') {
            d.sort((a, b) => a.pesticide_name.localeCompare(b.pesticide_name));
        }
        return d;
    }, []);

  const handleSortChange = (mode: SortMode) => {
    setSortMode(mode);
    setResults(applySortTo(rawResults, mode));
  };

  const handlePesticideClick = (pesticideName: string) => {
    setPesticide(pesticideName);
    setTimeout(() => {
      search();
    }, 100);
  };

    const search = useCallback(async () => {
        if (!product.trim() && !pesticide.trim()) return;
        setSearching(true);

        try {
            // Ürün adına göre ilgili kategorileri bul
            const relatedCategories = product.trim()
                ? getRelatedCategories(product.trim())
                : [];

            // Tüm aranacak product_name değerlerini topla
            const productTerms: string[] = [];
            if (product.trim()) {
                productTerms.push(product.trim());
                // Basit çoğul/tekil normalizasyon
                if (!product.trim().endsWith('s')) productTerms.push(product.trim() + 's');
                if (product.trim().endsWith('s')) productTerms.push(product.trim().slice(0, -1));
            }
            relatedCategories.forEach(cat => productTerms.push(cat));

            // Her terim için ayrı OR filtresi oluştur
            const orFilter = productTerms
                .map(term => `product_name.ilike.%${term}%`)
                .join(',');

            // Sorguyu oluştur
            let query = supabase.from('country_limitsa').select('*');

            if (product.trim() && pesticide.trim()) {
                // İkisi de varsa: pesticide eşleşmeli, product geniş arama
                query = query
                    .or(orFilter)
                    .ilike('pesticide_name', `%${pesticide.trim()}%`);
            } else if (product.trim()) {
                query = query.or(orFilter);
            } else {
                // Sadece pesticide
                query = query.ilike('pesticide_name', `%${pesticide.trim()}%`);
            }

            const { data: limits, error } = await query;
            if (error) throw error;

            // Ülke bilgilerini çek ve eşleştir
            const { data: countriesData } = await supabase
                .from('countriesa')
                .select('id, name, code');

            const countryMap = new Map(
                countriesData?.map(c => [c.id, c]) ?? []
            );

            const enriched: CountryResult[] = (limits ?? []).map(r => ({
                ...r,
                country: countryMap.get(r.country_id),
            }));

            // Doğrudan eşleşmeleri üstte göster
            const sorted = enriched.sort((a, b) => {
                const searchLower = product.trim().toLowerCase();
                const aIsDirect = searchLower ? a.product_name.toLowerCase().includes(searchLower) : false;
                const bIsDirect = searchLower ? b.product_name.toLowerCase().includes(searchLower) : false;
                if (aIsDirect && !bIsDirect) return -1;
                if (!aIsDirect && bIsDirect) return 1;
                return 0;
            });

            setRawResults(sorted);
            setResults(applySortTo(sorted, sortMode));
            setSearched(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    }, [product, pesticide, sortMode, applySortTo]);
  const stats = (() => {
    const nums = results.map(r => r.mrl_value_numeric).filter((v): v is number => v != null);
    const countries = new Set(results.map(r => r.country_id)).size;
    const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(3) : '—';
    const min = nums.length ? Math.min(...nums) : null;
    const max = nums.length ? Math.max(...nums) : null;
    return { total: results.length, countries, avg, range: min != null ? `${min} / ${max}` : '—' };
  })();

  const exportCSV = () => {
    const header = ['Country', 'Product', 'Pesticide', 'MRL', 'Unit', 'Note', 'Source', 'Source Date'];
    const rows = results.map(r => [
      r.country?.name ?? '', r.product_name, r.pesticide_name,
      r.mrl_value ?? '', r.unit ?? 'mg/kg', r.note ?? '',
      r.source_text ?? '', r.source_date ?? '',
    ]);
    const csv = [header, ...rows].map(row =>
      row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `mrl-results-${Date.now()}.csv`;
    a.click();
  };

  const copyTable = async () => {
    const text = results.map(r =>
      [r.country?.name, r.product_name, r.pesticide_name, r.mrl_value, r.unit, r.source_text, r.source_date].join('\t')
    ).join('\n');
    await navigator.clipboard.writeText(text);
  };

  const grouped = (() => {
    const map = new Map<number, { country: CountryResult['country']; items: CountryResult[] }>();
    results.forEach(r => {
      if (!map.has(r.country_id)) map.set(r.country_id, { country: r.country, items: [] });
      map.get(r.country_id)!.items.push(r);
    });
    return [...map.values()];
  })();

  // ───────────────────────────────────────────────
  // LOGIN / KAYIT EKRANI
  // ───────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">MRL Control</h1>
            <p className="text-gray-500 mt-2">Global Pesticide Limit Database</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <p className="text-sm text-gray-500 mb-5 text-center">
              {isSignUp ? 'Yeni hesap oluştur' : 'Hesabına giriş yap'}
            </p>

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                {/* Password label + Şifremi unuttum */}
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Şifre</label>
                  {!isSignUp && (
                    <Link
                      href="/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      🔐 Şifremi unuttum?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {authError && (
                <div className={`border rounded-xl p-3 ${authError.includes('başarılı') ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm ${authError.includes('başarılı') ? 'text-emerald-700' : 'text-red-600'}`}>{authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md shadow-emerald-200 disabled:opacity-50"
              >
                {loading ? 'Lütfen bekleyin...' : isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>

              {/* Hesabın yok mu / var mı */}
              <div className="text-center text-sm text-gray-500 pt-1">
                {isSignUp ? 'Hesabın var mı? ' : 'Hesabın yok mu? '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  {isSignUp ? 'Giriş yap' : 'Kayıt ol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────
  // ANA DASHBOARD (oturum açıksa)
  // ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg">MRL Control</span>
            <span className="text-gray-400 text-sm hidden sm:block">| Global Compliance Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/decision-support">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 rounded-xl text-sm font-medium transition-all duration-200 border border-emerald-200">
                <span className="text-base">🧪</span>
                <span>Decision Support</span>
              </button>
            </Link>

            <Link href="/turkey-banned">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-700 rounded-xl text-sm font-medium transition-all duration-200 border border-orange-200">
                <span className="text-base">🇹🇷</span>
                <span>Turkey Banned</span>
              </button>
            </Link>

            <Link href="/russia-zero-tolerance">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-700 rounded-xl text-sm font-medium transition-all duration-200 border border-red-200">
                <span className="text-base">⛔</span>
                <span>Russia Zero Tolerance</span>
              </button>
            </Link>

            <Link href="/russia-no-limit">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-purple-700 rounded-xl text-sm font-medium transition-all duration-200 border border-purple-200">
                <span className="text-base">🔬</span>
                <span>Russia No Limit</span>
              </button>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm text-white font-medium">
                  {session.user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-600 hidden sm:block">{session.user.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <InfoCard
            title="TÜRKİYE YASAKLI PESTİSİTLER"
            description="Türkiye'de kullanımı sonlandırılan yasaklı pestisitler"
            icon="🇹🇷"
            items={turkeyBanned}
            onItemClick={handlePesticideClick}
            loading={loadingCards}
            badgeColor="orange"
            showButton={false}
          />
          <InfoCard
            title="RUSYA - HİÇBİR ÜRÜNDE BULUNMAMASI GEREKENLER"
            description="Rusya mevzuatına göre MRL değeri 0 olması gereken maddeler"
            icon="⛔"
            items={russiaZeroTolerance}
            onItemClick={handlePesticideClick}
            loading={loadingCards}
            badgeColor="red"
            showButton={false}
          />
          <InfoCard
            title="RUSYA - LİMİT BELİRLENMESİNE GEREK YOK"
            description="Rusya mevzuatına göre MRL belirlenmesine gerek olmayan maddeler"
            icon="🔬"
            items={russiaNoLimit}
            onItemClick={handlePesticideClick}
            loading={loadingCards}
            badgeColor="purple"
            showButton={false}
          />
        </div>

        {searched && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Results', value: stats.total, sub: 'across all countries', icon: '📊', color: 'emerald' },
              { label: 'Countries Found', value: stats.countries, sub: 'with matching limits', icon: '🌍', color: 'blue' },
              { label: 'Average MRL', value: stats.avg, sub: 'mg/kg (numeric)', icon: '📈', color: 'purple' },
              { label: 'Range (Min/Max)', value: stats.range, sub: 'mg/kg range', icon: '⚖️', color: 'orange' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{s.label}</p>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 pt-6 pb-3 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 mb-1">🌍 Global MRL Database</h1>
            <p className="text-sm text-gray-500">Search maximum residue limits across all countries simultaneously</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🍎</div>
                  <input
                    type="text"
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                    placeholder="e.g., Apple, Wheat, Potato..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pesticide Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🧪</div>
                  <input
                    type="text"
                    value={pesticide}
                    onChange={e => setPesticide(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                    placeholder="e.g., Glyphosate, Chlorpyrifos..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={search}
              disabled={searching || (!product.trim() && !pesticide.trim())}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🔍 Search All Countries
                </span>
              )}
            </button>
          </div>
        </div>

        {searched && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {(['list', 'group', 'table'] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-4 py-2 text-sm capitalize transition-all duration-200 ${
                      viewMode === v
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {v === 'list' ? '≡ List' : v === 'group' ? '⊞ By Country' : '⊟ Table'}
                  </button>
                ))}
              </div>

                          <select
                              value={sortMode}
                              onChange={e => handleSortChange(e.target.value as SortMode)}
                              className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 shadow-sm"
                          >
                              <option value="">Sort by...</option>

                              {/* Ülke Öncelikli Sıralamalar */}
                              <option value="country-priority-tr">🇹🇷 Türkiye </option>
                              <option value="country-priority-ru">🇷🇺 Rusya </option>
                              <option value="country-priority-eu">🇪🇺 Avrupa Birliği </option>
                              <option value="country-priority-sa">🇸🇦 Suudi Arabistan </option>
                              <option value="country-priority-codex">📋 CODEX </option>

                              <option disabled>──────────</option>

                              {/* Mevcut seçenekler */}
                              <option value="mrl-asc">MRL ↑ Low to High</option>
                              <option value="mrl-desc">MRL ↓ High to Low</option>
                              <option value="country">Country A→Z</option>
                              <option value="product">Product A→Z</option>
                              <option value="pesticide">Pesticide A→Z</option>
                          </select>

              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <span className="text-sm text-gray-500">Found</span>
                <span className="text-sm font-bold text-gray-900">{results.length}</span>
                <span className="text-sm text-gray-500">records</span>
              </div>
            </div>

            {viewMode === 'list' && (
              <div className="space-y-3">
                {results.length > 0 ? results.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap items-start justify-between gap-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getFlag(item.country?.code)}</span>
                        <span className="font-semibold text-gray-900">{item.country?.name}</span>
                        {item.note && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.note}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700">{item.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.pesticide_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-2">
                        <span className="font-mono text-emerald-600 font-semibold text-base">
                          {item.mrl_value ?? '—'} <span className="text-emerald-400 text-xs">{item.unit}</span>
                        </span>
                      </div>
                      {(item.source_text || item.source_date) && (
                        <div className="mt-1">
                          <span className="text-[9px] text-gray-400">
                            {item.source_text && `📌 ${item.source_text}`}
                            {item.source_year && ` ${item.source_year}`}
                            {item.source_date && ` (${item.source_date})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )) : <EmptySearch />}
              </div>
            )}

            {viewMode === 'group' && (
              <div className="space-y-5">
                {grouped.length > 0 ? grouped.map(g => (
                  <div key={g.country?.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <span className="text-2xl">{getFlag(g.country?.code)}</span>
                      <span className="font-semibold text-gray-900 text-lg">{g.country?.name ?? 'Unknown'}</span>
                      <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                        {g.items.length} limit{g.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {g.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-all duration-200">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.pesticide_name}</p>
                            {item.note && <p className="text-xs text-gray-400 mt-1">{item.note}</p>}
                          </div>
                          <div className="text-right ml-4">
                            <span className="font-mono text-emerald-600 text-sm font-semibold">
                              {item.mrl_value ?? '—'} <span className="text-gray-400 text-xs">{item.unit}</span>
                            </span>
                            {(item.source_text || item.source_date) && (
                              <div className="text-[9px] text-gray-400 mt-0.5">
                                {item.source_text && `${item.source_text}`}
                                {item.source_year && ` ${item.source_year}`}
                                {item.source_date && ` (${item.source_date})`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )) : <EmptySearch />}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesticide</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results.map((r, idx) => (
                          <tr key={r.id} className={`hover:bg-gray-50 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="mr-1.5">{getFlag(r.country?.code)}</span>
                              <span className="text-gray-700">{r.country?.name ?? '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-800">{r.product_name}</td>
                            <td className="px-4 py-3 text-gray-600">{r.pesticide_name}</td>
                            <td className="px-4 py-3 font-mono text-emerald-600 font-semibold">{r.mrl_value ?? '—'}</td>
                            <td className="px-4 py-3 text-gray-500">{r.unit ?? 'mg/kg'}</td>
                            <td className="px-4 py-3">
                              {(r.source_text || r.source_date) && (
                                <div className="text-[9px] text-gray-400">
                                  {r.source_text && `${r.source_text}`}
                                  {r.source_year && ` ${r.source_year}`}
                                  {r.source_date && <div className="text-[8px] text-gray-300">{r.source_date}</div>}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{r.note ?? ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptySearch />}
              </div>
            )}

            {results.length > 0 && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 rounded-xl text-sm transition-all duration-200 shadow-sm"
                >
                  ⬇ Export CSV
                </button>
                <button
                  onClick={copyTable}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 rounded-xl text-sm transition-all duration-200 shadow-sm"
                >
                  ⎘ Copy Table
                </button>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🌍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Searching</h3>
            <p className="text-gray-500">Enter product and/or pesticide name to search across all countries</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm text-gray-400">
              <span className="px-2 py-1">Turkey 🇹🇷</span>
              <span className="px-2 py-1">Russia 🇷🇺</span>
              <span className="px-2 py-1">EU 🇪🇺</span>
              <span className="px-2 py-1">Saudi Arabia 🇸🇦</span>
              <span className="px-2 py-1">Codex 📋</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-gray-500">No records found matching your search criteria</p>
      <p className="text-gray-400 text-sm mt-2">Try different product or pesticide names</p>
    </div>
  );
}