import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vercel.app'

  return {
    rules: [
      {
        // 1. Give full access to legitimate search engines to boost our SEO
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'Slurp'],
        allow: ['/', '/dashboard'],
        disallow: ['/api/', '/private/', '/admin/'], // Protect secure database proxy endpoints
      },
      {
        // 2. Prevent aggressive scrapers from wasting our server computing power
        userAgent: ['CCBot', 'GPTBot', 'ChatGPT-User', 'ByteDance', 'AmazonBot'],
        disallow: ['/'],
      },
      {
        // 3. Fallback rule for any other standard crawler
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
