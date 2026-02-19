# Auvra TikTok Strategy & Conversion Checklist

## 1. TikTok Content Strategy
- [ ] **The "Hook" (0-3s):** Start with a problem (e.g., "My feet used to kill me...") or a satisfying visual (e.g., squishing the cloud slides).
- [ ] **Show, Don't Tell:** Use natural lighting. Filming on an iPhone is better than professional gear for TikTok authenticity.
- [ ] **UGC Style:** Post videos that look like customer reviews or "unboxing" experiences.
- [ ] **Trending Audio:** Use "Commercial Library" sounds that are currently peaking to boost algorithm reach.
- [ ] **CTA:** Always end with "Link in bio to get 50% off today only."

## 2. Page Conversion Optimization
- [ ] **Speed:** Ensure images are compressed. Current setup uses Unsplash; replace with optimized WebP for production.
- [ ] **Urgency:** The "Flash Sale" indicator is hardcoded to 12. Update this in `products.ts` frequently to maintain realness.
- [ ] **Sticky CTA:** Ensure the "Buy Now" button is always visible on mobile without scrolling.
- [ ] **Social Proof:** Replace placeholder reviews with real screenshots from your TikTok comments.

## 3. Pre-Launch Setup
- [ ] Set up Stripe account and replace `STRIPE_SECRET_KEY` in Vercel.
- [ ] Create a "Shipping Policy" and "Refund Policy" page (standard requirements for Stripe/TikTok).
- [ ] Add your custom domain to Vercel (e.g., shopauvra.com).
