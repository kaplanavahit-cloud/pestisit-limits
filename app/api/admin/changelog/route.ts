import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, title, description, source, source_url } = body
    
    if (!date || !title || !description || !source) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const { error } = await supabase.from('changelog').insert({
      date,
      title,
      description,
      source,
      source_url: source_url || null
    })
    
    if (error) {
      console.error('Supabase hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}