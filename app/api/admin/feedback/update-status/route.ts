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

    const formData = await req.formData()
    const id = formData.get('id')
    const status = formData.get('status')

    if (!id || !status) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }

    const validStatuses = ['pending', 'read', 'resolved']
    if (!validStatuses.includes(status.toString())) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('feedback')
      .update({ status: status.toString() })
      .eq('id', parseInt(id.toString()))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Form submit sonrası sayfayı yenile
    return NextResponse.redirect(new URL('/admin/feedback', req.url))
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}