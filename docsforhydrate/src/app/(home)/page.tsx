import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center text-center flex-1 px-4">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="mb-16">
          <Image 
            src="/logo/hydratebeer-nobg.png" 
            alt="🍺 HydrateBeer" 
            width={120} 
            height={120}
            className="mx-auto mb-8 dark:hidden"
          />
          <Image 
            src="/logo/hydratebeer-nobg-white.png" 
            alt="🍺 HydrateBeer" 
            width={120} 
            height={120}
            className="mx-auto mb-8 hidden dark:block"
          />
          <h1 className="text-6xl font-bold mb-6">
            HydrateBeer
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4 font-medium">
            Zero-config performance monitoring for React and Next.js
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10">
            Track hydration timing, component renders, and web vitals with privacy-first analytics
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Link 
              href="/docs" 
              className="px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started →
            </Link>
            <a 
              href="https://github.com/nerkoux/hydratebeer" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              View on GitHub
            </a>
          </div>

          {/* Quick Install */}
          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="text-left">
              <div className="text-xs text-gray-400 mb-2">Quick Install</div>
              <code className="text-green-400 font-mono text-sm">
                npx hydrate-beer init
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
