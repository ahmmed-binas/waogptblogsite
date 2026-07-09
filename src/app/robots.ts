export const dynamic = 'force-static';

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cms/wp-admin/',
        '/frontend/',
        '/*.json$',
      ],
    },
    sitemap: 'https://waogpt.com/sitemap.xml',
  };
}
