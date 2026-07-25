import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://hub-educativo.vercel.app'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/hub`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/arena`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/decks`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]
}
