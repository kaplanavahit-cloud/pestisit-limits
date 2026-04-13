// app/api/products/route.ts

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
    
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) {
      return NextResponse.json({ error: 'Ürün gerekli' }, { status: 400 });
    }

    // ✅ Tablo adı: country_limitsa
    const { data, error } = await supabase
      .from('country_limitsa')
      .select('pesticide_name, product_name, mrl_value_numeric, mrl_value_text, unit, source_text')
      .eq('product_name', product)
      .order('pesticide_name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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