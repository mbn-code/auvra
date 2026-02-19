import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(to: string, orderDetails: {
  productName: string,
  price: string,
  type: 'archive' | 'static'
}) {
  const fromEmail = process.env.MAIL_FROM || 'malthe@mbn-code.dk';

  const subject = `Order Confirmed: ${orderDetails.productName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 20px;">AUVRA</h1>
      <p style="font-size: 18px; font-weight: 500;">Transfer Initiated.</p>
      <p>Thank you for securing your selection from our archive.</p>
      <div style="background: #fbfbfd; padding: 30px; border-radius: 20px; margin: 30px 0;">
        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.2em;">Item</p>
        <p style="margin: 5px 0 20px 0; font-size: 20px; font-weight: 900;">${orderDetails.productName}</p>
        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.2em;">Amount</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 900;">${orderDetails.price}</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        ${orderDetails.type === 'archive' 
          ? "As this is a unique archive piece, our algorithm is currently initiating the logistics transfer from our regional hub. Tracking details will be provided within 24-48 hours."
          : "Your utility is being processed for immediate dispatch. Tracking details will follow shortly."
        }
      </p>
      <p style="margin-top: 40px; font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} AUVRA. Northern Europe Archive Pulse.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AUVRA <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
