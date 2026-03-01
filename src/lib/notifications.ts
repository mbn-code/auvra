/**
 * Operator alert notifications (Telegram + Pushover).
 *
 * Privacy: Customer name and shipping address are NOT included in these
 * messages. Sending PII over third-party messaging services (Telegram,
 * Pushover) is prohibited without an explicit legal basis and disclosure in
 * the privacy policy. Order details needed for fulfilment are available in
 * the admin dashboard via the Supabase orders table.
 *
 * GDPR Art. 5(1)(c) — data minimisation principle.
 */
export async function sendSecureNotification(orderData: {
  productName: string;
  vintedUrl: string;
  profit: number;
}) {
  const pushoverToken = process.env.PUSHOVER_TOKEN;
  const pushoverUser = process.env.PUSHOVER_USER_KEY;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  // PII (customer name, address) intentionally excluded — see module docstring.
  const message = `🚨 NEW SALE: ${orderData.productName}\n💰 Profit: €${Math.round(orderData.profit)}\n📋 Full order details in admin dashboard.`;

  // 1. Pushover Notification (Native Alarm)
  if (pushoverToken && pushoverUser) {
    try {
      await fetch("https://api.pushover.net/1/messages.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: pushoverToken,
          user: pushoverUser,
          message: message,
          title: "AUVRA: Secure Item Now",
          url: orderData.vintedUrl,
          url_title: "Open Source Listing",
          priority: 1,
          sound: "cashregister",
        }),
      });
    } catch (err) {
      console.error("Pushover Error:", err);
    }
  }

  // 2. Telegram Notification (Instant Message)
  if (telegramToken && telegramChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          reply_markup: {
            inline_keyboard: [
              [{ text: "📦 Open Source Link", url: orderData.vintedUrl }],
            ],
          },
        }),
      });
    } catch (err) {
      console.error("Telegram Notification Error:", err);
    }
  }

  // Log to console if no notification channels are configured
  if (!pushoverToken && !telegramToken) {
    console.log(`🚨 SALE SECURED: ${orderData.productName} (Profit: €${orderData.profit})`);
    console.log(`🔗 Vinted: ${orderData.vintedUrl}`);
  }
}
