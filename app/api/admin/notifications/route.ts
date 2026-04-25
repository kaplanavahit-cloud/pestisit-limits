import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-auth')?.value === 'true'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    const { title, message, user_email } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'Başlık ve mesaj zorunludur' }, { status: 400 })
    }

    const supabase = await createClient()

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