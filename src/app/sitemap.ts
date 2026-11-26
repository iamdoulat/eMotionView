import type { MetadataRoute } from 'next';
import { findMany, findOne } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let settings: any = null;
  try {
    settings = await findOne('settings', { _id: 'general' } as any);
  } catch {}

  if (settings?.sitemapEnabled === false) {
    return [];
  }

  const baseUrl = (settings?.canonicalUrl || 'https://emotionview.com.bd').replace(/\/+$/, '');
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  try {
    const products = await findMany('products', {}, undefined, 500);
    for (const p of products) {
      const slug = p.permalink || p.id || (p as any)._id;
      if (slug) {
        routes.push({
          url: `${baseUrl}/products/${slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    const categories = await findMany('categories', {}, undefined, 100);
    for (const c of categories) {
      const slug = c.slug || c.id || (c as any)._id;
      if (slug) {
        routes.push({
          url: `${baseUrl}/category/${slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {}

  return routes;
}
