import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Replace this with your actual live Vercel URL (e.g., https://vercel.app)
  const baseUrl = 'https://jesse-math-rockstar-app.vercel.app'
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    }
  ]
}
