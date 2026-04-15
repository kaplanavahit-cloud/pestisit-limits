// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public sayfalar - bu sayfalar terms kabulü olmadan da erişilebilir
const publicPaths = [
  '/',           // Ana sayfa (terms modal burada gösterilecek)
  '/terms',      // Kullanıcı sözleşmesi
  '/privacy',    // Gizlilik politikası
  '/api',        // API route'ları
  '/login',      // Giriş sayfası (isteğe bağlı)
];

export function middleware(request: NextRequest) {
  const termsAccepted = request.cookies.get('terms_accepted')?.value;
  const { pathname } = request.nextUrl;

  // Public sayfa mı kontrol et
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/api'));
  
  // Eğer ana sayfaysa veya public sayfaysa engelleme
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Terms kabul edilmemişse ve public olmayan sayfaya gidiyorsa -> ana sayfaya yönlendir
  if (!termsAccepted) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Middleware'in hangi path'lerde çalışacağını belirt
export const config = {
  matcher: [
    /*
     * Tüm sayfaları kontrol et ama şunları hariç tut:
     * - _next/next (Next.js internal)
     * - favicon.ico, robots.txt (statik dosyalar)
     * - .svg, .png, .jpg, .css, .js (statik dosyalar)
     */
    '/((?!_next|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|css|js)$).*)',
  ],
};