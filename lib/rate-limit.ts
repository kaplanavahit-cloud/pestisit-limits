// lib/rate-limit.ts

interface RateLimitOptions {
  interval: number;  // ms cinsinden (örn: 60 * 1000 = 1 dakika)
  uniqueTokenPerInterval: number;
  limit: number;     // interval başına maksimum istek
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// ✅ Googlebot User-Agent kontrolü
function isGooglebot(userAgent: string): boolean {
  return userAgent.includes('Googlebot');
}

export default function rateLimit(options: RateLimitOptions) {
  const store: RateLimitStore = {};
  
  // Eski kayıtları temizle (bellek sızıntısını önlemek için)
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
      // ✅ Googlebot ise rate limit uygulama (direkt geç)
      const userAgent = request.headers.get('user-agent') || '';
      if (isGooglebot(userAgent)) {
        console.log('🤖 Googlebot tespit edildi, rate limit atlandı');
        return;
      }
      
      // IP adresini al (Vercel'de çalışacak şekilde)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
        || request.headers.get('x-real-ip') 
        || 'unknown';
      
      const now = Date.now();
      const key = ip;
      const resetTime = Math.floor(now / options.interval) * options.interval + options.interval;
      
      if (!store[key] || store[key].resetTime < now) {
        // Yeni kayıt
        store[key] = {
          count: 1,
          resetTime: resetTime,
        };
        return;
      }
      
      // Varolan kayıt
      store[key].count++;
      
      if (store[key].count > options.limit) {
        const error: any = new Error('Rate limit exceeded');
        error.statusCode = 429;
        throw error;
      }
    },
  };
}