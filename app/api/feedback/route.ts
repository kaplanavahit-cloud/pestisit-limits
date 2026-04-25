import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_CHARS = 200

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { name, email, message, url } = await request.json()
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Mesaj alanı zorunludur' }, { status: 400 })
    }
    
    if (message.length > MAX_CHARS) {
      return NextResponse.json({ error: `Mesaj ${MAX_CHARS} karakterden uzun olamaz` }, { status: 400 })
    }
    
    const { error } = await supabase.from('feedback').insert({
      name: name || null,
      email: email || null,
      message: message.trim().substring(0, MAX_CHARS),
      url: url || null,
      status: 'pending'
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