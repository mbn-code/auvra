import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { products } from '@/config/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://auvra-nine.vercel.app';

  // 1. Static Routes
  const routes = [
    '',
    '/archive',
    '/pricing',
    '/shipping',
    '/refunds',
    '/privacy',
    '/terms',
    '/legal',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Brand Routes
  const { data: brands } = await supabase
    .from('pulse_inventory')
    .select('brand')
    .eq('status', 'available');
  
  const uniqueBrands = Array.from(new Set(brands?.map(b => b.brand) || []));
  const brandRoutes = uniqueBrands.map(brand => ({
    url: `${baseUrl}/archive/brand/${encodeURIComponent(brand)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  // 3. Dynamic Archive Product Routes
  const { data: archiveItems } = await supabase
    .from('pulse_inventory')
    .select('id')
    .eq('status', 'available');

  const archiveRoutes = (archiveItems || []).map(item => ({
    url: `${baseUrl}/archive/${item.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // 4. Static Product Routes
  const staticProductRoutes = Object.keys(products).map(id => ({
    url: `${baseUrl}/product/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...routes, ...brandRoutes, ...archiveRoutes, ...staticProductRoutes];
}
