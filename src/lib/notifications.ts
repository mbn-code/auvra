export async function sendSecureNotification(orderData: { 
  productName: string, 
  vintedUrl: string, 
  profit: number,
  customerName: string,
  customerAddress: string
}) {
  const pushoverToken = process.env.PUSHOVER_TOKEN;
  const pushoverUser = process.env.PUSHOVER_USER_KEY;

  if (!pushoverToken || !pushoverUser) {
    console.log("⚠️ Pushover keys missing. Logging sale to console instead.");
    console.log(`🚨 SALE SECURED: ${orderData.productName} (Profit: $${orderData.profit})`);
    console.log(`🔗 Vinted: ${orderData.vintedUrl}`);
    return;
  }

  const message = `🚨 NEW SALE: ${orderData.productName}\n💰 Profit: $${orderData.profit}\n👤 Customer: ${orderData.customerName}\n📍 Address: ${orderData.customerAddress}`;

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
        url_title: "Open Vinted Checkout",
        priority: 1, // High priority
        sound: "cashregister"
      }),
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}
