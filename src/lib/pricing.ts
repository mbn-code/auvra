export function getBrandTier(brand: string): number {
  const b = brand || "";
  if (["Louis Vuitton", "Hermès", "Chanel", "Prada", "Chrome Hearts", "Moncler"].includes(b)) return 1;
  if (["Stone Island", "Burberry", "CP Company", "Ralph Lauren", "Bottega Veneta"].includes(b)) return 2;
  if (["Arc'teryx", "Salomon", "Patagonia", "The North Face", "Oakley"].includes(b)) return 3;
  if (["Supreme", "A Bathing Ape", "Corteiz", "Stüssy", "Hellstar", "Sp5der", "Denim Tears", "Gallery Dept", "Broken Planet"].includes(b)) return 4;
  return 5;
}

export function getEstimatedMarketValue(listingPrice: number, brand: string): number | null {
  const tier = getBrandTier(brand);
  let value = 0;
  
  // Deterministic pseudo-randomness based on price to ensure stability
  const seed = (listingPrice % 100) / 100; 
  
  if (tier === 1) {
     // Ultra Luxury: 10-25% discount
     const discount = 0.10 + (seed * 0.15);
     value = listingPrice / (1 - discount);
  } else if (tier === 2) {
     // Premium Heritage: 15-35% discount
     const discount = 0.15 + (seed * 0.20);
     value = listingPrice / (1 - discount);
  } else if (tier === 3) {
     // Performance: 20-45% discount
     const discount = 0.20 + (seed * 0.25);
     value = listingPrice / (1 - discount);
  } else if (tier === 4) {
     // Streetwear Heat: 5-20% discount (low discount for high demand)
     const discount = 0.05 + (seed * 0.15);
     value = listingPrice / (1 - discount);
  } else {
     // Mass/Contemporary: 25-55% discount
     const discount = 0.25 + (seed * 0.30);
     value = listingPrice / (1 - discount);
  }

  // Formatting values to look like authentic MSRPs
  if (tier === 1) return Math.ceil(value / 50) * 50; // 1200, 1250, 1300
  if (tier === 2) return Math.ceil(value / 10) * 10; // 320, 330, 340
  
  // For mass/streetwear, ends in 9 or 0
  const rounded = Math.ceil(value / 5) * 5;
  return rounded % 10 === 0 ? rounded : rounded - 1; 
}
