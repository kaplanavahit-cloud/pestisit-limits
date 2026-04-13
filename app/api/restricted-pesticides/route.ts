// app/api/restricted-pesticides/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CUSTOM_LISTS } from '@/lib/pesticide-lists'
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000,  // 1 dakika
  uniqueTokenPerInterval: 500,
  limit: 30,  // dakikada 30 istek
});

export async function GET(request: Request) {
  try {
    // Rate limit kontrolü
    await limiter.check(request);
    
    const { searchParams } = new URL(request.url)
    const listType = searchParams.get('listType') 
    // 'turkey-banned', 'russia-zero-tolerance', 'russia-no-limit', 'russia-banned'
    const source = searchParams.get('source') // 'custom', 'db', 'all'

    // ✅ DÜZELTİLDİ: await eklendi
    const supabase = await createClient()
    
    let results: any[] = []
    let customList: string[] = []
    let titleText = ''
    let mrlNote = ''

    // =====================================================
    // 1. ÖZEL LİSTEDEN ÇEK
    // =====================================================
    if (source === 'custom' || source === 'all') {
      
      // Türkiye Yasaklılar
      if (listType === 'turkey-banned') {
        customList = CUSTOM_LISTS.TURKEY_BANNED || []
        titleText = 'Türkiye\'de Kullanımı Sonlandırılan Yasaklı Pestisitler'
        mrlNote = 'Kullanımı yasaklanmıştır'
        results = customList.map(name => ({
          pesticide_name: name,
          source_type: 'custom',
          source_text: titleText,
          mrl_value: mrlNote,
          country: 'Türkiye'
        }))
      }
      
      // Rusya - Hiçbir Üründe Bulunmaması Gerekenler
      else if (listType === 'russia-zero-tolerance') {
        customList = CUSTOM_LISTS.RUSSIA_ZERO_TOLERANCE || []
        titleText = 'Hiçbir Üründe Bulunmaması Gereken Pestisitler'
        mrlNote = '0 mg/kg (tespit edilemez)'
        results = customList.map(name => ({
          pesticide_name: name,
          source_type: 'custom',
          source_text: titleText,
          mrl_value: mrlNote,
          country: 'Rusya'
        }))
      }
      
      // Rusya - Limit Belirlenmesine Gerek Yok
      else if (listType === 'russia-no-limit') {
        customList = CUSTOM_LISTS.RUSSIA_NO_LIMIT || []
        titleText = 'Limit Belirlenmesine Gerek Yok'
        mrlNote = 'Limit yok'
        results = customList.map(name => ({
          pesticide_name: name,
          source_type: 'custom',
          source_text: titleText,
          mrl_value: mrlNote,
          country: 'Rusya'
        }))
      }
      
      // Rusya Yasaklılar
      else if (listType === 'russia-banned') {
        customList = CUSTOM_LISTS.RUSSIA_BANNED || []
        titleText = 'Rusya Yasaklı Pestisitler'
        mrlNote = 'Kullanımı yasaklanmıştır'
        results = customList.map(name => ({
          pesticide_name: name,
          source_type: 'custom',
          source_text: titleText,
          mrl_value: mrlNote,
          country: 'Rusya'
        }))
      }
    }

    // =====================================================
    // 2. VERİTABANINDAN ÇEK (opsiyonel)
    // =====================================================
    if (source === 'db' || source === 'all') {
      // Sadece Rusya için veritabanı sorgusu
      if (listType === 'russia-banned' || listType === 'russia-no-limit') {
        let query = supabase
          .from('country_limitsa')
          .select(`pesticide_name, product_name, mrl_value_numeric, mrl_value_text, unit, source_text, source_year`)
          .eq('country_id', 2) // Rusya
          .order('pesticide_name')

        if (listType === 'russia-banned') {
          query = query.or('mrl_value_numeric.lte.0.01,mrl_value_text.eq.0.01*')
        } else if (listType === 'russia-no-limit') {
          query = query.or('mrl_value_numeric.is.null,mrl_value_numeric.lte.0.01')
        }

        const { data: dbResults, error } = await query.limit(100)
        if (!error && dbResults) {
          const uniqueDbResults = [...new Map(dbResults.map(item => [item.pesticide_name, item])).values()]
          results = [...results, ...uniqueDbResults.map(r => ({ 
            ...r, 
            source_type: 'database',
            country: 'Rusya'
          }))]
        }
      }
    }

    // Benzersiz pestisitleri koru
    const uniqueResults = [...new Map(results.map(item => [item.pesticide_name, item])).values()]
    uniqueResults.sort((a, b) => a.pesticide_name.localeCompare(b.pesticide_name))
    
    return NextResponse.json(uniqueResults);
    
  } catch (error: any) {
    // Rate limit hatası
    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}