"use client";

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function PanchangPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/muhurat');
  }, [router]);

  return null;
}
