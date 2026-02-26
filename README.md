# A U V R A | Neural Archive Network v5.3

Auvra is a high-fidelity creative workstation and autonomous sourcing concierge. It bridges the gap between global private archives and the modern individual using real-time algorithmic curation, neural latent space mapping, and brutalist aesthetic engineering.

---

## 🏛️ Strategy: The Expressive Commerce Mesh
Auvra has transitioned from a search tool into a **Creative Workstation**. By indexing over 50,000+ artifacts into a mathematical DNA mesh, we allow users to manifest silhouettes rather than just browse listings.

- **Neural Latent Space:** Every item in our archive (Available & Sold) is vectorized using the `clip-ViT-B-32` model into a 512-dimension embedding.
- **Recursive Discovery:** We use our own curated history as the "Style Seeds" for future discovery, ensuring the "Auvra Aesthetic" is mathematically consistent.
- **The Freemium Loop:** Guests use the workstation to create data; Society Members pay for persistence (Cloud Saving, DNA Exports, Priority Sourcing).

---

## 🧬 Core Feature Modules

### 1. The Neural Archive Builder (v5.3)
A professional-grade, drag-and-drop workstation for manifest-level outfit building.
- **11-Slot Layering Engine:** Supports complex stacking (Base Layer -> Mid Layer -> Outer Shell) plus specialized slots for Neck, Hands, Waist, and Legwear.
- **Aesthetic Centroid Seeding:** Users select up to 7 visual seeds to define their Style DNA. The engine calculates the mathematical average (Centroid) to find matching pieces.
- **Comparative Stacking:** Slots support multiple items. Use **Chevron Arrows** to toggle between different silhouettes instantly.
- **Location-First D&D:** Implements `pointerWithin` collision detection. Items land exactly where you drop them, with an intelligent auto-categorization fallback.
- **Checkout Look:** Integrated multi-item purchase flow. Verifies real-time availability (Pulse-Check) before creating a unified Stripe session.

### 2. Sourcing Protocol ("Predator" Algorithm)
Autonomous agents monitor global marketplaces to secure grails before they hit the mainstream.
- **`neural_sync.py`:** Synchronizes the internal archive with the latent space vector database.
- **`prune_archive.py`:** A parallel verification bot that checks `source_url` health and auto-marks dead nodes as "Secured" (Sold).
- **Vercel Cron Integration:** Automated hourly mesh inspection (0 1 * * * for Hobby) to ensure 100% checkout reliability.

---

## 🛠️ Technical Architecture & Ops

### Critical Implementation Rules
1. **Real-Time Auth:** Always use `supabase.auth.getUser()` on server components to ensure Society Membership is recognized.
2. **Dynamic Rendering:** Key pages (`/`, `/archive/[id]`, `/stylist`) must use `export const dynamic = 'force-dynamic'` to bypass stale build caches.
3. **Hobby Tier Protection:** Sitewide `unoptimized: true` in `next.config.ts` is mandatory to stay within Vercel's free image transformation limits.

### API Endpoints
- `GET /api/ai/stylist/vibes`: Search and discover visual seeds (Cached 24h, supports `?q=`).
- `POST /api/ai/stylist`: Neural matching with strict category and keyword filtering.
- `GET /api/ai/stylist/outfit`: Hydrates stored lookbooks with live product metadata.
- `GET /api/admin/prune`: Vercel Cron endpoint for automated mesh cleaning (Requires `CRON_SECRET`).
- `POST /api/ai/stylist/email`: Society-only feature to export DNA briefs via Resend.

### CLI Commands (Admin)
```bash
# 1. Sync the Archive DNA (Requires CLIP model)
source venv/bin/activate && python3 scripts/neural_sync.py

# 2. Promote a Node to Society Status (Testing God-Account)
python3 scripts/promote_user.py user@example.com

# 3. Manual Mesh Pruning (Check dead links)
python3 scripts/prune_archive.py
```

### Database & Migrations
Always check `supabase/migrations/` for the latest schema updates. Key migrations include:
- `20260226_archive_builder.sql`: Core `user_outfits` persistence.
- `20260226_robust_matching.sql`: Keyword-aware neural matching RPC.
- `20260226_auto_profile_trigger.sql`: Automated profile creation on signup.


---

## 🚀 Working Philosophy
1. **Node Integrity:** Never break the neural sync. All inventory MUST have a `style_embedding`.
2. **Location Priority:** User intent (mouse location) always overrides AI intelligence in the builder.
3. **Boutique Performance:** Images are strictly `unoptimized` to bypass Vercel limits and deliver 1:1 CDN fidelity.

---
© 2026 AUVRA • NEURAL ARCHIVE NETWORK • AUTHENTICATED
