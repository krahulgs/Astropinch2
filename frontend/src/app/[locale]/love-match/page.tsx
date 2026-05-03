"use client";

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function LoveMatchPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/matching');
  }, [router]);

  return null;
}
