import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin-auth', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0 // Cookie'yi sil
  })
  return response
}