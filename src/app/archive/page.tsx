import { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Curated Archives | Discover One-of-One Luxury Pieces",
  description: "Browse our live-sync collection of unique archive pieces. Sourced globally, verified by the Auvra Neural Engine. From Louis Vuitton to Arc'teryx.",
  alternates: {
    canonical: "https://auvra.eu/archive",
  },
  openGraph: {
    title: "Curated Archives | Auvra",
    description: "Discover expertly curated 1-of-1 luxury and streetwear archive pieces.",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ArchiveClient />
    </Suspense>
  );
}
