import { source } from '@/lib/source';

export default async function sitemap() {
  const baseUrl = 'https://hydrate.js.org';
  
  const pages = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page.url === '/docs' ? 1 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    ...pages,
  ];
}
