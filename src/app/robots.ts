import type { MetadataRoute } from 'next';
import { findOne } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let settings: any = null;
  try {
    settings = await findOne('settings', { _id: 'general' } as any);
  } catch {}

  const allowIndex = settings?.robotsIndex ?? true;
  const baseUrl = (settings?.canonicalUrl || 'https://emotionview.com.bd').replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: allowIndex ? '/' : '',
      disallow: allowIndex ? ['/admin/', '/api/', '/account/'] : ['/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
