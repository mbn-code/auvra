export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: "Footwear" | "Tech" | "Home" | "Wellness";
  videoUrl?: string;
  benefits: string[];
  stripePriceId: string;
  features: {
    label: string;
    value: string;
  }[];
  stockUrgency?: number;
  trending?: boolean;
  isLimited?: boolean;
  isHero?: boolean;
  badge?: string;
}

export const products: Record<string, Product> = {
  "pro-glide-lint-remover": {
    id: "pro-glide-lint-remover",
    name: "Pro-Glide Lint Remover",
    tagline: "Restore your favorite garments.",
    description: "The ultimate tool for restoring your favorite fabrics. Unlike electric shavers, the Pro-Glide uses a precision-engineered copper blade to safely lift lint, pills, and fuzz without damaging the weave.",
    price: 1999,
    currency: "usd",
    category: "Home",
    images: ["https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&q=80&w=800"],
    benefits: ["Zero Damage to Fabrics", "No Batteries Required", "Lifetime Durability"],
    stripePriceId: "price_lint_remover",
    features: [
      { label: "Material", value: "Solid Wood & Pure Copper" },
      { label: "Portability", value: "Travel Friendly" }
    ],
    trending: false
  },
  "fur-eraser-pet-hair-roller": {
    id: "fur-eraser-pet-hair-roller",
    name: "Fur-Eraser Pet Hair Roller",
    tagline: "The end of pet hair on furniture.",
    description: "Forget sticky rollers that run out. The Fur-Eraser uses two-way motion and electro-static charge to trap every single strand of pet hair from sofas, rugs, and beds into a built-in disposal chamber.",
    price: 2499,
    currency: "usd",
    category: "Home",
    images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"],
    benefits: ["100% Reusable Forever", "One-Click Disposal", "Works on All Fabrics"],
    stripePriceId: "price_pet_hair",
    features: [
      { label: "Operation", value: "Mechanical / No Electricity" },
      { label: "Capacity", value: "High-Volume Chamber" }
    ],
    trending: true,
    badge: "Most Popular"
  },
  "power-scrub-max-spin": {
    id: "power-scrub-max-spin",
    name: "PowerScrub Max Spin",
    tagline: "Efficiency in motion.",
    description: "Stop breaking your back over stubborn grout and grime. This high-torque electric scrubber spins at 300RPM to blast through soap scum and stains in seconds. Perfect for bathrooms, kitchens, and car wheels.",
    price: 4499,
    currency: "usd",
    category: "Tech",
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"],
    benefits: ["3 Replaceable Brush Heads", "IPX7 Fully Waterproof", "USB-C Fast Charging"],
    stripePriceId: "price_spin_scrubber",
    features: [
      { label: "Battery Life", value: "90 Minutes Continuous" },
      { label: "Motor", value: "High-Torque 300RPM" },
      { label: "Edition", value: "Stealth Titanium" }
    ],
    stockUrgency: 12,
    isLimited: true,
    isHero: true,
    badge: "Editor's Choice"
  }
};
