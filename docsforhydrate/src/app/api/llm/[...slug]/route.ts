import { getLLMText, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const params = await context.params;
  // Handle 'index' as undefined/empty slug for the home page
  const slug = params.slug?.[0] === 'index' ? undefined : params.slug;
  const page = source.getPage(slug);
  
  if (!page) {
    notFound();
  }

  const text = await getLLMText(page);

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
