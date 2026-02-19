import { scrapeBrand } from './predator';

async function debug() {
  const brand = "Carhartt";
  const locale = "dk";
  console.log(`Debugging ${brand} on .${locale}`);
  const items = await scrapeBrand(brand, locale);
  console.log("Found items:", items.length);
  if (items.length > 0) {
    console.log("First item sample:", items[0]);
  }
}

debug();
