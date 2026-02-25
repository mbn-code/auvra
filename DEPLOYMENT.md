# Auvra Deployment & Post-Launch Setup

Your boutique is live at **https://auvra.eu**. Follow these steps to finalize the operational loop.

## 1. Stripe Webhook (CRITICAL)
For emails and native notifications to work, you must link Stripe to your backend:
1. Go to **Stripe Dashboard > Developers > Webhooks**.
2. Click **Add Endpoint**.
3. URL: `https://auvra.eu/api/webhook`
4. Events to listen for: `checkout.session.completed`.
5. Copy the **Signing Secret** (`whsec_...`).
6. Add it to your Vercel Environment Variables as `STRIPE_WEBHOOK_SECRET`.

## 2. Notification System (Pushover)
To get the "Tap-to-Secure" alerts on your phone:
1. Go to [Pushover.net](https://pushover.net/).
2. Create an "Application" called **Auvra**.
3. Copy the **API Token** and add it to Vercel as `PUSHOVER_TOKEN`.
4. Your **User Key** is already configured.

## 3. Email (Resend)
Your Resend API key is configured.
- Emails will come from: `malthe@mbn-code.dk`.
- Ensure your domain `mbn-code.dk` is verified in the Resend dashboard to avoid spam filters.

## 4. Raspberry Pi "Predator"
1. Clone the repo to your Pi.
2. Run `npm install`.
3. Set up the `.env.local` (Copy the one from your dev machine).
4. Start the hunt: `npx tsx scripts/pulse-run.ts`.

## 5. Compliance & Trust
- **GDPR:** Privacy Policy and Cookie Consent are active.
- **Security:** AES-256 and Norton badges are integrated.
- **Authenticity:** All archive pieces show "Verified Archive" badges based on seller data.

---
**Auvra is officially ready for TikTok traffic.**
