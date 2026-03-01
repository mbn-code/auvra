# A U V R A | Neural Archive Network v5.3

Auvra is a high-fidelity creative workstation and autonomous sourcing concierge. It bridges the gap between global private archives and the modern individual using real-time algorithmic curation, neural latent space mapping, and brutalist aesthetic engineering.

Live at: **https://auvra.eu**

---

## Table of Contents

1. [Strategy](#strategy-the-expressive-commerce-mesh)
2. [Technical Architecture & Stack](#technical-architecture--stack)
3. [Core Systems & Workflows](#core-systems--workflows)
   - [Pulse System (Predator Algorithm)](#1-the-pulse-system-predator-algorithm)
   - [AI Stylist Engine](#2-the-ai-stylist-engine-neural-matching)
   - [Sentinel Node Protocol (Raspberry Pi)](#3-sentinel-node-protocol-raspberry-pi)
   - [Checkout Protocol](#4-checkout-protocol)
   - [Membership & Society Loop](#5-membership--society-loop)
   - [Order Fulfilment & Notifications](#6-order-fulfilment--notifications)
4. [Operational Details & Hacks](#operational-details--hacks)
5. [API Endpoints](#api-endpoints)
6. [Database Schema & Migrations](#database-schema--migrations)
7. [Scripts Reference](#scripts-reference)
8. [Environment Variables](#environment-variables)
9. [Local Development](#local-development)
10. [Canonical Guide for Building New Features](#canonical-guide-for-building-new-features)

---

## Strategy: The Expressive Commerce Mesh

Auvra operates beyond traditional e-commerce. It indexes over 50,000+ fashion artifacts into a mathematical DNA mesh, allowing users to manifest silhouettes rather than simply browse listings.

- **Neural Latent Space:** Every item in our archive (Available & Sold) is vectorized using the `clip-ViT-B-32` model into a 512-dimension embedding, stored and queried via Supabase `pgvector`.
- **Recursive Discovery:** We use our own curated history as "Style Seeds" for future discovery, ensuring the "Auvra Aesthetic" is mathematically consistent across every curation.
- **The Freemium Loop:** Guests use the workstation to explore and create data. Society Members pay for persistence (Cloud Saving, DNA Exports, Priority Sourcing, 10% off all purchases).
- **Boutique Sourcing Model:** Auvra operates as a concierge. We source 1-of-1 archive pieces from global marketplaces (Vinted, Grailed) and broker the sale — the buyer pays us, we secure the item and dispatch it.

---

## Technical Architecture & Stack

### Frontend Application
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 (utility-first, brutalist aesthetic) |
| Drag & Drop | `@dnd-kit` — `pointerWithin` collision detection |
| Notifications | `sonner` (toast system) |
| Analytics | Vercel Analytics + custom `pulse_events` CIS tracking |
| Hosting | Vercel (Hobby Tier, with specific optimizations) |

### Backend & Database
| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL + `pgvector`) |
| Auth | Supabase Auth (email/magic link) |
| Image Storage | Cloudinary (CDN hosting for scraped inventory images) |
| Vector Search | Supabase RPC `match_inventory_to_dna` (cosine similarity) |
| Admin Compute | Raspberry Pi running `scripts/sentinel.py` |

### Payments & Communications
| Service | Role |
|---|---|
| Stripe | Checkout sessions, webhook, membership subscriptions |
| Resend | Transactional emails (order confirmation, Society welcome) |
| Pushover | Push alert to admin phone on each new sale ("Tap-to-Secure") |
| Telegram Bot | Sentinel cycle status reports and manual trigger confirmations |

### Automation & Scraping
| Tool | Role |
|---|---|
| Python 3 + `supabase-py` | `sentinel.py`, `neural_sync.py`, `prune_archive.py` |
| Node.js + `tsx` | `pulse-run.ts`, `grailed.ts`, `generate-daily-content.ts` |
| Playwright Stealth | Browser automation for Vinted/Grailed scraping without detection |
| `upload_registry.db` (SQLite) | Local deduplication tracker to avoid re-uploading scraped items |

---

## Core Systems & Workflows

### 1. The Pulse System ("Predator Algorithm")

Autonomous scrapers monitor global marketplaces to secure grails before they hit the mainstream. Items are pushed to a pending queue and reviewed by the admin before going live.

**Flow:**
1. `scripts/pulse-run.ts` launches Playwright Stealth browser sessions targeting 29+ curated brands on Vinted and Grailed.
2. Each scrape extracts: title, brand, price, images, source URL, condition, size.
3. Item is scored based on estimated profit margin and authenticity signals.
4. Image is re-uploaded to Cloudinary for CDN hosting and obfuscation of the original marketplace source.
5. Item is inserted into `pulse_inventory` with `status: 'pending'`.
6. Admin reviews at `/admin/review`. Green score = safe to auto-approve. Orange = manual review required.
7. Approved items go live in the Archive (`status: 'available'`) and are immediately vectorized on the next neural sync cycle.

**Key Scripts:**
- `scripts/pulse-run.ts` — Main orchestrator. Runs all brand scrapers in sequence.
- `scripts/predator.ts` — Core Vinted scraper logic.
- `scripts/grailed.ts` — Grailed marketplace scraper.
- `scripts/tiktok-hunter.ts` — Discovers trending items via TikTok signal analysis.

**Admin endpoints:**
- `GET /api/admin/prune` — Triggers a prune cycle (via Sentinel command queue).
- `POST /api/admin/dispatch` — Marks an order as dispatched and sends the buyer a shipping confirmation.

---

### 2. The AI Stylist Engine (Neural Matching)

A professional-grade, drag-and-drop workstation for manifest-level outfit building.

**Stylist Page:** `/stylist`

**11-Slot Layering Engine:**

| Slot | Category |
|---|---|
| Base Layer | T-shirts, tanks |
| Mid Layer | Hoodies, knits |
| Outer Shell | Jackets, coats |
| Neck | Scarves, chains |
| Hands | Gloves, rings, bracelets |
| Waist | Belts |
| Legwear | Trousers, shorts |
| + 4 flexible slots | Any category |

**Workflow:**
1. User selects up to 7 visual "Style Seeds" from the `style_latent_space` table (managed via `/api/ai/stylist/vibes`).
2. `POST /api/ai/stylist` calculates the mathematical centroid (average) of all selected seed embeddings.
3. The centroid is passed to the `match_inventory_to_dna` Supabase RPC, which returns the top 20 cosine-similarity matches from available inventory.
4. Results are displayed as a draggable grid. User drags items into the 11-slot canvas.
5. Canvas uses `pointerWithin` collision detection to precisely determine the slot the item lands in.
6. User can save a Lookbook (Society Members only via `POST /api/ai/stylist/save`) and check out the entire look in one Stripe session.

**Comparative Stacking:** Slots support multiple items. Use Chevron Arrows to toggle between different silhouettes in the same slot.

**Key Files:**
- `src/app/stylist/page.tsx` — Main workstation page.
- `src/components/stylist/SkeletonCanvas.tsx` — The 11-slot drag target.
- `src/components/stylist/DraggableItem.tsx` — Draggable inventory card.
- `src/app/api/ai/stylist/route.ts` — Neural matching endpoint.
- `src/app/api/ai/stylist/vibes/route.ts` — Seed discovery (cached 24h).
- `src/app/api/ai/stylist/save/route.ts` — Lookbook persistence.
- `src/app/api/ai/stylist/outfit/route.ts` — Hydrates saved lookbooks with live product metadata.
- `src/app/api/ai/stylist/email/route.ts` — Society-only DNA brief export via Resend.

---

### 3. Sentinel Node Protocol (Raspberry Pi)

Vercel serverless functions have a 10-second execution limit on the Hobby plan, and our scraping involves browser sessions that run for minutes. All heavy compute is offloaded to a local Raspberry Pi.

**Architecture:**
- The Sentinel runs `scripts/sentinel.py` as a persistent `while True` loop.
- Every 60 seconds, it polls the `system_commands` Supabase table for pending commands.
- Every 3600 seconds (1 hour), it runs a full automated cycle.
- On command receipt, it updates the status to `running`, executes the shell command, then sets the final status to `completed` or `failed`.
- All output is streamed to `sentinel.log` and status updates are sent via Telegram.

**Automated Hourly Cycle:**
```
1. git pull                              → Auto-update codebase
2. npm install                           → Sync node dependencies
3. npx tsx scripts/pulse-run.ts          → Marketplace Pulse Hunt
4. python3 scripts/neural_sync.py        → Neural Latent Space Sync
5. python3 scripts/prune_archive.py      → Mesh Integrity Pruning
6. npx tsx scripts/generate-daily-content.ts → Social Asset Generation
```

**Manual Trigger Commands** (dispatched from `/admin` dashboard → `/api/admin/system/trigger`):

| Command | Action |
|---|---|
| `pulse` | Run a marketplace scrape immediately |
| `sync` | Run neural sync for new inventory |
| `sync-force` | Force re-vectorize all inventory |
| `prune` | Check all `source_url` health, mark dead links sold |
| `content` | Generate fresh social media assets |

**Raspberry Pi Setup:**
```bash
# Initial setup
git clone <repo> && cd auvra
npm install
pip3 install -r requirements.txt
npx playwright install chromium && npx playwright install-deps

# Run the Sentinel
python3 scripts/sentinel.py
```

See `README_PULSE.md` for the full Raspberry Pi setup guide including crontab configuration.

---

### 4. Checkout Protocol

The checkout system handles complex basket logic mixing 1-of-1 archive pieces, stable/pre-order items, and digital memberships in a single Stripe session.

**File:** `src/app/api/checkout/route.ts`

**Flow:**
1. `POST /api/checkout` receives an array of `productIds`.
2. Static products (from `src/config/products.ts`) and dynamic `pulse_inventory` items are resolved in parallel.
3. Real-time availability is checked. If any item is `status !== 'available'` (and not a stable pre-order), the endpoint returns a `409 Conflict` with `unavailableIds` — the UI shows the conflict and halts, preventing partial or incorrect carts.
4. Society Member pricing: 10% discount applied automatically if `membership_tier === 'society'`.
5. Shipping zone is calculated based on item metadata. If any item is `EU_ONLY`, the whole session restricts to EU countries.
6. Attribution cookies (`auvra_session_id`, `auvra_creative_id`) are captured and forwarded to Stripe metadata for Phase 2 CIS conversion tracking.
7. Stripe session is created. On `checkout.session.completed`, the webhook at `POST /api/webhook` fires.

**Webhook Actions (`POST /api/webhook`):**
- **Membership purchase:** Upgrades `profiles.membership_tier` to `'society'`, sends Society Welcome email.
- **Archive purchase:** Sets `pulse_inventory.status = 'sold'` (for 1-of-1) or decrements `physical_stock` via `decrement_stock` RPC (for stable items). Creates an `orders` record. Sends order confirmation email to buyer. Sends Pushover "Tap-to-Secure" notification to admin with the Vinted/Grailed source URL for immediate manual securing.
- **CIS Logging:** Inserts a `purchase` event into `pulse_events` with full revenue and creative attribution.

**Shipping Zones:**

| Zone | Allowed Countries |
|---|---|
| `EU_ONLY` | All 27 EU member states |
| `SCANDINAVIA_ONLY` | DK, SE, NO, FI |
| `GLOBAL` | US, CA, GB, AU, DE, FR, DK, SE, PL, FI, JP, KR |

---

### 5. Membership & Society Loop

**Tiers:**

| Tier | Features |
|---|---|
| Guest | Browse, use Stylist (ephemeral), single-item checkout |
| Society | 10% off all purchases, saved Lookbooks, DNA email exports, priority sourcing alerts |

**Membership Purchase:** `/pricing` → `GET /api/checkout/subscribe` → Stripe session with `type: 'membership'`. On completion, the webhook upgrades the profile.

**Profile Auto-Creation:** `supabase/migrations/20260226_auto_profile_trigger.sql` installs a PostgreSQL trigger that creates a `profiles` row automatically on every new `auth.users` insert.

**Admin Promotion (for testing):**
```bash
python3 scripts/promote_user.py user@example.com
```

---

### 6. Order Fulfilment & Notifications

**Admin Terminal:** `/admin` (restricted to admin users via RLS)

**Order Lifecycle:**

| Status | Meaning |
|---|---|
| `pending_secure` | Sale confirmed, admin must manually secure item on Vinted/Grailed |
| `awaiting_manufacturing_allocation` | Pre-order placed, item in production |
| `dispatched` | Item shipped to buyer |
| `refunded` | Stripe refund issued, inventory status reverted |

**Admin Actions:**
- `POST /api/admin/dispatch` — Mark dispatched, triggers shipping email.
- `POST /api/admin/refund` — Issues Stripe refund and reverts `pulse_inventory` status.

---

## Operational Details & Hacks

### Vercel Hobby Tier Constraints & Workarounds

| Constraint | Workaround |
|---|---|
| 10s serverless timeout | All scraping/heavy work runs on the Raspberry Pi Sentinel; Vercel API routes only queue commands |
| Image optimization quota | `unoptimized: true` sitewide in `next.config.ts` — all images served directly from Cloudinary/source |
| Cron execution limits | `vercel.json` sets a single `0 1 * * *` cron for lightweight mesh inspection only; bulk work is on the Pi |

### Critical Implementation Rules
1. **Real-Time Auth:** Always use `supabase.auth.getUser()` on server components (App Router). Never trust the client-side session alone for gating Society features.
2. **Dynamic Rendering:** Key data-sensitive pages (`/`, `/archive/[id]`, `/stylist`) must use `export const dynamic = 'force-dynamic'` to bypass stale ISR caches and ensure checkout availability is accurate.
3. **Node Integrity:** All inventory in `pulse_inventory` must have a valid `style_embedding`. Items without embeddings are invisible to the Stylist engine. Run `neural_sync.py` after every batch import.
4. **Cart Atomicity:** Never allow partial checkouts. The `409 Conflict` response from `/api/checkout` is intentional — the UI must surface the conflict and halt, not silently skip unavailable items.
5. **Image Obfuscation:** All sourced images are re-uploaded to Cloudinary before being stored. Never store or expose original Vinted/Grailed image URLs to the public.

---

## API Endpoints

### Stylist / Neural Matching
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/ai/stylist/vibes` | Public | Search visual seeds. Cached 24h. Supports `?q=` search param. |
| `POST` | `/api/ai/stylist` | Public | Neural matching. Takes `selectedVibeIds[]`, returns top cosine-similarity matches. |
| `GET` | `/api/ai/stylist/outfit` | Public | Hydrates a saved lookbook ID with live product metadata. |
| `POST` | `/api/ai/stylist/save` | Society | Persists a lookbook to `user_outfits`. |
| `POST` | `/api/ai/stylist/email` | Society | Exports the DNA brief as an email via Resend. |

### Commerce
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/checkout` | Public | Creates a Stripe checkout session for one or more products. |
| `GET` | `/api/checkout/subscribe` | Authenticated | Creates a Stripe session for Society Membership purchase. |
| `POST` | `/api/webhook` | Stripe signed | Handles `checkout.session.completed`. Updates inventory, creates orders, sends notifications. |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/prune` | `CRON_SECRET` | Queues a prune command on the Sentinel. Called by Vercel Cron. |
| `POST` | `/api/admin/system/trigger` | Admin | Inserts a manual command into `system_commands` for the Sentinel to pick up. |
| `POST` | `/api/admin/dispatch` | Admin | Marks an order as dispatched, sends shipping notification email. |
| `POST` | `/api/admin/refund` | Admin | Issues a Stripe refund and reverts inventory status. |

---

## Database Schema & Migrations

All schema changes live in `supabase/migrations/`. Run them in Supabase SQL Editor or via the CLI.

### Key Tables

| Table | Purpose |
|---|---|
| `pulse_inventory` | Core inventory. All archive pieces (available, sold, pending). |
| `style_latent_space` | Visual Seeds used for Stylist seeding. Each row has a 512-dim `embedding`. |
| `user_outfits` | Saved lookbooks from the Stylist. JSON slot map + vibe IDs. |
| `profiles` | One row per user. Stores `membership_tier` (`guest` / `society`). |
| `orders` | Every completed Stripe purchase. Includes shipping address, status, source URL. |
| `pulse_events` | CIS event stream (page views, clicks, purchases) with creative/session attribution. |
| `system_commands` | Queue table for Sentinel commands. Status: `pending → running → completed/failed`. |

### Key `pulse_inventory` Columns

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `title` | `text` | Item name |
| `brand` | `text` | Designer/label |
| `listing_price` | `decimal` | Our selling price |
| `member_price` | `decimal` | Optional override for Society pricing |
| `source_url` | `text` | Original marketplace URL (obfuscated from public) |
| `images` | `text[]` | Cloudinary CDN URLs |
| `status` | `text` | `available`, `sold`, `pending`, `archived` |
| `style_embedding` | `vector(512)` | CLIP embedding for neural search |
| `is_stable` | `bool` | True = permanent item with physical stock (not 1-of-1) |
| `pre_order_status` | `bool` | True = item available for pre-order |
| `early_bird_price` | `decimal` | Price during early-bird window |
| `early_bird_limit` | `int` | Units before early-bird closes |
| `units_sold_count` | `int` | Total units sold |
| `physical_stock` | `int` | Current physical stock (stable items only) |
| `shipping_zone` | `text` | `EU_ONLY`, `SCANDINAVIA_ONLY`, `GLOBAL` |
| `shipping_cost` | `decimal` | Item-specific shipping cost (0 = free) |
| `potential_profit` | `decimal` | Estimated margin used in Pulse Hunt scoring |

### Key Migrations Log

| Migration | Description |
|---|---|
| `20260225_auvra_latent_space.sql` | Creates `style_latent_space` table and initial CLIP seed data. |
| `20260225_vector_search.sql` | Enables `pgvector` extension and initial similarity search function. |
| `20260226_archive_builder.sql` | Creates `user_outfits` table for Lookbook persistence. |
| `20260226_robust_matching.sql` | Upgrades `match_inventory_to_dna` RPC with keyword filtering. |
| `20260226_strict_category_matching.sql` | Adds strict category-aware filtering to the matching RPC. |
| `20260226_pagination_rpc.sql` | Adds offset-based pagination support to the matching RPC. |
| `20260226_recursive_discovery.sql` | Seeds `style_latent_space` with Auvra's curated aesthetic history. |
| `20260226_auto_profile_trigger.sql` | PostgreSQL trigger: auto-creates `profiles` row on signup. |
| `20260226_membership_fix.sql` | Fixes RLS policies for membership upgrade flow. |
| `20260227_fix_admin_rls.sql` | Fixes Row Level Security for admin-only tables. |
| `20260227_vault_manifests_echoes.sql` | Adds Vault, Manifests, and Echo content tables. |
| `20260227_creative_intelligence_phase1.sql` | CIS Phase 1: `pulse_events` table and session tracking. |
| `20260227_creative_intelligence_phase2.sql` | CIS Phase 2: Creative attribution, `batch_insert_pulse_events` RPC. |
| `20260228_stable_inventory.sql` | Adds stable/pre-order columns to `pulse_inventory`. |
| `20260228_tiered_pricing.sql` | Adds `early_bird_price`, `early_bird_limit`, `preorder_price` columns. |
| `20260228_relax_stable_constraints.sql` | Relaxes NOT NULL constraints for flexible stable item creation. |
| `20260228_shipping_cost.sql` | Adds `shipping_cost` column to `pulse_inventory`. |
| `20260228_storage_permissions.sql` | Supabase Storage bucket policies for image uploads. |
| `20260228_system_commands.sql` | Creates `system_commands` queue table for Sentinel protocol. |

### Key RPCs

| RPC | Description |
|---|---|
| `match_inventory_to_dna` | Core neural match. Takes a centroid vector, returns top items by cosine similarity. Supports threshold, count, offset, and preferred category. |
| `decrement_stock` | Atomically decrements `physical_stock` for stable items. Prevents race conditions on simultaneous purchases. |
| `batch_insert_pulse_events` | Bulk inserts CIS events. Used by webhook and frontend analytics. |

---

## Scripts Reference

| Script | Runtime | Description |
|---|---|---|
| `scripts/sentinel.py` | Python 3 | Raspberry Pi daemon. Hourly cycle + command queue polling. |
| `scripts/neural_sync.py` | Python 3 | Vectorizes all `pulse_inventory` items without embeddings using CLIP. |
| `scripts/prune_archive.py` | Python 3 | Checks all `source_url` health. Marks dead nodes as sold/archived. |
| `scripts/promote_user.py` | Python 3 | Upgrades a user to `membership_tier: 'society'` by email. |
| `scripts/ingest_latent_space.py` | Python 3 | Ingests new visual seeds into `style_latent_space`. |
| `scripts/vectorize_inventory.py` | Python 3 | Standalone batch vectorizer. |
| `scripts/generate_single_embedding.py` | Python 3 | Generates a CLIP embedding for a single image URL (testing). |
| `scripts/mass_ftp_uploader.py` | Python 3 | Bulk Cloudinary uploader for large archive batches. |
| `scripts/pulse-run.ts` | Node.js (tsx) | Main Pulse Hunt orchestrator. Runs all scrapers. |
| `scripts/predator.ts` | Node.js (tsx) | Core Vinted scraper. |
| `scripts/grailed.ts` | Node.js (tsx) | Grailed marketplace scraper. |
| `scripts/tiktok-hunter.ts` | Node.js (tsx) | TikTok trend signal scraper. |
| `scripts/prune-sold.ts` | Node.js (tsx) | Marks confirmed-sold items via source URL status check. |
| `scripts/generate-daily-content.ts` | Node.js (tsx) | Generates TikTok/social media visual assets from inventory. |
| `scripts/distribute-content.ts` | Node.js (tsx) | Distributes generated content to social channels. |
| `scripts/setup-pi.sh` | Bash | One-shot Raspberry Pi environment setup script. |

### Common Admin CLI Commands

```bash
# Activate Python virtualenv (required for Python scripts)
source venv/bin/activate

# Run a full neural sync (vectorize all new inventory)
python3 scripts/neural_sync.py

# Force re-vectorize ALL inventory (expensive, use rarely)
python3 scripts/neural_sync.py --force

# Check dead source links and mark sold
python3 scripts/prune_archive.py

# Promote a user to Society
python3 scripts/promote_user.py user@example.com

# Run a manual Pulse Hunt (scrape marketplaces now)
npx tsx scripts/pulse-run.ts

# Generate social assets
npx tsx scripts/generate-daily-content.ts
```

---

## Environment Variables

All secrets live in `.env.local`. See `.env.example` for the full template.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin, server-only) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `RESEND_API_KEY` | Yes | Resend transactional email API key |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CRON_SECRET` | Yes | Secret to authenticate Vercel Cron calls to `/api/admin/prune` |
| `PUSHOVER_TOKEN` | Yes | Pushover app token for admin phone alerts |
| `PUSHOVER_USER_KEY` | Yes | Pushover user key |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram bot token for Sentinel status reports |
| `TELEGRAM_CHAT_ID` | Optional | Telegram chat ID for Sentinel status reports |

---

## Local Development

```bash
# Install dependencies
npm install

# Install Python dependencies (for scripts)
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Install Playwright browsers (for scraping scripts)
npx playwright install chromium
npx playwright install-deps

# Start local dev server
npm run dev
```

**Testing Stripe Webhooks Locally:**
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

This gives you a local `whsec_...` secret to use as `STRIPE_WEBHOOK_SECRET` in `.env.local` during dev.

---

## Canonical Guide for Building New Features

Use this as the decision framework before writing any new code.

### 1. Where Does This Compute Live?
- **< 5s execution, no scraping, no browser:** Next.js API route on Vercel.
- **> 5s, scraping, or requires browser:** Write a script in `scripts/`, add the command keyword to `sentinel.py`, and have the Vercel API route insert a row into `system_commands`. The Sentinel handles execution.

### 2. Node Integrity
Every item that enters `pulse_inventory` must receive a `style_embedding`. Build import flows to trigger `neural_sync.py` post-import, or call `generate_single_embedding.py` inline.

### 3. Auth Gating
- Use `supabase.auth.getUser()` on server components (not `getSession()`).
- For Society-only features, check `profile.membership_tier === 'society'` server-side.
- Never trust client-passed user IDs. Always resolve the user from the server-side session.

### 4. Inventory Changes
- **1-of-1 archive items:** After purchase, set `status = 'sold'`. Never delete records — the sold archive is part of the brand story and contributes to recursive Style Seed discovery.
- **Stable items:** Use the `decrement_stock` RPC. Never update stock counts directly from application code to avoid race conditions.

### 5. New Migrations
1. Create the file: `supabase/migrations/YYYYMMDD_feature_name.sql`
2. Apply in Supabase SQL Editor.
3. Document the migration in this README under the **Migrations Log**.

### 6. Checkout Extensions
Any new purchasable product type must:
- Be added to `src/config/products.ts` (static) OR be a `pulse_inventory` row (dynamic).
- Handle both the `is_stable` pre-order flow and the standard 1-of-1 flow.
- Pass the correct `type` in Stripe session metadata so the webhook can route the fulfillment logic correctly.

### 7. Vercel Free Tier
- Never add new `next/image` optimized images without confirming we are still within quota. All images should use the `unoptimized` pipeline via Cloudinary.
- Vercel Cron is limited to one job on the Hobby tier. Do not add more crons — route everything through the Sentinel command queue.

---

© 2026 AUVRA • NEURAL ARCHIVE NETWORK • AUTHENTICATED
