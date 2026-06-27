import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Replace this with your actual live Vercel URL (e.g., https://vercel.app)
  const baseUrl = 'https://vercel.app'
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.9,
    },
  ]
}
