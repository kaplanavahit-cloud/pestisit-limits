// app/api/check/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 20,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Ülke kodundan ID'ye mapping
const countryCodeToId: { [key: string]: number } = {
  TR: 1,     // Turkey
  RU: 2,     // Russia
  EU: 3,     // European Union
  CODEX: 4,  // CODEX
  SA: 5,     // Saudi Arabia
};

const countryNames: { [key: string]: string } = {
  TR: 'Türkiye',
  RU: 'Rusya',
  EU: 'Avrupa Birliği',
  CODEX: 'Codex',
  SA: 'Suudi Arabistan'
};

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request);
    
    const { product, pesticide, analysisResult, country } = await request.json();

    if (!product || !pesticide || analysisResult === undefined || !country) {
      return NextResponse.json(
        { error: 'Eksik parametreler: product, pesticide, analysisResult, country gereklidir' },
        { status: 400 }
      );
    }

    const countryId = countryCodeToId[country];
    if (!countryId) {
      return NextResponse.json(
        { error: `Geçersiz ülke kodu: ${country}. Geçerli kodlar: TR, RU, EU, CODEX, SA` },
        { status: 400 }
      );
    }

    // Veritabanından limit bilgisini çek (country_limitsa tablosu)
    const { data, error } = await supabase
      .from('country_limitsa')
      .select('pesticide_name, product_name, mrl_value_numeric, mrl_value_text, unit')
      .eq('product_name', product)
      .eq('pesticide_name', pesticide)
      .eq('country_id', countryId)
      .maybeSingle();

    if (error) {
      console.error('Veri çekme hatası:', error);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Veritabanı hatası: ' + error.message,
          country: countryNames[country] || country,
          analysisResult
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          status: 'unknown', 
          message: `"${product}" ürününde "${pesticide}" pestisiti için ${countryNames[country] || country} limiti bulunamadı.`,
          country: countryNames[country] || country,
          analysisResult
        },
        { status: 200 }
      );
    }

    // Limit değerini al
    const limit = data.mrl_value_numeric;
    const limitText = data.mrl_value_text;

    // Limit yoksa veya özel bir durumsa
    if (limit === null || limit === undefined) {
      return NextResponse.json({
        status: 'unknown',
        message: limitText || `Bu kombinasyon için limit bilgisi bulunamadı.`,
        limit: null,
        analysisResult,
        country: countryNames[country] || country,
        unit: data.unit || 'mg/kg'
      });
    }

    // Limit kontrolü
    const analysisValue = parseFloat(analysisResult);
    const limitValue = parseFloat(limit);
    
    if (isNaN(analysisValue)) {
      return NextResponse.json({
        status: 'error',
        message: `Analiz sonucu geçersiz: "${analysisResult}"`,
        limit: limitValue,
        analysisResult,
        country: countryNames[country] || country
      });
    }
    
    if (analysisValue <= limitValue) {
      return NextResponse.json({
        status: 'pass',
        message: `✅ Geçti: Analiz sonucu (${analysisValue} ${data.unit || 'mg/kg'}) limitin (${limitValue} ${data.unit || 'mg/kg'}) altındadır. Ürün güvenlidir.`,
        limit: limitValue,
        analysisResult: analysisValue,
        country: countryNames[country] || country,
        unit: data.unit || 'mg/kg'
      });
    } else {
      return NextResponse.json({
        status: 'fail',
        message: `❌ Kaldı: Analiz sonucu (${analysisValue} ${data.unit || 'mg/kg'}) limiti (${limitValue} ${data.unit || 'mg/kg'}) aşmaktadır! Ürün uygun değildir.`,
        limit: limitValue,
        analysisResult: analysisValue,
        country: countryNames[country] || country,
        unit: data.unit || 'mg/kg'
      });
    }

  } catch (error: any) {
    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    console.error('Kontrol hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + (error.message || 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
}