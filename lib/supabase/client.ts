import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ✅ Environment variable kullan (sabit değil!)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Tek bir client oluştur
export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Bu fonksiyonu döndür
export function createClient() {
  return supabase
}