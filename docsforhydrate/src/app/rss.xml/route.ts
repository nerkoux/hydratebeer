import { source } from '@/lib/source';
import RSS from 'rss';

export async function GET() {
  const feed = new RSS({
    title: 'HydrateBeer Documentation',
    description: 'Zero-config performance monitoring for React and Next.js applications',
    site_url: 'https://hydrate.js.org',
    feed_url: 'https://hydrate.js.org/rss.xml',
    language: 'en',
    pubDate: new Date(),
  });

  const pages = source.getPages();

  for (const page of pages) {
    feed.item({
      title: page.data.title,
      description: page.data.description ?? '',
      url: `https://hydrate.js.org${page.url}`,
      date: new Date(),
    });
  }

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
