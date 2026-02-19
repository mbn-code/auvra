"use client";

import { useState } from "react";
import BundleSelector from "@/components/BundleSelector";
import StickyBuy from "@/components/StickyBuy";

interface ProductInteractionProps {
  productId: string;
  basePrice: number;
  formattedPrice: string;
}

export default function ProductInteraction({ productId, basePrice, formattedPrice }: ProductInteractionProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(2); // Default to best value

  return (
    <div className="space-y-8">
      <BundleSelector 
        basePrice={basePrice} 
        onSelect={(opt) => setSelectedQuantity(opt.quantity)} 
      />
      <StickyBuy 
        productId={productId} 
        price={formattedPrice} 
        quantity={selectedQuantity} 
      />
    </div>
  );
}
