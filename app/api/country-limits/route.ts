// app/api/country-limits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 dakika
  uniqueTokenPerInterval: 500,
  limit: 10, // Bu IP'den dakikada maksimum 10 istek
});

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limit Kontrolü
    await limiter.check(request);
    
    // 2. Supabase istemcisini oluştur (service_role ile - RLS bypass)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false }, // Session gerekmez
        db: { schema: 'public' }
      }
    );
    
    // 3. Veritabanından tüm verileri çek
    const { data, error } = await supabase
      .from('country_limitsa')
      .select('*');
      
    if (error) throw error;
    
    // 4. Cevabı döndür
    return NextResponse.json(data);
    
  } catch (error: any) {
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