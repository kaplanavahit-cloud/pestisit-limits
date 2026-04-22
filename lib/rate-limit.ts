// lib/rate-limit.ts

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
  limit: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// robots.txt ve sitemap.xml kontrolü (EN ÜSTTE, EN ÖNEMLİ)
function isPublicPath(pathname: string): boolean {
  return pathname === '/robots.txt' || pathname === '/sitemap.xml';
}

function isGooglebot(userAgent: string): boolean {
  return userAgent.includes('Googlebot');
}

export default function rateLimit(options: RateLimitOptions) {
  const store: RateLimitStore = {};
  
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, options.interval);
  
  return {
    async check(request: Request): Promise<void> {
      // 🔓 1. robots.txt ve sitemap.xml KESİNLİKLE MUAF
      const url = new URL(request.url);
      if (isPublicPath(url.pathname)) {
        console.log(`🔓 Muaf: ${url.pathname} - rate limit atlandı`);
        return;
      }
      
      // 🤖 2. Googlebot da muaf
      const userAgent = request.headers.get('user-agent') || '';
      if (isGooglebot(userAgent)) {
        console.log('🤖 Googlebot muaf');
        return;
      }
      
      // 3. Diğer her şeye rate limit uygula
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
        || request.headers.get('x-real-ip') 
        || 'unknown';
      
      const now = Date.now();
      const key = ip;
      const resetTime = Math.floor(now / options.interval) * options.interval + options.interval;
      
      if (!store[key] || store[key].resetTime < now) {
        store[key] = { count: 1, resetTime };
        return;
      }
      
      store[key].count++;
      if (store[key].count > options.limit) {
        const error: any = new Error('Rate limit exceeded');
        error.statusCode = 429;
        throw error;
      }
    },
  };
}