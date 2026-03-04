const fs = require('fs');

let content = fs.readFileSync('src/config/products.ts', 'utf8');

// Update category type
content = content.replace(
  'category: "Footwear" | "Tech" | "Home" | "Wellness";',
  'category: "Footwear" | "Tech" | "Home" | "Wellness" | "Accessories" | "Jewelry" | "EDC" | "Hardware";'
);

// We'll append the new products before the last closing brace
const newProducts = `
  "digital-led-fabric-shaver": {
    id: "digital-led-fabric-shaver",
    name: "Cyber-Blade Digital Shaver",
    tagline: "High-speed ASMR restoration.",
    description: "Matte black, USB-rechargeable lint remover with a high-speed motor and 6-leaf stainless steel blades. Features an integrated digital LED display for battery and speed settings. Perfect for restoring vintage darkwear and heavy wool knits.",
    price: 2799,
    currency: "eur",
    category: "Hardware",
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["Digital LED Display", "6-Leaf Stainless Blades", "Tactile ASMR Restoration"],
    stripePriceId: "price_digital_shaver",
    features: [
      { label: "Motor", value: "High-Torque 8000RPM" },
      { label: "Battery", value: "Digital Indicator" },
      { label: "Aesthetic", value: "Cyberpunk Matte Black" }
    ],
    trending: true,
    badge: "Viral Utility",
    shippingZone: "GLOBAL"
  },
  "uvc-sterilization-wand": {
    id: "uvc-sterilization-wand",
    name: "Photon UV-C Sterilization Wand",
    tagline: "Waterless archive preservation.",
    description: "A sleek, handheld wand emitting neon blue UV-C light. Breaks down bacteria and odors on fragile, decades-old garments without harsh chemicals or heat. Techwear for your closet.",
    price: 4499,
    currency: "eur",
    category: "Hardware",
    images: [
      "https://images.unsplash.com/photo-1550009158-9effb6ba7326?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["Zero-Water Sterilization", "Preserves Vintage Fabrics", "Cyberpunk Neon Interface"],
    stripePriceId: "price_uvc_wand",
    features: [
      { label: "Tech", value: "UV-C Photon Emission" },
      { label: "Design", value: "Tactical Handheld" }
    ],
    isLimited: true,
    badge: "Archive Grade",
    shippingZone: "GLOBAL"
  },
  "magnetic-tactical-belt": {
    id: "magnetic-tactical-belt",
    name: "Fidlock-Style Tactical Belt",
    tagline: "The only belt for the 2026 dystopia.",
    description: "Heavy-duty nylon canvas belt featuring a matte black magnetic quick-release buckle. Modular loops allow for attaching D-rings and utility pouches. The foundation of the urban ninja loadout.",
    price: 2499,
    currency: "eur",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1624323914561-1eb5fb14db64?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["Magnetic Quick-Release", "Modular Webbing", "Military-Grade Canvas"],
    stripePriceId: "price_tactical_belt",
    features: [
      { label: "Buckle", value: "Magnetic Snap" },
      { label: "Material", value: "Reinforced Nylon" }
    ],
    trending: true,
    badge: "Essential Loadout",
    shippingZone: "GLOBAL"
  },
  "luminous-cyber-visor": {
    id: "luminous-cyber-visor",
    name: "Neon Flux Cyber Visor",
    tagline: "Augmented reality aesthetics.",
    description: "Acrylic visor equipped with programmable embedded LEDs. Cycles through cyberpunk color palettes (cyan, magenta, acid green). The ultimate low-light statement piece.",
    price: 2499,
    currency: "eur",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["Programmable LEDs", "Rimless Wrap-Around", "Low-Light Visibility"],
    stripePriceId: "price_cyber_visor",
    features: [
      { label: "Lighting", value: "RGB Matrix" },
      { label: "Fit", value: "Ergonomic Wrap" }
    ],
    shippingZone: "GLOBAL"
  },
  "opium-cross-chain": {
    id: "opium-cross-chain",
    name: "Gothic Cross Silver Chain",
    tagline: "Heavy hardware for avant-garde fits.",
    description: "A heavy, sculptural cross necklace constructed from high-quality 316L stainless steel. Tarnish-free, waterproof, and sweat-proof. The quintessential Opium aesthetic accessory.",
    price: 3499,
    currency: "eur",
    category: "Jewelry",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["316L Stainless Steel", "Tarnish-Free & Waterproof", "Aggressive Sculptural Design"],
    stripePriceId: "price_opium_chain",
    features: [
      { label: "Material", value: "316L Steel" },
      { label: "Weight", value: "Heavy Solid" }
    ],
    trending: true,
    badge: "Avant-Garde",
    shippingZone: "GLOBAL"
  },
  "nfc-smart-ring": {
    id: "nfc-smart-ring",
    name: "Bionic NFC Smart Ring",
    tagline: "Wearable mechanical utility.",
    description: "Sleek metallic ring containing a passive NFC chip. Program it via your smartphone to unlock doors, share digital profiles, or trigger automations. No charging required.",
    price: 3999,
    currency: "eur",
    category: "EDC",
    images: [
      "https://images.unsplash.com/photo-1620619717387-a25e2e8b2ed3?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["Passive NFC Chip", "Zero Charging Required", "Cybernetic Enhancement"],
    stripePriceId: "price_nfc_ring",
    features: [
      { label: "Tech", value: "Programmable NFC" },
      { label: "Material", value: "Titanium Alloy" }
    ],
    isHero: true,
    badge: "High-Tech Utility",
    shippingZone: "GLOBAL"
  },
  "tactical-bag-charm": {
    id: "tactical-bag-charm",
    name: "Cybernetic Bag Charm",
    tagline: "Chaotic customization.",
    description: "Heavy metal carabiners and circuit board bag charms. Hyper-personalize your techwear backpack or belt loops with dystopian flair.",
    price: 999,
    currency: "eur",
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1590650153855-89f5bc3e5b32?auto=format&fit=crop&q=80&w=800"
    ],
    benefits: ["Heavy Hardware", "Modular Attachment", "Circuit Board Aesthetics"],
    stripePriceId: "price_bag_charm",
    features: [
      { label: "Style", value: "Dystopian Customization" },
      { label: "Utility", value: "Tactical Clip" }
    ],
    shippingZone: "GLOBAL"
  }
`;

content = content.replace(/};\s*$/, ',' + newProducts + '\n};');
fs.writeFileSync('src/config/products.ts', content, 'utf8');
