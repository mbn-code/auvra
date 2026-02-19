export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // In cents
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
  sourceUrl?: string;
}

export const products: Record<string, Product> = {
  "coldsky-fabric-shaver": {
    id: "coldsky-fabric-shaver",
    name: "Auvra Precision Fabric Shaver",
    tagline: "Unparalleled garment restoration.",
    description: "The ColdSky system features a 3-speed high-torque motor and precision-honed stainless steel blades to eliminate pilling, lint, and fuzz from any fabric. Engineered for luxury knitwear, furniture, and heavy coats.",
    price: 2999,
    currency: "eur",
    category: "Home",
    images: ["https://ae01.alicdn.com/kf/S8de880000000000000000000000000000.jpg"], // Placeholder - real image from Ali
    benefits: ["3-Speed Intelligent Motor", "USB-C Fast Charging", "Safe for Delicate Knits"],
    stripePriceId: "price_lint_remover_premium",
    features: [
      { label: "Battery", value: "Rechargeable Li-ion" },
      { label: "Speeds", value: "3 Modes" },
      { label: "Safety", value: "Auto-Stop Sensor" }
    ],
    trending: true,
    badge: "Best Seller",
    sourceUrl: "https://www.aliexpress.com/item/1005008080390073.html"
  },
  "fur-eraser-pet-hair-roller": {
    id: "fur-eraser-pet-hair-roller",
    name: "Fur-Eraser Archive Roller",
    tagline: "The definitive solution for pet owners.",
    description: "Utilizing kinetic electro-static technology, the Fur-Eraser lifts pet hair from deep within upholstery fibers without the need for adhesive strips or power. 100% reusable and built for permanence.",
    price: 3499,
    currency: "eur",
    category: "Home",
    images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"],
    benefits: ["Perpetual Reuse System", "One-Click Instant Disposal", "Museum-Grade Fabric Care"],
    stripePriceId: "price_pet_hair_eur",
    features: [
      { label: "Mechanism", value: "Mechanical Kinetic" },
      { label: "Durability", value: "Lifetime" }
    ],
    trending: true,
    badge: "Community Choice"
  },
  "power-scrub-max-spin": {
    id: "power-scrub-max-spin",
    name: "PowerScrub Precision Spin",
    tagline: "Technical cleaning, simplified.",
    description: "A high-performance rotational tool designed for precision sanitation. Spinning at 300RPM with specialized brush heads, it removes architectural grime and kitchen buildup with zero physical effort.",
    price: 5999,
    currency: "eur",
    category: "Tech",
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"],
    benefits: ["Submersible Waterproofing", "High-Torque 300RPM", "Multi-Surface Compatibility"],
    stripePriceId: "price_spin_scrubber_eur",
    features: [
      { label: "Motor", value: "High-Output Brushed" },
      { label: "Charging", value: "USB-C Rapid" },
      { label: "Edition", value: "Stealth Titanium" }
    ],
    stockUrgency: 8,
    isLimited: true,
    isHero: false,
    badge: "Technical Grade"
  }
};
