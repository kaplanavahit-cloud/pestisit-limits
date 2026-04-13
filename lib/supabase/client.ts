import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zgficodgukroifkjaqpe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZmljb2RndWtyb2lma2phcXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjcyMjYsImV4cCI6MjA4OTg0MzIyNn0.jWcqlhkKVv5iwe1l2-7NXuS9Cx_62DkSDw8Fx2LvMD8'

// Tek bir client oluştur
export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Bu fonksiyonu döndür
export function createClient() {
  return supabase
}