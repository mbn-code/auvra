const fs = require('fs');
let file = fs.readFileSync('src/components/NeuralInjections.tsx', 'utf8');

// Replace <img> with next/image or fix sizes. Actually plain <img> for thumbnails is fine but lighthouse hates large downloads for small thumbs.
// Vinted images are often unoptimized. We could use next/image with unoptimized=false to let Vercel handle it if it wasn't external. 
// However, next.config.ts might not allow vinted domain or we'd blow up vercel image optimization quota.
// Let's use `loading="lazy"` at least, though they might already be lazy.

// Since it's free tier, we must be careful with Next.js image optimization (1000 images/month limit).
// But for small components, it's better to add `loading="lazy"` and decoding.
file = file.replace(/<img \n                    src=\{item\.images\[0\]\} /g, '<img \n                    src={item.images[0]} loading="lazy" decoding="async" ');
fs.writeFileSync('src/components/NeuralInjections.tsx', file);
