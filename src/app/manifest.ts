import type { MetadataRoute } from 'next';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_TAGLINE,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0613',
    theme_color: '#0a0613',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
