import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('changelog')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Supabase hatası:', error.message)
      return NextResponse.json({ lastUpdate: null, error: error.message }, { status: 500 })
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ lastUpdate: null })
    }
    
    const lastUpdate = new Date(data[0].date)
    const formattedDate = lastUpdate.toLocaleDateString('tr-TR')
    const formattedTime = lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    
    return NextResponse.json({ 
      lastUpdate: data[0].date,
      formatted: `${formattedDate}, ${formattedTime}`
    })
    
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json({ lastUpdate: null, error: 'Sunucu hatası' }, { status: 500 })
  }
}