import { notFound } from "next/navigation";
import Link from "next/link";
import { products } from "@/config/products";
import ProductVideo from "@/components/ProductVideo";
import BenefitBullets from "@/components/BenefitBullets";
import Accordion from "@/components/Accordion";
import LiveActivity from "@/components/LiveActivity";
import ProductInteraction from "@/components/ProductInteraction";
import TrustPulse from "@/components/TrustPulse";
import { Star, ShieldCheck, Truck, RotateCcw, Share2, Heart, Eye, PackageCheck, Sparkles } from "lucide-react";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = products[id];

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Auvra Utility`,
    description: product.description,
    alternates: {
      canonical: `https://auvra-nine.vercel.app/product/${id}`,
    },
    openGraph: {
      title: `${product.name} | Auvra`,
      description: product.tagline,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products[id];

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(product.price / 100);

  // Subtle delivery info
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryString = deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Auvra"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://auvra-nine.vercel.app/product/${id}`,
      "priceCurrency": "EUR",
      "price": product.price / 100,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <LiveActivity productName={product.name} />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-20 xl:gap-32">
          
          {/* Gallery Section - More whitespace, very clean */}
          <section className="lg:w-[55%] space-y-6">
            <div className="sticky top-32 space-y-6">
               <div className="rounded-[3.5rem] overflow-hidden bg-zinc-50 border border-zinc-100 relative group transition-all duration-1000">
                  <ProductVideo src={product.videoUrl} poster={product.images[0]} />
                  <div className="absolute top-8 left-8 flex flex-col gap-3">
                     {product.isLimited && (
                        <div className="bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
                           <Sparkles size={10} className="text-yellow-400" />
                           {product.badge || "Limited Edition"}
                        </div>
                     )}
                     <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Available for Immediate Dispatch
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  {product.images.map((img: string, i: number) => (
                    <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 transition-all duration-700 hover:shadow-lg">
                      <img 
                        src={img} 
                        alt={`${product.name} ${i}`} 
                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" 
                      />
                    </div>
                  ))}
               </div>
            </div>
          </section>

          {/* Product Details - Effortless Hierarchy */}
          <section className="lg:w-[45%]">
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-zinc-900 text-zinc-900" />
                        ))}
                     </div>
                     <span className="text-[10px] font-black text-zinc-400 ml-2 tracking-widest uppercase">Verified Quality</span>
                   </div>
                   <button className="text-zinc-200 hover:text-zinc-900 transition-colors">
                      <Heart size={20} strokeWidth={1.5} />
                   </button>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] text-zinc-900">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-6">
                   <p className="text-4xl font-black text-zinc-900">
                     {formattedPrice}
                   </p>
                   {product.isLimited && (
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
                         Inventory Low
                      </span>
                   )}
                </div>

                <p className="text-zinc-500 text-xl leading-relaxed font-medium max-w-md">
                  {product.tagline}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest py-4 border-y border-zinc-50">
                   <Truck size={14} strokeWidth={2} />
                   <span>Estimated Delivery: <span className="text-zinc-900">{deliveryString}</span></span>
                </div>
              </div>

              <div className="space-y-8">
                <ProductInteraction 
                  productId={product.id} 
                  basePrice={product.price} 
                  formattedPrice={formattedPrice} 
                />
                <TrustPulse />
              </div>

              <div className="pt-8 border-t border-zinc-50">
                <Accordion title="Design Philosophy" defaultOpen={true}>
                  <p className="mb-6 leading-relaxed">{product.description}</p>
                  <BenefitBullets benefits={product.benefits} />
                </Accordion>
                
                <Accordion title="Technical Specifications">
                   <dl className="space-y-4">
                     {product.features.map((f: { label: string; value: string }, i: number) => (
                       <div key={i} className="flex justify-between items-center text-[13px] py-1 border-b border-zinc-50 last:border-0">
                         <dt className="text-zinc-400 font-medium uppercase tracking-widest">{f.label}</dt>
                         <dd className="font-bold text-zinc-900">{f.value}</dd>
                       </div>
                     ))}
                   </dl>
                </Accordion>

                <Accordion title="Care & Maintenance">
                   <p className="text-sm">Built to endure. Simply wipe with a soft, damp cloth to maintain the original finish. Avoid abrasive cleaners to protect the titanium surface.</p>
                </Accordion>
              </div>

            </div>
          </section>
        </div>
      </main>

      {/* Social Experience - Minimal & Authentic */}
      <section className="bg-zinc-50/50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-xl">
               <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4">The Community</p>
               <h2 className="text-4xl font-black tracking-tighter">Verified Experiences.</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-zinc-900 text-zinc-900" />)}
               </div>
               <span className="font-bold text-sm tracking-tight">4.9/5 Average Based on 1,200+ Reviews</span>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { name: "Marcus L.", text: "Surpassed my expectations. The weight and finish feel much more premium than others.", city: "New York" },
               { name: "Elena R.", text: "Minimalist design at its best. It simply works without any unnecessary complexity.", city: "London" },
               { name: "Satoshi T.", text: "The curation here is unmatched. Finally, a shop that values quality over volume.", city: "Tokyo" }
             ].map((review, i) => (
               <div key={i} className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-sm relative group hover:shadow-xl transition-all duration-700">
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-zinc-900 text-zinc-900" />)}
                  </div>
                  <p className="text-zinc-600 leading-relaxed mb-12 font-medium text-lg">"{review.text}"</p>
                  <div className="flex items-center gap-4 border-t border-zinc-50 pt-8">
                     <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center font-bold text-zinc-300 text-xs">{review.name[0]}</div>
                     <div>
                       <p className="text-sm font-bold flex items-center gap-2">
                          {review.name}
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                       </p>
                       <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{review.city} — Verified</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}
