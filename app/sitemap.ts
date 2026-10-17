import type { MetadataRoute } from 'next';
import { portfolio } from '../content/portfolio';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: portfolio.meta.canonical,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
