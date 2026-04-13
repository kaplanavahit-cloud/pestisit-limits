// app/api/countries/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,  // ✅ EKLENDI - bu satır önemli
  limit: 30,
});

export async function GET(request: NextRequest) {
  try {
    await limiter.check(request);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    
    const { data, error } = await supabase
      .from('country_limitsa')
      .select('*');
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, data: data || [] });
    
  } catch (error: any) {
    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}