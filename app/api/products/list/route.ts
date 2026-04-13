// app/api/products/list/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  limit: 30,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    await limiter.check(request);
    
    // ✅ Tablo adı: country_limitsa
    const { data, error } = await supabase
      .from('country_limitsa')
      .select('product_name')
      .order('product_name')
      .not('product_name', 'is', null);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Benzersiz ürünleri filtrele
    const uniqueProducts = Array.from(new Set(data.map(item => item.product_name).filter(p => p)));
    
    return NextResponse.json(uniqueProducts);
    
  } catch (error: any) {
    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    console.error('API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}