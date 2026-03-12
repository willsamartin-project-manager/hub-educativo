import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Hub Educativo',
        short_name: 'HubEdu',
        description: 'Gamificação e Inteligência Artificial para seus estudos.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#6d28d9',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
