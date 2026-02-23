import { Metadata } from 'next';
import BrandArchiveClient from './BrandArchiveClient';

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);

  return {
    title: `${decodedBrand} Archive | Auvra Curation`,
    description: `Browse our expertly curated archive of ${decodedBrand} pieces. One-of-one finds, verified quality, and high-fidelity sourcing for the modern individual.`,
    alternates: {
      canonical: `https://auvra-nine.vercel.app/archive/brand/${brand}`,
    },
    openGraph: {
      title: `${decodedBrand} Archive | Auvra`,
      description: `Secured 1-of-1 ${decodedBrand} archive pieces.`,
    },
  };
}

export default async function Page({ params }: Props) {
  return <BrandArchiveClient params={params} />;
}
