import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <Image 
            src="/logo/hydratebeer-nobg.png" 
            alt="🍺" 
            width={28} 
            height={28}
            className="dark:hidden"
          />
          <Image 
            src="/logo/hydratebeer-nobg-white.png" 
            alt="🍺" 
            width={28} 
            height={28}
            className="hidden dark:block"
          />
          <span className="font-semibold">HydrateBeer</span>
        </div>
      ),
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'GitHub',
        url: 'https://github.com/nerkoux/hydratebeer',
        external: true,
      },
    ],
  };
}
