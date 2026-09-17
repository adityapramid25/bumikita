import React from 'react';
import type { Metadata } from 'next';
import DropoffMap from '@/src/components/dropoff/DropoffMap';

export const metadata: Metadata = {
  title: 'Titik Drop-off & Bank Sampah',
  description:
    'Lokasi titik drop-off sampah terpilah dan bank sampah mitra circular economy BumiKita di SMK Negeri 9 Semarang.',
};

export default function DropoffPage() {
  return (
    <div className="pt-10 sm:pt-14 md:pt-16 pb-16">
      <DropoffMap />
    </div>
  );
}

