import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return NextResponse.json({ success: false }, { status: 500 })
  }

  if (password === adminPassword) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'strict' yerine 'lax'
      maxAge: 60 * 60 * 24,
      path: '/' // tüm sayfalarda geçerli olsun
    })
    return response
  }

  return NextResponse.json({ success: false }, { status: 401 })
}