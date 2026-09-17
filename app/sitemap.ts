import { MetadataRoute } from 'next';
import { getSupabase } from '@/src/lib/supabase/client';
import { INITIAL_PRODUCTS } from '@/src/data/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bumikita.web.id';
  const lastModified = new Date();

  // 1. Core High-Priority Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/scan`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/scanner`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/market`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dropoff`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forest`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quests`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/diy`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kalkulator`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sekolah`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sertifikat`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 2. Dynamic Routes Handler (Defensive / Fallback)
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = getSupabase();
    if (supabase) {
      // 2a. Dynamic Community Posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, updated_at, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (posts && posts.length > 0) {
        posts.forEach((post) => {
          dynamicRoutes.push({
            url: `${baseUrl}/community?post=${post.id}`,
            lastModified: new Date(post.updated_at || post.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });
      }

      // 2b. Dynamic Profiles / Schools
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, username, updated_at, created_at')
        .limit(50);

      if (profiles && profiles.length > 0) {
        profiles.forEach((p) => {
          dynamicRoutes.push({
            url: `${baseUrl}/profile?id=${p.id}`,
            lastModified: new Date(p.updated_at || p.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        });
      }
    }
  } catch (error) {
    console.error('Sitemap dynamic fetch failed, continuing with static routes:', error);
  }

  // 2c. Marketplace Product Entries (Catalog items)
  try {
    if (INITIAL_PRODUCTS && INITIAL_PRODUCTS.length > 0) {
      INITIAL_PRODUCTS.forEach((p) => {
        dynamicRoutes.push({
          url: `${baseUrl}/market?product=${p.id}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (err) {
    console.error('Error adding marketplace products to sitemap:', err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
