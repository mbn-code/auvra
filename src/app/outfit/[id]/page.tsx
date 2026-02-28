import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import OutfitShowcase from "./OutfitShowcase";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OutfitPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch the outfit
  const { data: outfitData, error: outfitError } = await supabase
    .from('user_outfits')
    .select('*')
    .eq('id', id)
    .single();

  if (outfitError || !outfitData) {
    notFound();
  }

  // 2. Hydrate slots (fetch product details for IDs)
  const productIds = Object.values(outfitData.slots).filter(v => v !== null) as string[];
  
  let products: any[] = [];
  if (productIds.length > 0) {
    const { data, error: prodError } = await supabase
      .from('pulse_inventory')
      .select('id, title, brand, listing_price, images, category, status')
      .in('id', productIds);
    
    if (prodError) throw prodError;
    products = data || [];
  }

  // Map products back to slots
  const hydratedSlots: Record<string, any> = {};
  Object.keys(outfitData.slots).forEach(slotKey => {
    const prodId = outfitData.slots[slotKey];
    const product = products.find(p => p.id === prodId);
    hydratedSlots[slotKey] = product || null;
  });

  return (
    <OutfitShowcase 
      id={id}
      name={outfitData.name} 
      slots={hydratedSlots} 
      createdAt={outfitData.created_at}
    />
  );
}
