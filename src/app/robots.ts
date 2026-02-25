import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/auth/',
        '/account/',
        '/personal-hunt/',
        '/demo/',
      ],
    },
    sitemap: 'https://auvra.eu/sitemap.xml',
  };
}
