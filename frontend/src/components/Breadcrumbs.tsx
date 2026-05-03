"use client";

import React from 'react';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on the home page or consultation pages
  if (!pathname || pathname === '/' || pathname.includes('/marketplace/consult/')) return null;

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  return (
    <div className="absolute top-24 left-0 right-0 z-40 w-full max-w-7xl mx-auto px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} />
        </Link>
        
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          // Format segment name (e.g., 'year-book' -> 'Year Book')
          const name = segment.replace(/-/g, ' ');

          return (
            <React.Fragment key={href}>
              <ChevronRight size={14} className="text-border" />
              {isLast ? (
                <span className="text-primary truncate max-w-[200px]">{name}</span>
              ) : (
                <Link href={href} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                  {name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
