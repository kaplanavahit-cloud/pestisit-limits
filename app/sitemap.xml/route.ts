import { createClient } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mrlcontrol.com';

const staticPages = [
  '',
  '/decision-support',
  '/terms',
  '/privacy',
  '/turkey-banned',
  '/russia-zero-tolerance',
  '/russia-no-limit',
];

const today = new Date().toISOString().split('T')[0];

export async function GET() {
  const supabase = createClient();

  const { data: countries } = await supabase
    .from('countriesa')
    .select('id, name, code');

  const { data: limits } = await supabase
    .from('country_limitsa')
    .select('id, pesticide_name, product_name, country_id');

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const page of staticPages) {
    sitemap += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  }

  if (countries && countries.length > 0) {
    for (const country of countries) {
      sitemap += `
  <url>
    <loc>${BASE_URL}/country/${country.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  if (limits && limits.length > 0) {
    const uniqueKeys = new Set();
    for (const limit of limits) {
      const key = `${limit.product_name}-${limit.pesticide_name}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        const slug = encodeURIComponent(
          `${limit.product_name} ${limit.pesticide_name}`.toLowerCase().replace(/\s+/g, '-')
        );
        sitemap += `
  <url>
    <loc>${BASE_URL}/pesticide/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
      if (uniqueKeys.size >= 5000) break;
    }
  }

  sitemap += `
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}