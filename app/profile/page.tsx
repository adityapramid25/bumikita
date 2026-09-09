'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#357A59] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
