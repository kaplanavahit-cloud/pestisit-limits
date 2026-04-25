import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // Kullanıcı oturumunu kontrol et
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }
    
    const ADMIN_EMAIL = 'mrldestek@gmail.com'
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }
    
    const { title, message, user_email } = await req.json()
    
    const { error } = await supabase.from('notifications').insert({
      title,
      message,
      user_email: user_email || null
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}