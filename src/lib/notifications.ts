export async function sendSecureNotification(orderData: { 
  productName: string, 
  vintedUrl: string, 
  profit: number,
  customerName: string,
  customerAddress: string
}) {
  const pushoverToken = process.env.PUSHOVER_TOKEN;
  const pushoverUser = process.env.PUSHOVER_USER_KEY;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  const message = `🚨 NEW SALE: ${orderData.productName}\n💰 Profit: €${Math.round(orderData.profit)}\n👤 Customer: ${orderData.customerName}\n📍 Address: ${orderData.customerAddress}`;

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
          sound: "cashregister"
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
            inline_keyboard: [[
              { text: "📦 Open Source Link", url: orderData.vintedUrl }
            ]]
          }
        }),
      });
    } catch (err) {
      console.error("Telegram Notification Error:", err);
    }
  }

  // Log to console if everything fails
  if (!pushoverToken && !telegramToken) {
    console.log(`🚨 SALE SECURED: ${orderData.productName} (Profit: €${orderData.profit})`);
    console.log(`🔗 Vinted: ${orderData.vintedUrl}`);
  }
}
