import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('changelog')
      .select('id, date, title, description')
      .order('date', { ascending: false })
      .limit(3)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 })
  }
}