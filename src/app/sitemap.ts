import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', 'empresa', 'servicos', 'fale-conosco'];
  return routes.map((route) => ({
    url: `${SITE_URL}/${route ? `${route}/` : ''}`,
  }));
}
