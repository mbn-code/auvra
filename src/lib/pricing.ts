export function getBrandTier(brand: string): number {
  const b = brand || "";
  if (["Louis Vuitton", "Hermès", "Chanel", "Prada", "Chrome Hearts", "Moncler"].includes(b)) return 1;
  if (["Stone Island", "Burberry", "CP Company", "Ralph Lauren", "Bottega Veneta"].includes(b)) return 2;
  if (["Arc'teryx", "Salomon", "Patagonia", "The North Face", "Oakley"].includes(b)) return 3;
  if (["Supreme", "A Bathing Ape", "Corteiz", "Stüssy", "Hellstar", "Sp5der", "Denim Tears", "Gallery Dept", "Broken Planet"].includes(b)) return 4;
  return 5;
}

export function detectCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('bag') || t.includes('torebka') || t.includes('backpack') || t.includes('wallet') || t.includes('purse') || t.includes('keepall') || t.includes('sac') || t.includes('tasche') || t.includes('väska')) return 'Bags';
  if (t.includes('jacket') || t.includes('puffer') || t.includes('coat') || t.includes('vest') || t.includes('parka') || t.includes('bomber') || t.includes('windbreaker') || t.includes('kurtka') || t.includes('jakke') || t.includes('jacke')) return 'Jackets / Outerwear';
  if (t.includes('sweater') || t.includes('knit') || t.includes('cardigan') || t.includes('pullover') || t.includes('sweter') || t.includes('trøje') || t.includes('dzianina')) return 'Knitwear / Sweaters';
  if (t.includes('t-shirt') || t.includes('tee') || t.includes('top') || t.includes('shirt') || t.includes('polo') || t.includes('skjorte') || t.includes('koszula') || t.includes('hemd')) return 'Tops / Shirts';
  if (t.includes('pant') || t.includes('jeans') || t.includes('cargo') || t.includes('shorts') || t.includes('bukser') || t.includes('sweatpants') || t.includes('trouser') || t.includes('spodnie') || t.includes('hose') || t.includes('byxor')) return 'Pants';
  if (t.includes('shoe') || t.includes('sneaker') || t.includes('boot') || t.includes('trainer') || t.includes('runner') || t.includes('schuhe') || t.includes('buty') || t.includes('sko') || t.includes('skor')) return 'Footwear';
  if (t.includes('perfume') || t.includes('cologne') || t.includes('makeup') || t.includes('lipstick') || t.includes('fragrance') || t.includes('parfum')) return 'Cosmetics / Beauty';
  if (t.includes('ring') || t.includes('necklace') || t.includes('bracelet') || t.includes('earring') || t.includes('pendant') || t.includes('jewel')) return 'Jewelry';
  if (t.includes('beanie') || t.includes('hat') || t.includes('cap') || t.includes('hue') || t.includes('bucket') || t.includes('mütze') || t.includes('czapka') || t.includes('mössa')) return 'Headwear';
  if (t.includes('belt') || t.includes('glasses') || t.includes('scarf') || t.includes('gloves')) return 'Accessories';
  return 'Accessories'; // Default fallback
}

export function getBrandCategoryFloor(brand: string, category: string): number {
  const b = brand || "";
  const c = category || "";
  
  if (b === "Chanel") {
    if (c === "Bags") return 900;
    if (c === "Jackets / Outerwear") return 700;
    if (c === "Accessories") return 300;
    if (c === "Cosmetics / Beauty") return 80;
  }
  if (b === "Hermès") {
    if (c === "Bags") return 800;
    if (c === "Accessories") return 250;
  }
  if (b === "Louis Vuitton") {
    if (c === "Bags") return 600;
    if (c === "Accessories") return 250;
  }
  if (b === "Prada") {
    if (c === "Bags") return 400;
    if (c === "Jackets / Outerwear") return 450;
    if (c === "Footwear") return 350;
  }
  if (b === "Chrome Hearts" && c === "Jewelry") return 400;
  if (b === "Moncler" && c === "Jackets / Outerwear") return 600;

  const tier = getBrandTier(b);
  if (tier === 2) {
    if (c === "Jackets / Outerwear") return 250;
    if (c === "Knitwear / Sweaters") return 180;
    if (c === "Bags") return 300;
  }
  if (tier === 3) {
    if (c === "Jackets / Outerwear") return 180;
    if (c === "Footwear") return 120;
  }
  if (tier === 4) {
    if (c === "Jackets / Outerwear") return 200;
    if (c === "Footwear") return 150;
  }

  return 0;
}

export function getEstimatedMarketValue(listingPrice: number, brand: string, category: string): number | null {
  // We no longer fabricate synthetic MSRPs based on Final Price.
  // We strictly use the Market Anchor. 
  // For the frontend, we will approximate the Anchor that generated this listingPrice.
  
  const tier = getBrandTier(brand);
  const floor = getBrandCategoryFloor(brand, category);
  
  // Back-calculate the probable anchor
  let expectedDiscount = 0;
  if (tier === 1) expectedDiscount = 0.15;
  else if (tier === 2) expectedDiscount = 0.22;
  else if (tier === 3) expectedDiscount = 0.30;
  else if (tier === 4) expectedDiscount = 0.10;
  else expectedDiscount = 0.35;

  let impliedAnchor = listingPrice / (1 - expectedDiscount);
  
  // If the floor is higher, the floor WAS the anchor.
  if (floor > 0 && floor >= impliedAnchor) {
    impliedAnchor = floor;
  }
  
  // If the implied anchor is very close to the listing price, don't show a discount
  if (impliedAnchor <= listingPrice * 1.05) return null;

  if (tier === 1) return Math.ceil(impliedAnchor / 50) * 50;
  if (tier === 2) return Math.ceil(impliedAnchor / 10) * 10;
  const rounded = Math.ceil(impliedAnchor / 5) * 5;
  return rounded % 10 === 0 ? rounded : rounded - 1; 
}

export function calculateListingPriceEngine(sourcePriceEUR: number, brand: string, condition: string, title: string): number {
  const tier = getBrandTier(brand);
  const category = detectCategory(title);
  
  // 1. Compute Internal Market Anchor
  const brandCategoryFloor = getBrandCategoryFloor(brand, category);
  
  let safetyMultiplier = 1.8;
  if (tier === 1) safetyMultiplier = 2.5;
  else if (tier === 2) safetyMultiplier = 2.2;
  else if (tier === 3) safetyMultiplier = 2.0;
  else if (tier === 4) safetyMultiplier = 2.5;
  
  const costBasedAnchor = sourcePriceEUR * safetyMultiplier;
  
  // Anchor is the maximum of Floor or Cost-based expectation
  let anchor = Math.max(brandCategoryFloor, costBasedAnchor);
  
  // 2. Apply Condition Adjustment to Anchor
  const cond = (condition || "").toLowerCase();
  if (cond.includes('new with tag') || cond.includes('neu mit etikett') || cond.includes('nowy z metką')) {
    anchor = anchor * 1.15;
  } else if (cond.includes('new') || cond.includes('excellent') || cond.includes('very good') || cond.includes('meget god')) {
    anchor = anchor * 1.08;
  }

  // 3. Apply Controlled Discount based on Tier
  let baseDiscount = 0;
  // Seed random deterministically for testing predictability, though Math.random() is fine for live pulse
  const r = Math.random();
  if (tier === 1) baseDiscount = 0.10 + (r * 0.10); // 10-20%
  else if (tier === 2) baseDiscount = 0.15 + (r * 0.15); // 15-30%
  else if (tier === 3) baseDiscount = 0.20 + (r * 0.20); // 20-40%
  else if (tier === 4) baseDiscount = 0.05 + (r * 0.10); // 5-15%
  else baseDiscount = 0.25 + (r * 0.25); // 25-50%

  // 4. Demand Modifier (Simplified heuristic for DB scarcity & heat)
  let demandFactor = 1.0;
  if (tier === 1 || tier === 4) demandFactor -= 0.05; // High demand reduces discount
  if (category === 'Bags' && tier <= 2) demandFactor -= 0.05;
  
  const finalDiscount = Math.max(0, baseDiscount * demandFactor);
  let finalPrice = anchor * (1 - finalDiscount);

  // 5. Margin Safeguard
  let logisticsBuffer = 20;
  if (tier === 1) logisticsBuffer = 50;
  else if (tier === 2) logisticsBuffer = 30;

  const minFloor = sourcePriceEUR + logisticsBuffer + (sourcePriceEUR * 0.25); // 25% minimum margin
  
  finalPrice = Math.max(finalPrice, minFloor);

  // 6. Tier-Specific Rounding
  if (tier === 1) {
    // Round to nearest 50 or 100
    finalPrice = Math.round(finalPrice / 50) * 50;
  } else if (tier === 2 || tier === 3) {
    // Round to nearest 10
    finalPrice = Math.round(finalPrice / 10) * 10;
  } else {
    // End in 9
    finalPrice = Math.round(finalPrice);
    const rem = finalPrice % 10;
    if (rem !== 9) {
      if (rem < 5) finalPrice = finalPrice - rem - 1;
      else finalPrice = finalPrice + (9 - rem);
    }
  }

  // Cosmetics logic safeguard: Do not over-inflate cosmetics simply because they are Tier 1 (Chanel).
  // The BrandCategoryFloor handles this, but we ensure the safetyMultiplier doesn't run wild on a €20 retail lipstick.
  if (category === "Cosmetics / Beauty") {
      finalPrice = Math.min(finalPrice, sourcePriceEUR * 1.5 + 10);
      finalPrice = Math.round(finalPrice);
  }

  return Math.max(finalPrice, sourcePriceEUR + 10); // Ultimate failsafe
}
