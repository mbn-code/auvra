import { chromium } from 'playwright';

async function listClasses() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const brand = "Carhartt";
  const locale = "dk";
  const searchUrl = `https://www.vinted.${locale}/vetements?search_text=${encodeURIComponent(brand)}&order=newest_first&new_with_tags=1`;
  
  console.log(`Navigating to ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: 'networkidle' });
  
  const content = await page.content();
  console.log("Page title:", await page.title());
  
  const hasGrid = await page.evaluate(() => {
    return document.querySelectorAll('.feed-grid__item').length;
  });
  console.log("feed-grid__item count:", hasGrid);

  const allLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href).slice(0, 10);
  });
  console.log("Sample links:", allLinks);

  await browser.close();
}

listClasses();
