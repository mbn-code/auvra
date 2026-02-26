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

### 2. Sourcing Protocol ("Predator" Algorithm)
Autonomous agents monitor global marketplaces to secure grails before they hit the mainstream.
- **`neural_sync.py`:** Synchronizes the internal archive with the latent space vector database.
- **`prune_archive.py`:** A parallel verification bot that checks `source_url` health and auto-marks dead nodes as "Secured" (Sold).
- **Vercel Cron Integration:** Automated hourly mesh inspection to ensure 100% checkout reliability.

### 3. Society Membership (The Inner Circle)
A tiered access system designed for high-retention and data-driven sourcing.
- **Cloud State Persistence:** Members lock their lookbooks to the global neural mesh.
- **Style DNA Briefs:** High-fidelity PDF dossiers sent via Resend featuring purchase paths and silhouette analysis.
- **Neural Decryption:** Automatic bypass of high-value asset blurring and direct source-link reveals for low-margin "steals."

---

## 🎨 Aesthetic Manifesto: Alabaster Noir
The interface is engineered to feel physical, tactile, and editorial.
- **Foundation:** `#fafafa` Alabaster base with a **tactile SVG noise/grain overlay**.
- **Typography:** Massive, italicized Brutalist headers (`text-[9rem]`) that act as a brand manifesto.
- **Infrastructure:** Asymmetrical architectural grids and high-contrast neural motifs.

---

## 🛠️ Technical Architecture & Ops

### API Endpoints
- `GET /api/ai/stylist/vibes`: Search and discover visual seeds (Cached 24h).
- `POST /api/ai/stylist`: Neural matching with strict category and keyword filtering.
- `GET /api/ai/stylist/outfit`: Hydrates stored lookbooks with live product metadata.
- `GET /api/admin/prune`: Vercel Cron endpoint for automated mesh cleaning.

### CLI Commands (Admin)
```bash
# 1. Sync the Archive DNA
source venv/bin/activate && python3 scripts/neural_sync.py

# 2. Promote a Node to Society Status
python3 scripts/promote_user.py user@example.com

# 3. Manual Mesh Pruning
python3 scripts/prune_archive.py
```

---

## 🚀 Working Philosophy
1. **Node Integrity:** Never break the neural sync. All inventory MUST have a `style_embedding`.
2. **Location Priority:** User intent (mouse location) always overrides AI intelligence in the builder.
3. **Boutique Performance:** Images are strictly `unoptimized` to bypass Vercel limits and deliver 1:1 CDN fidelity.

---
© 2026 AUVRA • NEURAL ARCHIVE NETWORK • AUTHENTICATED
