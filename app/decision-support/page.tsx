'use client';

// ══════════════════════════════════════════════════════════════════════════════
//  TGK Pestisit MRL Karar Destek Sistemi
//  TGK-PKY (RG: 27.09.2021 / 31611) — Rehber Rev.1 (25.02.2022) Uyumlu
// ══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const DEFAULT_MRL = 0.01;
const WARNING_RATIO = 0.8;
const MAX_ROWS = 12;
const BKU_URL = 'https://bku.tarimorman.gov.tr/';

const COUNTRY_PRIORITY: Record<string, number> = {
    TR: 1, EU: 2, CODEX: 3, SA: 4, RU: 5,
};

// ─── Ürün → Kategori eşleme haritası ──────────────────────────────────────────
const PRODUCT_CATEGORY_MAP: Record<string, string[]> = {
    apricot: ['Stone fruits', 'Stone fruits (group)', 'Apricots'],
    peach: ['Stone fruits', 'Stone fruits (group)', 'Peaches'],
    nectarine: ['Stone fruits', 'Stone fruits (group)', 'Nectarines'],
    plum: ['Stone fruits', 'Stone fruits (group)', 'Plums'],
    cherry: ['Stone fruits', 'Stone fruits (group)', 'Cherries'],
    sour_cherry: ['Stone fruits', 'Stone fruits (group)', 'Cherries', 'Sour cherries'],
    persimmon: ['Stone fruits', 'Persimmons', 'Tropical fruits'],
    mango: ['Stone fruits', 'Tropical fruits', 'Mangoes'],
    apple: ['Pome fruits', 'Pome fruits (group)', 'Apples'],
    pear: ['Pome fruits', 'Pome fruits (group)', 'Pears'],
    quince: ['Pome fruits', 'Quinces'],
    orange: ['Citrus fruits', 'Citrus fruits (group)', 'Oranges'],
    lemon: ['Citrus fruits', 'Citrus fruits (group)', 'Lemons'],
    lime: ['Citrus fruits', 'Citrus fruits (group)', 'Limes'],
    grapefruit: ['Citrus fruits', 'Citrus fruits (group)', 'Grapefruits'],
    mandarin: ['Citrus fruits', 'Citrus fruits (group)', 'Mandarins'],
    strawberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Strawberries'],
    raspberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Raspberries'],
    blackberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Blackberries'],
    blueberry: ['Soft-seeded fruits', 'Berries and small fruits', 'Blueberries'],
    grape: ['Soft-seeded fruits', 'Berries and small fruits', 'Grapes'],
    banana: ['Tropical fruits', 'Bananas'],
    pineapple: ['Tropical fruits', 'Pineapples'],
    papaya: ['Tropical fruits', 'Papayas'],
    avocado: ['Tropical fruits', 'Avocados'],
    kiwi: ['Tropical fruits', 'Kiwis'],
    almond: ['Fruits with hard shells', 'Tree nuts', 'Almonds'],
    walnut: ['Fruits with hard shells', 'Tree nuts', 'Walnuts'],
    hazelnut: ['Fruits with hard shells', 'Tree nuts', 'Hazelnuts'],
    pistachio: ['Fruits with hard shells', 'Tree nuts', 'Pistachios'],
};

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
// ──────────────────────────────────────────────────────────────────────────────

type ProductOrigin = 'import' | 'domestic' | 'export';
type Country = { id: number; name: string; code: string };
type EvalStatus =
    | 'PASS' | 'WARNING' | 'FAIL'
    | 'ZERO_TOLERANCE'
    | 'DEFAULT_LIMIT_PASS' | 'DEFAULT_LIMIT_FAIL'
    | 'NOT_FOUND';
type DecisionBasis = 'MRL' | 'LOD' | 'DEFAULT_0.01' | 'ZERO_LIST' | 'NO_LIMIT';

type EvalResult = {
    id: string;
    product: string;
    pesticide: string;
    measured: number;
    u: number;
    xMinusU: number;
    country: Country;
    mrl: number;
    lod: number;
    effectiveLimit: number;
    decisionBasis: DecisionBasis;
    status: EvalStatus;
    ratio: number;
    isTGK: boolean;
    isBanned: boolean;
    isZeroTolerance: boolean;
    isNoLimit: boolean;
    isDefaultLimit: boolean;
    annexSource: 'Ek-2' | 'Ek-3' | 'Ek-4' | 'Özel Liste' | '—';
    specialFlags: SpecialFlag[];
};

type SpecialFlag = {
    type: 'turkey-banned' | 'russia-zero' | 'russia-no-limit';
    label: string;
};

type PastedRow = { product: string; pesticide: string; reportedValue: number };
type ActiveTab = 'input' | 'report' | 'special' | 'guide';
type SpecialListTab = 'turkey-banned' | 'russia-zero' | 'russia-no-limit';
type ManualMRL = { product: string; pesticide: string; mrl: string };

// ── BKÜ Yönlendirme Bileşeni (Sadece Türkiye üretimi seçiliyken görünür) ──────
function BKUGuide() {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden shadow-sm">
            <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-blue-800 text-sm">🇹🇷 BKÜ MRL Kaynağı (Ek-2)</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                        MRL değerini T.C. Tarım ve Orman Bakanlığı'nın resmi veri tabanından alın.
                    </p>
                </div>
            </div>
            <div className="px-4 pb-4">
                <a
                    href={BKU_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>BKÜ Kayıt ve Ruhsat Sistemine Git</span>
                </a>
                <div className="text-center mt-2">
                    <a
                        href={BKU_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline font-mono"
                    >
                        bku.tarimorman.gov.tr
                    </a>
                    <span className="text-xs text-gray-400 ml-1">🔗 bağlantı</span>
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className="w-full mt-3 text-center text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 transition-colors"
                >
                    {open ? '📖 Kullanım kılavuzunu gizle ▲' : '📖 Nasıl kullanılır? ▼'}
                </button>
            </div>
            {open && (
                <div className="px-4 pb-4 pt-0 border-t border-blue-200 bg-blue-100/50">
                    <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider mt-3 mb-2">KULLANIM ADIMLARI</p>
                    <ol className="space-y-2">
                        <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span><p className="text-xs text-blue-800">bku.tarimorman.gov.tr adresini açın</p></li>
                        <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span><p className="text-xs text-blue-800">"Etken Madde Ara" bölümüne tıklayın</p></li>
                        <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span><p className="text-xs text-blue-800">Ürün adını seçin, MRL değerini not edin</p></li>
                        <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">4</span><p className="text-xs text-blue-800">Değeri "Ek-2 MRL" alanına girin</p></li>
                    </ol>
                    <div className="mt-3 p-2 bg-blue-100 rounded-lg text-center">
                        <p className="text-[10px] text-blue-700">⚠️ Kayıt yoksa Ek-3 LOD veya 0,01 mg/kg varsayılan uygulanır.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function DomesticMRLInput({ rows, manualMRLs, onChange }: { rows: PastedRow[]; manualMRLs: ManualMRL[]; onChange: (vals: ManualMRL[]) => void }) {
    if (!rows.length) return null;
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ek-2 MRL Girişi — BKÜ'den alınan değerler</p>
                <p className="text-xs text-gray-400 mt-0.5">Boş bırakılan alanlar için Ek-3 LOD → 0,01 mg/kg hiyerarşisi uygulanır.</p>
            </div>
            <div className="p-5 space-y-3">
                {rows.map((row, i) => {
                    const current = manualMRLs[i] ?? { product: row.product, pesticide: row.pesticide, mrl: '' };
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0"><p className="text-xs font-medium text-gray-700 truncate">{row.product}</p><p className="text-xs text-gray-400 font-mono truncate">{row.pesticide}</p></div>
                            <div className="flex items-center gap-2 shrink-0">
                                <input type="number" step="0.0001" min="0" placeholder="Ek-2 MRL (mg/kg)" value={current.mrl}
                                    onChange={e => { const next = [...manualMRLs]; next[i] = { product: row.product, pesticide: row.pesticide, mrl: e.target.value }; onChange(next); }}
                                    className="w-32 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-900 placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all" />
                                <span className="text-xs text-gray-400">mg/kg</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DecisionSupportPage() {
    const supabase = createClient();
    const [pasteData, setPasteData] = useState('');
    const [parsedRows, setParsedRows] = useState<PastedRow[]>([]);
    const [origin, setOrigin] = useState<ProductOrigin>('import');
    const [useOB, setUseOB] = useState(true);
    const [useDGSante, setUseDGSante] = useState(true);
    const [customOBPct, setCustomOBPct] = useState(50);
    const [applyDefaultLimit, setApplyDefaultLimit] = useState(true);
    const [manualMRLs, setManualMRLs] = useState<ManualMRL[]>([]);
    const [allResults, setAllResults] = useState<EvalResult[]>([]);
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [loadStatus, setLoadStatus] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('input');
    const [specialListTab, setSpecialListTab] = useState<SpecialListTab>('turkey-banned');
    const [specialSearch, setSpecialSearch] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [turkeyBanned, setTurkeyBanned] = useState<string[]>([]);
    const [russiaZero, setRussiaZero] = useState<string[]>([]);
    const [russiaNoLimit, setRussiaNoLimit] = useState<string[]>([]);
    const [loadingLists, setLoadingLists] = useState(true);

    const effectiveOBPct = useOB ? (useDGSante ? 50 : customOBPct) : 0;
    const FLAG: Record<string, string> = { TR: '🇹🇷', RU: '🇷🇺', EU: '🇪🇺', SA: '🇸🇦', CODEX: '📋' };
    const getFlag = (code?: string) => FLAG[code ?? ''] ?? '🌍';

    useEffect(() => {
        (async () => {
            setLoadingLists(true);
            try {
                const [r1, r2, r3] = await Promise.all([
                    fetch('/api/restricted-pesticides?listType=turkey-banned&source=custom'),
                    fetch('/api/restricted-pesticides?listType=russia-zero-tolerance&source=custom'),
                    fetch('/api/restricted-pesticides?listType=russia-no-limit&source=custom'),
                ]);
                const [d1, d2, d3] = await Promise.all([r1.ok ? r1.json() : [], r2.ok ? r2.json() : [], r3.ok ? r3.json() : []]);
                const name = (d: any) => d.pesticide_name ?? d.name ?? d;
                setTurkeyBanned(Array.isArray(d1) ? d1.map(name) : []);
                setRussiaZero(Array.isArray(d2) ? d2.map(name) : []);
                setRussiaNoLimit(Array.isArray(d3) ? d3.map(name) : []);
            } catch (e) { console.error(e); } finally { setLoadingLists(false); }
        })();
    }, []);

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchList = useCallback((pest: string, list: string[]) => {
        const n = normalize(pest);
        return list.some(p => { const pn = normalize(p); return pn.includes(n) || n.includes(pn); });
    }, []);
    const getFlags = useCallback((pest: string): SpecialFlag[] => {
        const f: SpecialFlag[] = [];
        if (matchList(pest, turkeyBanned)) f.push({ type: 'turkey-banned', label: '🇹🇷 TR Ek-4' });
        if (matchList(pest, russiaZero)) f.push({ type: 'russia-zero', label: '⛔ RU Sıfır Tolerans' });
        if (matchList(pest, russiaNoLimit)) f.push({ type: 'russia-no-limit', label: '🔬 RU Limitsiz' });
        return f;
    }, [turkeyBanned, russiaZero, russiaNoLimit, matchList]);

    const parseRows = (text: string): PastedRow[] => {
        const rows: PastedRow[] = [];
        for (const line of text.trim().split(/\r?\n/)) {
            if (!line.trim() || rows.length >= MAX_ROWS) break;
            const parts = line.includes('\t') ? line.split('\t').map(p => p.trim()).filter(Boolean) : line.trim().split(/\s+/);
            if (parts.length < 3) continue;
            const val = parseFloat(parts[parts.length - 1].replace(',', '.'));
            if (isNaN(val)) continue;
            let product: string, pesticide: string;
            if (parts.length === 3) { product = parts[0]; pesticide = parts[1]; }
            else {
                const last2 = parts[parts.length - 2];
                const endings = ['thion', 'phos', 'zole', 'conazole', 'ectin', 'sulfate', 'ine', 'ate', 'furan', 'amide'];
                const looksLike = endings.some(e => last2.toLowerCase().endsWith(e)) || (!/[0-9]/.test(last2) && !last2.includes(' '));
                if (looksLike) { pesticide = last2; product = parts.slice(0, -2).join(' '); }
                else { product = parts[0]; pesticide = parts.slice(1, -1).join(' '); }
            }
            rows.push({ product, pesticide, reportedValue: val });
        }
        return rows;
    };

    useEffect(() => {
        const rows = parseRows(pasteData);
        setParsedRows(rows);
        setManualMRLs(rows.map((r, i) => ({ product: r.product, pesticide: r.pesticide, mrl: manualMRLs[i]?.mrl ?? '' })));
    }, [pasteData]);

    const queryLimits = async (product: string, pesticide: string) => {
        const relatedCategories = getRelatedCategories(product);
        const searchTerms: string[] = [product];
        relatedCategories.forEach(cat => searchTerms.push(cat));
        const orFilter = searchTerms.map(term => `product_name.ilike.%${term}%`).join(',');
        let q = supabase.from('country_limitsa').select('*, countriesa(id, name, code)');
        if (product.trim()) q = q.or(orFilter);
        if (pesticide.trim()) q = q.ilike('pesticide_name', `%${pesticide.trim()}%`);
        const { data, error } = await q;
        return error ? [] : (data || []);
    };

    const decideStatus = (x: number, u: number, mrl: number, lod: number, isZeroTol: boolean, isNoLimit: boolean, applyDefault: boolean, isRussiaOrCodex: boolean) => {
        const effectiveU = isRussiaOrCodex ? 0 : u;
        const xMinusU = x - effectiveU;
        if (isZeroTol) return { xMinusU, effectiveLimit: 0, decisionBasis: 'ZERO_LIST' as DecisionBasis, status: (xMinusU > 0 ? 'ZERO_TOLERANCE' : 'PASS') as EvalStatus, ratio: xMinusU > 0 ? 999 : 0, isDefaultLimit: false };
        if (isNoLimit) return { xMinusU, effectiveLimit: 0, decisionBasis: 'NO_LIMIT' as DecisionBasis, status: 'PASS' as EvalStatus, ratio: 0, isDefaultLimit: false };
        if (mrl > 0) { const ratio = xMinusU / mrl; const status: EvalStatus = xMinusU > mrl ? 'FAIL' : xMinusU > mrl * WARNING_RATIO ? 'WARNING' : 'PASS'; return { xMinusU, effectiveLimit: mrl, decisionBasis: 'MRL' as DecisionBasis, status, ratio, isDefaultLimit: false }; }
        if (lod > 0) { const ratio = xMinusU / lod; const status: EvalStatus = xMinusU > lod ? 'FAIL' : xMinusU > lod * WARNING_RATIO ? 'WARNING' : 'PASS'; return { xMinusU, effectiveLimit: lod, decisionBasis: 'LOD' as DecisionBasis, status, ratio, isDefaultLimit: false }; }
        if (applyDefault) { const ratio = xMinusU / DEFAULT_MRL; const status: EvalStatus = xMinusU > DEFAULT_MRL ? 'DEFAULT_LIMIT_FAIL' : 'DEFAULT_LIMIT_PASS'; return { xMinusU, effectiveLimit: DEFAULT_MRL, decisionBasis: 'DEFAULT_0.01' as DecisionBasis, status, ratio, isDefaultLimit: true }; }
        return { xMinusU: x, effectiveLimit: 0, decisionBasis: 'DEFAULT_0.01' as DecisionBasis, status: 'NOT_FOUND' as EvalStatus, ratio: 0, isDefaultLimit: false };
    };

    const getAnnex = (code: string, isBanned: boolean, origin: ProductOrigin): EvalResult['annexSource'] => {
        if (isBanned) return 'Ek-4';
        if (origin === 'export') return '—';
        if (code === 'TR') return origin === 'import' ? 'Ek-3' : 'Ek-2';
        return '—';
    };

    const handleAnalyze = async () => {
        if (!pasteData.trim()) { alert('Lütfen veriyi yapıştırın.'); return; }
        const parsed = parseRows(pasteData);
        if (!parsed.length) { alert('Veri formatı anlaşılamadı.'); return; }
        setLoading(true);
        setHiddenIds(new Set());
        const results: EvalResult[] = [];
        const uRatio = effectiveOBPct / 100;

        for (let i = 0; i < parsed.length; i++) {
            const row = parsed[i];
            setLoadStatus(`${i + 1}/${parsed.length} — "${row.pesticide}" / "${row.product}"`);
            const x = row.reportedValue;
            const U = x * uRatio;
            const flags = getFlags(row.pesticide);
            const isBanned = matchList(row.pesticide, turkeyBanned);
            const isRZero = matchList(row.pesticide, russiaZero);
            const isRNoLimit = matchList(row.pesticide, russiaNoLimit);

            let domesticMRL = 0;
            if (origin === 'domestic') {
                const manualEntry = manualMRLs[i];
                const parsed = manualEntry?.mrl ? parseFloat(manualEntry.mrl) : NaN;
                if (!isNaN(parsed) && parsed > 0) domesticMRL = parsed;
            }

            // Rusya özel liste satırları
            if (isRZero && !isRNoLimit) {
                const dec = decideStatus(x, U, 0, 0, true, false, false, true);
                results.push({ id: `${i}-ru-zero`, product: row.product, pesticide: row.pesticide, measured: x, u: 0, xMinusU: dec.xMinusU, country: { id: 0, name: 'Rusya', code: 'RU' }, mrl: 0, lod: 0, effectiveLimit: 0, decisionBasis: 'ZERO_LIST', status: dec.status, ratio: dec.ratio, isTGK: false, isBanned, isZeroTolerance: true, isNoLimit: false, isDefaultLimit: false, annexSource: 'Özel Liste', specialFlags: flags });
            }
            if (isRNoLimit) {
                const dec = decideStatus(x, U, 0, 0, false, true, false, true);
                results.push({ id: `${i}-ru-nolimit`, product: row.product, pesticide: row.pesticide, measured: x, u: 0, xMinusU: dec.xMinusU, country: { id: 0, name: 'Rusya', code: 'RU' }, mrl: 0, lod: 0, effectiveLimit: 0, decisionBasis: 'NO_LIMIT', status: 'PASS', ratio: 0, isTGK: false, isBanned, isZeroTolerance: isRZero, isNoLimit: true, isDefaultLimit: false, annexSource: 'Özel Liste', specialFlags: flags });
            }

            // Türkiye üretimi + Ek-2 MRL manuel girilmiş
            if (origin === 'domestic' && domesticMRL > 0 && !isBanned) {
                const dec = decideStatus(x, U, domesticMRL, 0, false, false, false, false);
                results.push({ id: `${i}-tr-ek2`, product: row.product, pesticide: row.pesticide, measured: x, u: U, xMinusU: dec.xMinusU, country: { id: 0, name: 'Türkiye', code: 'TR' }, mrl: domesticMRL, lod: 0, effectiveLimit: dec.effectiveLimit, decisionBasis: dec.decisionBasis, status: dec.status, ratio: dec.ratio, isTGK: true, isBanned: false, isZeroTolerance: isRZero, isNoLimit: isRNoLimit, isDefaultLimit: false, annexSource: 'Ek-2', specialFlags: flags });
            }

            const dbLimits = await queryLimits(row.product, row.pesticide);
            const hasRuLimit = dbLimits.some((l: any) => l.countriesa?.code === 'RU');

            if (!dbLimits.length) {
                // DB'de kayıt yok
                if (!(origin === 'domestic' && domesticMRL > 0)) {
                    const isTurkey = origin !== 'export';
                    const dec = decideStatus(x, U, 0, 0, false, false, applyDefaultLimit && isTurkey, false);
                    results.push({ id: `${i}-default`, product: row.product, pesticide: row.pesticide, measured: x, u: dec.isDefaultLimit && origin !== 'export' ? U : 0, xMinusU: dec.xMinusU, country: { id: 0, name: origin === 'export' ? 'Hedef Ülke (Kayıt Yok)' : (origin === 'domestic' ? 'Türkiye (Ek-3 / Varsayılan)' : 'Türkiye (Varsayılan)'), code: origin === 'export' ? 'XX' : 'TR' }, mrl: 0, lod: 0, effectiveLimit: dec.effectiveLimit, decisionBasis: dec.decisionBasis, status: dec.status, ratio: dec.ratio, isTGK: origin !== 'export', isBanned, isZeroTolerance: isRZero, isNoLimit: isRNoLimit, isDefaultLimit: dec.isDefaultLimit, annexSource: isBanned ? 'Ek-4' : (origin === 'export' ? '—' : (origin === 'import' ? 'Ek-3' : 'Ek-2')), specialFlags: flags });
                }
                continue;
            }

            const sorted = [...dbLimits].sort((a: any, b: any) => (COUNTRY_PRIORITY[a.countriesa?.code ?? ''] ?? 99) - (COUNTRY_PRIORITY[b.countriesa?.code ?? ''] ?? 99));

            for (let j = 0; j < sorted.length; j++) {
                const rec = sorted[j];
                const country: Country = rec.countriesa || { id: 0, name: 'Bilinmiyor', code: 'XX' };
                const isRussia = country.code === 'RU';
                const isTurkey = country.code === 'TR';
                const isCodex = country.code === 'CODEX' || country.name?.toLowerCase().includes('codex');
                const isRussiaOrCodex = isRussia || isCodex;

                if (isRussia && isRZero && !isRNoLimit) continue;
                if (isRussia && isRNoLimit) continue;
                if (isTurkey && origin === 'domestic' && domesticMRL > 0) continue;

                const mrlVal = Number(rec.mrl_value_numeric) || 0;
                const lodVal = Number(rec.lod_value) || 0;
                const isTurkeyEval = isTurkey && origin !== 'export';
                const dec = decideStatus(x, U, mrlVal, lodVal, false, false, applyDefaultLimit && isTurkeyEval, isRussiaOrCodex);

                results.push({
                    id: `${i}-${j}-${country.code}`,
                    product: rec.product_name ?? row.product,
                    pesticide: rec.pesticide_name ?? row.pesticide,
                    measured: x,
                    u: (isRussiaOrCodex || origin === 'export') ? 0 : U,
                    xMinusU: dec.xMinusU,
                    country,
                    mrl: mrlVal,
                    lod: lodVal,
                    effectiveLimit: dec.effectiveLimit,
                    decisionBasis: dec.decisionBasis,
                    status: dec.status,
                    ratio: dec.ratio,
                    isTGK: isTurkey && origin !== 'export',
                    isBanned,
                    isZeroTolerance: isRussia && isRZero,
                    isNoLimit: isRussia && isRNoLimit,
                    isDefaultLimit: dec.isDefaultLimit,
                    annexSource: getAnnex(country.code, isBanned, origin),
                    specialFlags: flags,
                });
            }

            if (!hasRuLimit && !isRZero && !isRNoLimit) {
                results.push({
                    id: `${i}-ru-missing`,
                    product: row.product,
                    pesticide: row.pesticide,
                    measured: x,
                    u: 0,
                    xMinusU: x,
                    country: { id: 0, name: 'Rusya', code: 'RU' },
                    mrl: 0,
                    lod: 0,
                    effectiveLimit: 0,
                    decisionBasis: 'DEFAULT_0.01',
                    status: 'FAIL',
                    ratio: 999,
                    isTGK: false,
                    isBanned,
                    isZeroTolerance: false,
                    isNoLimit: false,
                    isDefaultLimit: false,
                    annexSource: '—',
                    specialFlags: flags,
                });
            }
        }

        setAllResults(results);
        setLoading(false);
        setLoadStatus('');
        setActiveTab('report');
    };

    const visibleResults = useMemo(() => allResults.filter(r => !hiddenIds.has(r.id)), [allResults, hiddenIds]);
    const hiddenCount = allResults.length - visibleResults.length;
    const hideResult = (id: string) => setHiddenIds(prev => new Set(prev).add(id));
    const unhideAll = () => setHiddenIds(new Set());
    const clearAll = () => { setPasteData(''); setParsedRows([]); setManualMRLs([]); setAllResults([]); setHiddenIds(new Set()); setLoadStatus(''); setActiveTab('input'); };
    const stats = useMemo(() => {
        const v = visibleResults;
        if (!v.length) return null;
        const tgk = v.filter(r => r.isTGK);
        const pass = tgk.filter(r => ['PASS', 'DEFAULT_LIMIT_PASS'].includes(r.status)).length;
        const warn = tgk.filter(r => r.status === 'WARNING').length;
        const fail = tgk.filter(r => ['FAIL', 'ZERO_TOLERANCE', 'DEFAULT_LIMIT_FAIL'].includes(r.status)).length;
        const defApplied = v.filter(r => r.isDefaultLimit).length;
        const total = tgk.length;
        return { pass, warn, fail, defApplied, total, compliance: total > 0 ? Math.round((pass / total) * 100) : 0 };
    }, [visibleResults]);
    const grouped = useMemo(() => {
        const m = new Map<string, EvalResult[]>();
        visibleResults.forEach(r => { const k = `${r.product}|||${r.pesticide}`; if (!m.has(k)) m.set(k, []); m.get(k)!.push(r); });
        return m;
    }, [visibleResults]);
    const exportCSV = () => {
        const header = ['Ürün', 'Pestisit', 'Menşe', 'Ülke', 'Ek-4?', 'x (mg/kg)', 'U (mg/kg)', 'x−U (mg/kg)', 'MRL', 'LOD', 'Eff.Limit', 'Dayanak', 'Ek', 'Durum', 'MRL%', 'Varsayılan'];
        const rows = visibleResults.map(r => [r.product, r.pesticide, origin === 'import' ? 'İthal' : origin === 'domestic' ? 'TR Üretim' : 'İhracat', r.country.name, r.isBanned ? 'Ek-4' : '—', r.measured.toFixed(4), r.u.toFixed(4), r.xMinusU.toFixed(4), r.mrl > 0 ? r.mrl.toFixed(4) : '—', r.lod > 0 ? r.lod.toFixed(4) : '—', r.effectiveLimit > 0 ? r.effectiveLimit.toFixed(4) : '—', r.decisionBasis, r.annexSource, r.status, r.ratio > 0 && r.ratio < 900 ? (r.ratio * 100).toFixed(1) + '%' : r.ratio >= 900 ? '>100%' : '—', r.isDefaultLimit ? 'Evet' : 'Hayır']);
        const csv = [header, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv); a.download = `tgk-mrl-${Date.now()}.csv`; a.click();
    };
    const generateReport = () => {
        if (!visibleResults.length) return '';
        const date = new Date().toLocaleDateString('tr-TR');
        const obNote = useOB ? `DG-SANTE E13 — U = x × ${(effectiveOBPct / 100).toFixed(2)} (%${effectiveOBPct})` : 'ÖB uygulanmadı';
        const origNote = origin === 'import' ? 'İthal ürün — Ek-3 (AB 396/2005)' : origin === 'domestic' ? 'Türkiye üretimi — Ek-2 (BKÜ Ruhsatlandırma)' : 'İhracat — Hedef ülke mevzuatı (TGK uygulanmaz)';
        const lines = [`TGK PESTİSİT MRL UYUMLULUK RAPORU`, `Tarih: ${date}`, `Mevzuat: TGK-PKY RG 27.09.2021/31611, Rehber Rev.1 (25.02.2022)`, `Menşe: ${origNote}`, `ÖB: ${obNote}`, `Karar Formülü: x − U ≤ Limit (MRL, LOD veya 0,01 mg/kg) — Tüm yasal limitler için`, ``, `KARAR ÖZETİ (★ TGK):`, `  Toplam: ${stats?.total ?? 0} | Uyumlu: ${stats?.pass ?? 0} | Uyarı: ${stats?.warn ?? 0} | Uygunsuz: ${stats?.fail ?? 0} | Uyumluluk: %${stats?.compliance ?? 0}`, ``];
        Array.from(grouped.entries()).forEach(([key, recs]) => {
            const [prod, pest] = key.split('|||');
            lines.push(`─── ${prod} / ${pest} ───`);
            recs.forEach(r => { const label = r.isTGK ? '★ TGK' : r.country.name; const bannedNote = r.isBanned ? ' [Ek-4]' : ''; const lim = r.effectiveLimit > 0 ? `${r.effectiveLimit.toFixed(4)} mg/kg [${r.decisionBasis}]` : r.decisionBasis; lines.push(`  [${label}${bannedNote}] x=${r.measured.toFixed(4)} U=${r.u.toFixed(4)} x−U=${r.xMinusU.toFixed(4)} Limit=${lim} → ${r.status} (${r.annexSource})`); });
            lines.push('');
        });
        lines.push(`NOT: Bu çıktı yalnızca karar destek amaçlıdır. Resmi değerlendirmeler için yetkili otorite kararı geçerlidir.`);
        return lines.join('\n');
    };

    const STATUS: Record<string, { label: string; bg: string; text: string; icon: string; desc: string }> = {
        PASS: { label: 'Uyumlu', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓', desc: 'x − U ≤ Limit' },
        WARNING: { label: 'Uyarı', bg: 'bg-amber-100', text: 'text-amber-700', icon: '!', desc: `x − U > Limit×%${Math.round(WARNING_RATIO * 100)}` },
        FAIL: { label: 'Uygunsuz', bg: 'bg-red-100', text: 'text-red-700', icon: '✗', desc: 'x − U > Limit' },
        ZERO_TOLERANCE: { label: 'Sıfır Tol.', bg: 'bg-red-100', text: 'text-red-700', icon: '0', desc: 'Rusya: sıfır tolerans — x−U > 0' },
        DEFAULT_LIMIT_PASS: { label: 'Varsayılan ✓', bg: 'bg-sky-100', text: 'text-sky-700', icon: 'D', desc: 'x − U ≤ 0,01 (Md.7/3)' },
        DEFAULT_LIMIT_FAIL: { label: 'Varsayılan ✗', bg: 'bg-orange-100', text: 'text-orange-700', icon: 'D!', desc: 'x − U > 0,01 (Md.7/3)' },
        NOT_FOUND: { label: 'Bulunamadı', bg: 'bg-gray-100', text: 'text-gray-500', icon: '?', desc: 'Kayıt yok' },
    };

    const tabCls = (t: string) => `px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`;
    const specialMeta = useMemo(() => ({
        'turkey-banned': { items: turkeyBanned, color: 'orange', desc: 'Türkiye\'de kullanımı yasaklanmış aktif maddeler (Ek-4). Kalıntı değerlendirilirken Ek-3 LOD veya 0,01 mg/kg uygulanır.' },
        'russia-zero': { items: russiaZero, color: 'red', desc: 'Rusya mevzuatında sıfır tolerans — x−U > 0 ise uygunsuz.' },
        'russia-no-limit': { items: russiaNoLimit, color: 'purple', desc: 'Rusya mevzuatında MRL gereği olmayan limitsiz maddeler.' },
    }), [turkeyBanned, russiaZero, russiaNoLimit]);
    const filteredSpecial = useMemo(() => {
        const items = specialMeta[specialListTab].items;
        return specialSearch ? items.filter(p => p.toLowerCase().includes(specialSearch.toLowerCase())) : items;
    }, [specialMeta, specialListTab, specialSearch]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 32, height: 32, backgroundColor: '#19A78C', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div><h1 className="text-lg font-bold text-gray-900 leading-tight">MRL <span className="text-[#19A78C]">Control</span></h1><p className="text-xs text-gray-400">TGK-PKY RG 27.09.2021/31611 · Rehber Rev.1 (25.02.2022)</p></div>
                    </div>
                    <Link href="/"><button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-emerald-600 text-sm transition-colors">← Ana Sayfa</button></Link>
                </div>
                <div className="flex border-b border-gray-200 mb-6 gap-0">
                    <button className={tabCls('input')} onClick={() => setActiveTab('input')}>📋 Veri Girişi</button>
                    <button className={tabCls('report')} onClick={() => setActiveTab('report')} disabled={!allResults.length}>📊 Rapor{visibleResults.length > 0 ? ` (${visibleResults.length})` : ''}{hiddenCount > 0 && <span className="ml-1 text-xs text-gray-400">+{hiddenCount}</span>}</button>
                    <button className={tabCls('special')} onClick={() => setActiveTab('special')}>🔖 Özel Listeler</button>
                    <button className={tabCls('guide')} onClick={() => setActiveTab('guide')}>📖 Mevzuat</button>
                </div>

                {activeTab === 'input' && (
                    <div className="space-y-4 max-w-3xl">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">1. Ürün Menşei / Değerlendirme Tipi</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { val: 'import' as ProductOrigin, icon: '🌍', title: 'İthal Ürün', sub: 'Ek-3 (AB 396/2005 uyumlu)' },
                                    { val: 'domestic' as ProductOrigin, icon: '🇹🇷', title: 'Türkiye\'de Üretilen', sub: 'Ek-2 (BKÜ Ruhsatlandırma)' },
                                    { val: 'export' as ProductOrigin, icon: '✈️', title: 'İhracat (TR Kaynaklı)', sub: 'Hedef ülke mevzuatı — TGK uygulanmaz' },
                                ].map(opt => (
                                    <button key={opt.val} onClick={() => setOrigin(opt.val)} className={`p-3 rounded-xl border-2 text-left transition-all ${origin === opt.val ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="text-xl mb-1">{opt.icon}</div>
                                        <div className="font-semibold text-xs text-gray-800">{opt.title}</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.sub}</div>
                                    </button>
                                ))}
                            </div>
                            {origin === 'domestic' && <BKUGuide />}
                            {origin === 'export' && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-700 flex items-center gap-1">✈️ <strong>İhracat Değerlendirmesi</strong></p>
                                    <p className="text-[11px] text-blue-600 mt-1">İhracat senaryosunda TGK-PKY değil, <strong>hedef ülkenin kendi mevzuatı</strong> geçerlidir. Aşağıdaki tabloda ilgili ülkenin limitlerini göreceksiniz. ★ TGK etiketi gösterilmez.</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">2. Ölçüm Belirsizliği (U)</p>
                            <label className="flex items-start gap-3 cursor-pointer mb-4"><input type="checkbox" checked={useOB} onChange={e => setUseOB(e.target.checked)} className="mt-0.5 w-4 h-4 rounded text-emerald-500 border-gray-300" /><div><span className="text-sm font-medium text-gray-700">ÖB Uygula — Numune Alma Tebliği Md.6/9: x − U ≤ Yasal Limit</span><p className="text-xs text-gray-400 mt-0.5">MRL, LOD ve varsayılan 0,01 mg/kg için aynı formül geçerlidir. Rusya/CODEX/İhracat için U uygulanmaz.</p></div></label>
                            {useOB && (<div className="ml-7 space-y-3"><label className="flex items-start gap-3 cursor-pointer"><input type="radio" checked={useDGSante} onChange={() => setUseDGSante(true)} className="mt-0.5 w-4 h-4 text-emerald-500" /><div><span className="text-sm font-medium text-gray-700">DG-SANTE E13 — <strong>%50</strong> (U = x × 0,50)</span><p className="text-xs text-amber-600 mt-0.5">⚠ Lab ölçüm belirsizliği &lt; %50 olmalıdır</p></div></label><label className="flex items-center gap-3 cursor-pointer"><input type="radio" checked={!useDGSante} onChange={() => setUseDGSante(false)} className="w-4 h-4 text-emerald-500" /><span className="text-sm text-gray-700">Özel ÖB:</span>{!useDGSante && (<div className="flex items-center gap-2"><input type="range" min="10" max="100" step="5" value={customOBPct} onChange={e => setCustomOBPct(Number(e.target.value))} className="w-28 accent-emerald-500" /><span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded min-w-[40px]">%{customOBPct}</span></div>)}</label><div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700"><strong>Aktif:</strong> U = x × {(effectiveOBPct / 100).toFixed(2)} → x − U = x × {(1 - effectiveOBPct / 100).toFixed(2)}</div></div>)}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">3. Varsayılan Limit — TGK-PKY Md.7/3</p>
                            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={applyDefaultLimit} onChange={e => setApplyDefaultLimit(e.target.checked)} className="mt-0.5 w-4 h-4 rounded text-sky-500 border-gray-300" /><div><span className="text-sm font-medium text-gray-700">MRL ve LOD bulunamadığında <strong>0,01 mg/kg</strong> uygula</span><p className="text-xs text-gray-400 mt-0.5">Ek-4 yasaklı maddeler dahil: Ek-3'te LOD yoksa 0,01 mg/kg uygulanır (Rehber Bölüm 3/5). İhracat senaryosunda bu varsayılan uygulanmaz.</p></div></label>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><div className="bg-gray-50 px-5 py-3 border-b border-gray-200"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">4. Laboratuvar Sonuçları</p><p className="text-xs text-gray-400 mt-0.5">Ürün [Tab] Pestisit [Tab] Değer (mg/kg) — en fazla {MAX_ROWS} satır</p></div><div className="p-5"><textarea value={pasteData} onChange={e => setPasteData(e.target.value)} placeholder={`citrus fruit\tmalathion\t0.10\napple\tglyphosate\t0.05\nwheat\tchlorpyrifos\t0.02`} className="w-full h-36 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 resize-none transition-all" />{loadStatus && <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-emerald-50 px-3 py-2 rounded-lg"><svg className="animate-spin h-3.5 w-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{loadStatus}</div>}<div className="flex gap-3 mt-4"><button onClick={handleAnalyze} disabled={loading || !pasteData.trim()} className="flex-1 text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]" style={{ background: loading || !pasteData.trim() ? '#9ca3af' : 'linear-gradient(135deg, #19A78C 0%, #0e8f79 100%)', boxShadow: loading || !pasteData.trim() ? 'none' : '0 4px 16px rgba(25,167,140,0.45)' }}>{loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analiz Ediliyor...</span> : <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Analizi Başlat</span>}</button><button onClick={clearAll} className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3.5 rounded-xl text-sm transition-colors">Temizle</button></div></div></div>
                        {origin === 'domestic' && parsedRows.length > 0 && <DomesticMRLInput rows={parsedRows} manualMRLs={manualMRLs} onChange={setManualMRLs} />}
                    </div>
                )}

                {activeTab === 'report' && stats && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3"><p className="text-xs text-gray-400">Menşe / Ek</p><p className="text-sm font-semibold text-gray-800 mt-0.5">{origin === 'import' ? '🌍 İthal — Ek-3' : origin === 'domestic' ? '🇹🇷 TR Üretim — Ek-2' : '✈️ İhracat — Hedef Ülke'}</p></div>
                            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3"><p className="text-xs text-gray-400">ÖB Yöntemi</p><p className="text-sm font-semibold text-gray-800 mt-0.5">{useOB ? `DG-SANTE E13 — %${effectiveOBPct}` : 'Uygulanmadı'}</p></div>
                            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3"><p className="text-xs text-gray-400">Varsayılan</p><p className="text-sm font-semibold text-gray-800 mt-0.5">{applyDefaultLimit ? '0,01 mg/kg (Md.7/3)' : 'Devre dışı'}</p></div>
                            <div className={`rounded-xl border px-4 py-3 ${stats.compliance >= 80 ? 'bg-emerald-50 border-emerald-200' : stats.compliance >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}><p className="text-xs text-gray-500">★ TGK Uyumluluğu</p><p className={`text-2xl font-bold mt-0.5 ${stats.compliance >= 80 ? 'text-emerald-700' : stats.compliance >= 50 ? 'text-amber-700' : 'text-red-700'}`}>%{stats.compliance}</p></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[{ l: '★ TGK Toplam', v: stats.total, c: 'text-gray-800', bg: 'bg-white' }, { l: 'Uyumlu', v: stats.pass, c: 'text-emerald-700', bg: 'bg-emerald-50' }, { l: 'Uyarı', v: stats.warn, c: 'text-amber-700', bg: 'bg-amber-50' }, { l: 'Uygunsuz', v: stats.fail, c: 'text-red-700', bg: 'bg-red-50' }, { l: 'Varsayılan', v: stats.defApplied, c: 'text-sky-700', bg: 'bg-sky-50' }].map(s => (<div key={s.l} className={`${s.bg} rounded-xl border border-gray-200 p-4 text-center`}><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-500 mt-0.5">{s.l}</p></div>))}
                        </div>
                        {stats.defApplied > 0 && (<div className="flex gap-3 items-start bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-800"><span>ℹ️</span><div><strong>{stats.defApplied} kayıtta</strong> MRL/LOD bulunamadı → TGK-PKY Md.7/3: <strong>0,01 mg/kg</strong> varsayılan. Formül: x − U ≤ 0,01.</div></div>)}
                        {origin === 'domestic' && visibleResults.some(r => r.isTGK && r.isDefaultLimit) && (<div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800"><span>🇹🇷</span><div>Bazı kayıtlarda <strong>Ek-2 MRL</strong> girilmedi. Bu satırlar için Ek-3 hiyerarşisi veya 0,01 mg/kg varsayılan uygulandı. Daha doğru değerlendirme için <a href={BKU_URL} target="_blank" rel="noopener noreferrer" className="underline font-semibold">BKÜ veri tabanından</a> MRL'leri alıp Veri Girişi &gt; Ek-2 MRL alanlarına ekleyin.</div></div>)}
                        {visibleResults.some(r => r.isBanned) && (<div className="flex gap-3 items-start bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800"><span>⚠️</span><div><strong>Ek-4 yasaklı madde</strong> içeren satırlar var (turuncu etiket). Bu maddeler için karar Ek-3'teki LOD veya 0,01 mg/kg'ye göre verilir. Kalıntı değeri limit altındaysa numune uygun sayılır (Rehber Bölüm 3/5).</div></div>)}
                        {hiddenCount > 0 && (<button onClick={unhideAll} className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1">🔄 Gizlenenleri göster ({hiddenCount})</button>)}
                        {Array.from(grouped.entries()).map(([key, recs]) => {
                            const [prod, pest] = key.split('|||');
                            const tgkRecs = recs.filter(r => r.isTGK);
                            const tgkFail = tgkRecs.some(r => ['FAIL', 'ZERO_TOLERANCE', 'DEFAULT_LIMIT_FAIL'].includes(r.status));
                            const tgkWarn = tgkRecs.some(r => r.status === 'WARNING');
                            const flags = recs[0]?.specialFlags ?? [];
                            const hasBanned = recs.some(r => r.isBanned);
                            return (
                                <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className={`px-5 py-3.5 border-b flex items-center gap-3 flex-wrap ${tgkFail ? 'bg-red-50 border-red-100' : tgkWarn ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                        <span>{tgkFail ? '❌' : tgkWarn ? '⚠️' : '✅'}</span>
                                        <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 truncate text-sm">{prod}</h3><p className="text-xs text-gray-500 font-mono">{pest}</p></div>
                                        {hasBanned && (<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">⚠ Ek-4</span>)}
                                        {flags.filter(f => f.type !== 'turkey-banned').map(f => (<span key={f.type} className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.type === 'russia-zero' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{f.label}</span>))}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{origin === 'import' ? '🌍 Ek-3' : origin === 'domestic' ? '🇹🇷 Ek-2' : '✈️ Hedef Ülke'}</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead><tr className="bg-gray-50 border-b border-gray-100 text-gray-400"><th className="w-7 px-2 py-2"></th><th className="px-3 py-2 text-left font-medium">Yetki Alanı</th><th className="px-3 py-2 text-left font-medium">x (mg/kg)</th><th className="px-3 py-2 text-left font-medium">U (mg/kg)</th><th className="px-3 py-2 text-left font-medium">x−U (mg/kg)</th><th className="px-3 py-2 text-left font-medium">Limit</th><th className="px-3 py-2 text-left font-medium">Dayanak</th><th className="px-3 py-2 text-left font-medium">TGK Eki</th><th className="px-3 py-2 text-left font-medium">Durum</th><th className="px-3 py-2 text-left font-medium">Kullanım %</th></tr></thead>
                                            <tbody className="divide-y divide-gray-50">{recs.map(r => {
                                                const cfg = STATUS[r.status] ?? STATUS['NOT_FOUND'];
                                                const isFailing = ['FAIL', 'ZERO_TOLERANCE', 'DEFAULT_LIMIT_FAIL'].includes(r.status);
                                                const pct = Math.min((r.ratio ?? 0) * 100, 150);
                                                const barColor = ['PASS', 'DEFAULT_LIMIT_PASS'].includes(r.status) ? '#10b981' : r.status === 'WARNING' ? '#f59e0b' : '#ef4444';
                                                return (<tr key={r.id} className={`hover:bg-gray-50 transition-colors ${isFailing ? 'bg-red-50/30' : r.status === 'WARNING' ? 'bg-amber-50/30' : r.isDefaultLimit ? 'bg-sky-50/20' : ''} ${r.isTGK ? 'font-medium' : ''}`}>
                                                    <td className="px-2 py-2.5"><button onClick={() => hideResult(r.id)} className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">✕</button></td>
                                                    <td className="px-3 py-2.5 whitespace-nowrap">{r.isTGK && <span className="text-emerald-600 font-bold mr-1">★</span>}<span>{getFlag(r.country.code)}</span><span className={`ml-1 ${r.isTGK ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{r.country.name}</span>{r.isBanned && <span className="ml-1 text-xs text-orange-500 font-semibold">[Ek-4]</span>}</td>
                                                    <td className="px-3 py-2.5 font-mono text-gray-700">{r.measured.toFixed(4)}</td>
                                                    <td className="px-3 py-2.5 font-mono text-gray-400">{r.u > 0 ? r.u.toFixed(4) : <span className="text-gray-200">—</span>}</td>
                                                    <td className="px-3 py-2.5 font-mono"><span className={`font-semibold ${isFailing ? 'text-red-700' : r.status === 'WARNING' ? 'text-amber-700' : 'text-emerald-700'}`}>{r.xMinusU.toFixed(4)}</span></td>
                                                    <td className="px-3 py-2.5 font-mono">{r.isNoLimit ? <span className="text-purple-600 font-semibold">Limitsiz</span> : r.status === 'ZERO_TOLERANCE' ? <span className="text-red-700 font-semibold">0.0000</span> : r.status === 'NOT_FOUND' ? <span className="text-gray-300">—</span> : <span className={r.isDefaultLimit ? 'text-sky-700' : 'text-gray-800'}>{r.effectiveLimit.toFixed(4)}{r.isDefaultLimit && <span className="text-sky-400 ml-0.5">*</span>}</span>}</td>
                                                    <td className="px-3 py-2.5"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.decisionBasis === 'MRL' ? 'bg-emerald-100 text-emerald-700' : r.decisionBasis === 'LOD' ? 'bg-blue-100 text-blue-700' : r.decisionBasis === 'DEFAULT_0.01' ? 'bg-sky-100 text-sky-700' : r.decisionBasis === 'ZERO_LIST' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{r.decisionBasis}</span></td>
                                                    <td className="px-3 py-2.5 text-gray-400">{r.annexSource}</td>
                                                    <td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`} title={cfg.desc}>{cfg.icon} {cfg.label}</span></td>
                                                    <td className="px-3 py-2.5 min-w-[100px]">{r.effectiveLimit > 0 && r.ratio < 900 ? (<div className="flex items-center gap-1.5"><div className="flex-1 bg-gray-200 rounded-full h-1.5 relative"><div className="absolute top-0 bottom-0 w-px bg-amber-400/70" style={{ left: `${WARNING_RATIO * 100}%` }} /><div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} /></div><span className="font-mono text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span></div>) : r.ratio >= 900 ? <span className="text-red-500 font-semibold text-xs">Aşıldı</span> : <span className="text-gray-200">—</span>}</td>
                                                </tr>);
                                            })}</tbody>
                                        </table>
                                    </div>
                                    <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-0.5"><span>★ TGK asıl değerlendirme</span><span>* 0,01 mg/kg varsayılan (Md.7/3)</span><span>[Ek-4] yasaklı madde — karar LOD/0,01 mg/kg'ye göre</span><span>Progress bar'daki sarı çizgi = Limit×%{Math.round(WARNING_RATIO * 100)}</span></div>
                                </div>
                            );
                        })}
                        {showReport && (<div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between"><span className="text-sm font-semibold text-gray-700">📄 Resmi Rapor Metni (TGK-PKY Uyumlu)</span><button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-gray-600">✕</button></div><pre className="p-5 text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">{generateReport()}</pre></div>)}
                        <div className="flex flex-wrap gap-3 justify-center pt-1"><button onClick={() => setActiveTab('input')} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 rounded-xl text-sm transition-colors">🔄 Yeni Analiz</button><button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 rounded-xl text-sm transition-colors">⬇ CSV İndir</button><button onClick={() => setShowReport(v => !v)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 rounded-xl text-sm transition-colors">📄 {showReport ? 'Raporu Gizle' : 'Rapor Metni Üret'}</button></div>
                    </div>
                )}

                {activeTab === 'special' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {[{ key: 'turkey-banned' as SpecialListTab, icon: '🇹🇷', label: 'TR Yasaklı (Ek-4)', count: turkeyBanned.length, color: 'orange' }, { key: 'russia-zero' as SpecialListTab, icon: '⛔', label: 'RU Sıfır Tolerans', count: russiaZero.length, color: 'red' }, { key: 'russia-no-limit' as SpecialListTab, icon: '🔬', label: 'RU Limitsiz', count: russiaNoLimit.length, color: 'purple' }].map(item => (<button key={item.key} onClick={() => { setSpecialListTab(item.key); setSpecialSearch(''); }} className={`p-4 rounded-xl border-2 text-left transition-all ${specialListTab === item.key ? (item.color === 'orange' ? 'border-orange-400 bg-orange-50' : item.color === 'red' ? 'border-red-400 bg-red-50' : 'border-purple-400 bg-purple-50') : 'border-gray-200 bg-white hover:border-gray-300'}`}><div className="text-xl mb-1">{item.icon}</div><div className="font-semibold text-sm text-gray-800">{item.label}</div><div className="text-xs text-gray-400 mt-0.5">{loadingLists ? '...' : `${item.count} madde`}</div></button>))}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><div className={`px-5 py-3 border-b text-sm text-gray-600 ${specialListTab === 'turkey-banned' ? 'bg-orange-50 border-orange-100' : specialListTab === 'russia-zero' ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>{specialMeta[specialListTab].desc}</div><div className="p-5"><input type="text" value={specialSearch} onChange={e => setSpecialSearch(e.target.value)} placeholder="Pestisit adı ara..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 mb-4 transition-all" />{loadingLists ? <div className="text-center py-10 text-gray-400 text-sm">Yükleniyor...</div> : filteredSpecial.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">{specialSearch ? 'Eşleşme yok' : 'Liste boş'}</div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">{filteredSpecial.map((item, idx) => (<div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${specialListTab === 'turkey-banned' ? 'bg-orange-50 border-orange-100 text-orange-800' : specialListTab === 'russia-zero' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-purple-50 border-purple-100 text-purple-800'}`}><span className="opacity-40 text-xs">•</span><span className="truncate">{item}</span></div>))}</div>}<p className="text-xs text-gray-400 mt-3">{filteredSpecial.length} / {specialMeta[specialListTab].items.length} madde</p></div></div>
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="space-y-4 max-w-3xl">
                        <div className="bg-white rounded-xl border border-gray-200 p-6"><h2 className="text-base font-bold text-gray-900 mb-5">📖 TGK-PKY Rehber Rev.1 — Karar Destek Özeti</h2>
                            {[
                                {
                                    color: 'emerald', icon: '🏷', title: '1. Menşe Ayrımı — TGK Ekleri', items: [
                                        'İthal ürünler → Ek-3: AB 396/2005 uyumlu MRL/LOD değerleri esas alınır.',
                                        'Türkiye\'de üretilen ürünler → Ek-2: BKÜ Ruhsatlandırma Yönetmeliği MRL\'leri (bku.tarimorman.gov.tr).',
                                        'Yasaklı aktif maddeler → Ek-4: Ek-3\'te LOD varsa o değer, yoksa 0,01 mg/kg geçerlidir.',
                                        'Hiyerarşi: Ek-2/Ek-3 MRL → LOD → 0,01 mg/kg varsayılan.',
                                    ]
                                },
                                {
                                    color: 'blue', icon: '⚗', title: '2. Karar Formülü — Numune Alma Tebliği Md.6/9', items: [
                                        'Tüm yasal limitler için tek formül: x − U ≤ Limit → Uyumlu',
                                        'MRL mevcutsa: x − U ≤ MRL',
                                        'Yalnızca LOD mevcutsa: x − U ≤ LOD (LOD da bir yasal limittir; aynı formül uygulanır)',
                                        'MRL de LOD da yoksa: x − U ≤ 0,01 mg/kg → TGK-PKY Md.7/3 varsayılan',
                                        'Rusya ve CODEX: U uygulanmaz; x − 0 = x doğrudan karşılaştırılır.',
                                        'Rehber Örnek 1: LOD=0,01* için x=0,020 → U=0,010 → x−U=0,010 ≤ 0,01* → UYGUN',
                                    ]
                                },
                                {
                                    color: 'amber', icon: '⚖️', title: '3. DG-SANTE E13 — Ölçüm Belirsizliği', items: [
                                        'U = x × 0,50 (Ölçülen değerin %50\'si)',
                                        'Koşul: Laboratuvar ölçüm belirsizliği < %50 olmalıdır.',
                                        'x − U = x × 0,50 — bu değer MRL, LOD veya varsayılan ile karşılaştırılır.',
                                        'Avrupa mevzuatı ile uyumlu standart hesap yöntemi.',
                                    ]
                                },
                                {
                                    color: 'orange', icon: '⚠️', title: '4. Ek-4 Yasaklı Maddeler (Rehber Bölüm 3/5)', items: [
                                        'Ek-4\'teki pestisit için Ek-3\'te LOD belirlenmişse x − U ≤ LOD uygulanır.',
                                        'Ek-3\'te LOD da yoksa x − U ≤ 0,01 mg/kg varsayılan uygulanır.',
                                        'Değer limitin altındaysa numune UYGUN sayılır — yasak yalnızca "ruhsat yok" anlamına gelir.',
                                        'İşlenmiş ürünlerde Ek-4 maddeleri için işleme faktörü kullanılmaz.',
                                    ]
                                },
                                {
                                    color: 'sky', icon: '📊', title: '5. Karar Skalası', items: [
                                        '✓ PASS: x − U ≤ Limit',
                                        `⚠ WARNING: x − U > Limit × %${Math.round(WARNING_RATIO * 100)} ve ≤ Limit — Sınıra yakın, dikkat`,
                                        '✗ FAIL: x − U > Limit — Uygunsuz',
                                        '0 ZERO TOLERANCE: Rusya sıfır tolerans — x−U > 0 ise uygunsuz',
                                        'D DEFAULT ✓/✗: MRL/LOD bulunamadı, 0,01 mg/kg uygulandı (Md.7/3)',
                                    ]
                                },
                                {
                                    color: 'purple', icon: '✈️', title: '6. İhracat Özel Durumu', items: [
                                        'TGK-PKY, Türkiye piyasasına giren ürünler içindir. İhracat edilen ürünlere uygulanmaz.',
                                        'İhracat senaryosunda geçerli olan, hedef ülkenin kendi mevzuatıdır (AB, Rusya, SA, vb.).',
                                        'Bu nedenle ihracat seçildiğinde ★ TGK etiketi gösterilmez ve değerlendirme doğrudan hedef ülke limitlerine göre yapılır.',
                                    ]
                                },
                            ].map(s => (
                                <div key={s.title} className={`mb-4 p-4 rounded-xl border bg-${s.color}-50 border-${s.color}-100`}>
                                    <h3 className={`font-semibold text-${s.color}-800 mb-2 text-sm`}>{s.icon} {s.title}</h3>
                                    <ul className="space-y-1">
                                        {s.items.map((item, idx) => (
                                            <li key={idx} className={`text-xs text-${s.color}-700 flex items-start gap-1.5`}>
                                                <span className="opacity-40 mt-0.5 shrink-0">›</span><span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <p className="text-xs text-gray-400 border-t pt-4 mt-2">Kaynak: TGK Pestisitlerin Maksimum Kalıntı Limitleri Yönetmeliği (RG: 27.09.2021/31611) · Rehber Rev.1 (25.02.2022) — T.C. Tarım ve Orman Bakanlığı GKGM</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}