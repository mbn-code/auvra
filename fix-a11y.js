const fs = require('fs');
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(/<Link href=\{user \? "\/account" : "\/login"\} className="p-2 text-zinc-900 hover:opacity-50 active:scale-95 transition-all">/g, '<Link href={user ? "/account" : "/login"} aria-label="User Account" className="p-2 text-zinc-900 hover:opacity-50 active:scale-95 transition-all">');
header = header.replace(/<button className="relative p-2 text-zinc-900 active:scale-90 transition-transform">/g, '<button aria-label="Shopping Cart" className="relative p-2 text-zinc-900 active:scale-90 transition-transform">');
fs.writeFileSync('src/components/Header.tsx', header);

let footer = fs.readFileSync('src/components/Footer.tsx', 'utf8');
footer = footer.replace(/text-zinc-400/g, 'text-zinc-500'); // improve contrast
footer = footer.replace(/<Link href="https:\/\/www\.instagram\.com\/auvra\.eu\/" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/g, '<Link href="https://www.instagram.com/auvra.eu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-4 bg-white');
footer = footer.replace(/<Link href="https:\/\/www\.tiktok\.com\/@\.auvra" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/g, '<Link href="https://www.tiktok.com/@.auvra" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-4 bg-white');
footer = footer.replace(/<button aria-label="Subscribe" className="absolute right-0 bottom-4 text-\[10px\] font-black uppercase tracking-\[0\.2em\] hover:tracking-\[0\.4em\] transition-all">/g, '<button aria-label="Subscribe" className="absolute right-0 bottom-2 min-h-[44px] px-2 text-[10px] font-black uppercase tracking-[0.2em] hover:tracking-[0.4em] transition-all">');
fs.writeFileSync('src/components/Footer.tsx', footer);
