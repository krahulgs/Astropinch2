"use client";

import {useTranslations} from 'next-intl';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight italic font-serif">
          {title}
        </h1>
        <p className="text-lg text-white/40 font-normal">
          Coming Soon: We are aligning the stars for this feature.
        </p>
        <div className="w-24 h-px bg-white/20 mx-auto"></div>
      </div>
    </main>
  );
}
