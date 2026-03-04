"use client";

import { useState } from "react";
import BundleSelector from "@/components/BundleSelector";
import StickyBuy from "@/components/StickyBuy";
import CrossSellWidget from "@/components/CrossSellWidget";

interface ProductInteractionProps {
  productId: string;
  basePrice: number;
  formattedPrice: string;
}

const CROSS_SELLS = {
  default: {
    id: "tactical-bag-charm",
    name: "Cybernetic Bag Charm",
    price: 999,
    image: "https://images.unsplash.com/photo-1590650153855-89f5bc3e5b32?auto=format&fit=crop&q=80&w=800",
    tagline: "Chaotic Customization",
  },
  "magnetic-tactical-belt": {
    id: "nfc-smart-ring",
    name: "NFC Smart Ring",
    price: 3999,
    image: "https://images.unsplash.com/photo-1620619717387-a25e2e8b2ed3?auto=format&fit=crop&q=80&w=800",
    tagline: "Bionic Utility",
  }
};

export default function ProductInteraction({ productId, basePrice, formattedPrice }: ProductInteractionProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(2); // Default to best value
  const [crossSellActive, setCrossSellActive] = useState(false);

  const crossSellItem = CROSS_SELLS[productId as keyof typeof CROSS_SELLS] || CROSS_SELLS.default;
  
  // Exclude cross-sell if they are already on the cross-sell product page
  // Hiding cross-sell widget from users for now
  const showCrossSell = false; // productId !== crossSellItem.id;

  const getBundleDiscount = (qty: number) => {
    if (qty === 2) return 0.15;
    if (qty >= 3) return 0.25;
    return 0;
  };

  const calculateTotalPrice = () => {
    const discount = getBundleDiscount(selectedQuantity);
    const itemTotal = basePrice * selectedQuantity * (1 - discount);
    const crossSellTotal = crossSellActive ? crossSellItem.price : 0;
    const finalPrice = (itemTotal + crossSellTotal) / 100;
    
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(finalPrice);
  };

  const checkoutItems = [
    { id: productId, quantity: selectedQuantity },
    ...(crossSellActive ? [{ id: crossSellItem.id, quantity: 1 }] : [])
  ];

  return (
    <div className="space-y-8">
      <BundleSelector 
        basePrice={basePrice} 
        onSelect={(opt) => setSelectedQuantity(opt.quantity)} 
      />
      {showCrossSell && (
        <CrossSellWidget 
          item={crossSellItem}
          isSelected={crossSellActive}
          onToggle={setCrossSellActive}
        />
      )}
      <StickyBuy 
        productId={productId} 
        price={calculateTotalPrice()} 
        quantity={selectedQuantity}
        items={checkoutItems}
      />
    </div>
  );
}
