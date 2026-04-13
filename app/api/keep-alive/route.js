import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  // Basit bir sorgu - sadece bağlantıyı kontrol et
  const { error } = await supabase
    .from('your_table_name')  // Kendi tablo adınızı yazın
    .select('count', { count: 'exact', head: true })
  
  return Response.json({ 
    status: error ? 'error' : 'ok',
    message: error?.message || 'Alive'
  })
}