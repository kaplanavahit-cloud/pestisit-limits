// app/api/products/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,  // 1 dakika
  uniqueTokenPerInterval: 500,
  limit: 30,  // dakikada 30 istek
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    // Rate limit kontrolü
    await limiter.check(request);
    
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) {
      return NextResponse.json({ error: 'Ürün gerekli' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pesticide_limits')
      .select('pesticide, eu_limit, eu_status, ru_limit, ru_status, tr_limit, tr_status')
      .eq('product_tr', product)
      .order('pesticide');

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