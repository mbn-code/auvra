const fs = require('fs');
let page = fs.readFileSync('src/app/page.tsx', 'utf8');

// Use Next.js sizes prop for main archive images
// Instead of just mapping over items, let's inject priority to the first few to fix LCP
page = page.replace(
  /archiveItems\.map\(\(item\) => \{/g,
  'archiveItems.map((item, index) => {'
);
page = page.replace(
  /<Image\s+src=\{item\.images\[0\]\}\s+fill\s+unoptimized\s+sizes="\(max-width: 768px\) 100vw, 450px"/g,
  '<Image \n                        src={item.images[0]} \n                        fill\n                        unoptimized\n                        priority={index < 3}\n                        sizes="(max-width: 768px) 100vw, 450px"'
);

// Fix contrast issues on the main page
page = page.replace(/text-zinc-400/g, 'text-zinc-500'); 
page = page.replace(/text-zinc-300/g, 'text-zinc-500');

// Fix heading structures: "Recent Secured." is h1, the product titles inside should ideally be h2 or h3.
// Right now they are h3, let's keep them h3 but ensure there's an h2. "Recent Secured" is h1, so h2 would logically be next.
// There is no h2 before the products, so let's change product titles to h2.
page = page.replace(/<h3 className="text-2xl/g, '<h2 className="text-2xl');
page = page.replace(/<\/h3>/g, '</h2>');

fs.writeFileSync('src/app/page.tsx', page);
