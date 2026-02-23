# A  U  V  R  A  |  High-Fidelity Archive Sourcing

Auvra is a premium, autonomous sourcing concierge and luxury archive. It is engineered to bridge the gap between global private collections and the modern individual using real-time algorithmic curation and high-conversion behavioral psychology.

---

## 🏛️ Business Model: The Sourcing Concierge
Auvra operates on a **Premium Sourcing Model**. Unlike traditional e-commerce, Auvra does not hold physical inventory. It uses a custom-built "Neural Engine" to monitor international marketplaces (Vinted, Grailed) for high-integrity archive pieces.

- **Concierge Role:** Auvra manages the discovery, verification, and acquisition process.
- **Profit Arbitrage:** Prices are dynamically calculated based on source cost, brand demand, and logistics complexity.
- **Society Membership:** A tiered system (€19/mo) that unlocks "At-Cost" links for low-margin items and 10% discounts on high-ticket luxury assets.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 15+ (App Router, Turbopack)
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Payments:** Stripe (Hosted Checkout + Recurring Subscriptions)
- **Image Studio:** Cloudinary AI (Automated background removal & face detection)
- **Emails:** Resend (Transactional order confirmations & dispatch alerts)
- **Alerts:** Pushover & Telegram Bot (Real-time "Tap-to-Secure" sale notifications)
- **Automation:** GitHub Actions (Hourly pulse hunts & inventory pruning)

---

## 🧬 Core Intelligence: The "Predator" Algorithm
The heartbeat of Auvra is the autonomous scraping engine found in `/scripts`.

- **`predator.ts`:** The Vinted specialist. Scans regional EU clusters (DK, DE, PL, SE, FI) to ensure customs-free shipping. It handles multilingual translation and complex price parsing.
- **`grailed.ts`:** The global luxury scout. Taps into the high-ticket US/International market.
- **`pulse-run.ts`:** The master orchestrator. Rotates locales and brands to bypass rate limits and keep the archive fresh.
- **`prune-sold.ts`:** The maintenance bot. Automatically verifies if listings are still live on the source and hides sold items from Auvra.

---

## 🧠 Behavioral Engineering (The "Casino" Model)
Auvra is designed to trigger specific psychological heuristics to maximize conversion:

1. **Regret Aversion (Ghost Inventory):** Displays recently sold items in grayscale. Seeing what was "lost" drives users to buy active items immediately.
2. **Information Gap (Neural Decrypt):** Blurs high-value assets for guests, requiring "Society Access" to decrypt images and prices.
3. **Ritualistic Behavior (Injection Countdown):** A live header timer counting down to the next hourly archive restock.
4. **Social Competition (Node Tracking):** Real-time display of "other nodes" inspecting the same asset.
5. **Authenticity Framing:** Items are given technical "Asset IDs" and "Integrity Reports" to distance them from the "second-hand" stigma.

---

## 📁 Repository Structure
- `src/app`: Next.js App Router (Public site, Admin Terminal, Private Hunt).
- `src/components`: UI primitives and psychological trigger components.
- `src/lib`: Core service clients (Stripe, Supabase, Resend, Notifications).
- `scripts/`: The autonomous algorithm suite.
- `supabase/`: SQL schemas for inventory, orders, and user profiles.

---

## 🎮 Operational Terminals
- **Admin Review (`/admin/review`):** The curation command center. Approve/Reject/Edit items found by the algorithm. Uses optimistic updates for zero-layout-shift curation.
- **Fulfillment Terminal (`/admin/orders`):** Manage sales. Copy customer data, access source links, and dispatch tracking IDs.
- **Personal Hunt (`/personal-hunt`):** Localhost-only tool for buying items at cost for personal use or future store stock.

---

## 🚀 Working Philosophy
When working on Auvra, adhere to these mandates:
1. **Zero Code Churn:** Do not rewrite working modules. Patch or extend.
2. **Least Duplication:** Centralize logic in `lib/` or `scripts/lib/`.
3. **Boutique Aesthetic:** Maintain the high-contrast, minimalist, "Silent Luxury" UI. 
4. **Safety First:** Never leak source marketplace IDs or URLs to the public frontend.

---

## 🏁 Setup for New Agents
1. **DB:** Run `supabase/schema.sql` in the Supabase SQL editor.
2. **Env:** Synchronize the 15+ API keys in `.env.local` (see `.env.example`).
3. **Cloud:** Ensure GitHub Secrets match local environment variables for the `pulse-hunt` workflow.
4. **Hunt:** Start the engine locally with `npx tsx scripts/pulse-run.ts`.

---
© 2026 AUVRA. Designed for the Modern Individual.
