import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string) {
  const fromEmail = process.env.MAIL_FROM || 'concierge@auvra.eu';

  const subject = `Access Granted: Welcome to the Pulse Network`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f; background-color: #fff; padding: 40px; border: 1px solid #eee; border-radius: 24px;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; margin-bottom: 30px;">AUVRA</h1>
      
      <p style="font-size: 20px; font-weight: 900; tracking: tight;">Pulse Network Access: ACTIVE</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Your node has been successfully integrated into the Auvra Pulse network. You now have priority visibility on all global archive injections.
      </p>

      <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.2em;">Your Welcome Access Code</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: 900; color: #fbbf24; letter-spacing: 0.1em;">PULSE10</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 700; opacity: 0.8;">10% OFF YOUR FIRST ACQUISITION</p>
      </div>

      <div style="margin-top: 30px; border-left: 4px solid #000; padding-left: 20px;">
        <p style="font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Membership Benefits Status:</p>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; font-weight: 500; color: #333;">
          <li style="margin-bottom: 8px;">✓ 1-Hour Early Access to Daily Drops</li>
          <li style="margin-bottom: 8px;">✓ High-Fidelity Archive Insights</li>
          <li style="margin-bottom: 8px;">✓ Member-Only Concierge Support</li>
        </ul>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <a href="https://auvra.eu/archive" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">View Latest Drops</a>
      </div>

      <p style="margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
        &copy; ${new Date().getFullYear()} AUVRA. Designed for the Modern Individual.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AUVRA <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export async function sendOrderEmail(to: string, orderDetails: {
  productName: string,
  price: string,
  type: 'archive' | 'static'
}) {
  const fromEmail = process.env.MAIL_FROM || 'malthe@mbn-code.dk';

  const subject = `Transfer Initiated: ${orderDetails.productName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 20px;">AUVRA</h1>
      <p style="font-size: 18px; font-weight: 500;">Archive Acquisition Initiated.</p>
      <p>Thank you for choosing Auvra to secure your selection. Our global concierge has been notified and is currently initiating the acquisition and authentication of your piece from its private collection.</p>
      <div style="background: #fbfbfd; padding: 30px; border-radius: 20px; margin: 30px 0;">
        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.2em;">Archive Piece</p>
        <p style="margin: 5px 0 20px 0; font-size: 20px; font-weight: 900;">${orderDetails.productName}</p>
        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.2em;">Acquisition Value</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 900;">${orderDetails.price}</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        Every piece undergoes a multi-layer integrity check. You will receive a second notification containing your unique logistics tracking ID once the item is secured and verified at our regional node (24-48 hours).
      </p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #aaa;">Digital Certificate of Curation</p>
        <p style="font-size: 11px; font-weight: 700; color: #333; margin-top: 10px;">AUVRA-PULSE-ID: ${Math.random().toString(36).toUpperCase().substring(2, 12)}</p>
        <p style="font-size: 9px; color: #ccc; margin-top: 5px;">This document verifies that the item has been scanned, filtered, and secured via the Auvra Neural Network.</p>
      </div>
      <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} AUVRA. High-Fidelity Archive Sourcing.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AUVRA ARCHIVE <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendDispatchEmail(to: string, orderDetails: {
  productName: string,
  trackingNumber: string
}) {
  const fromEmail = process.env.MAIL_FROM || 'malthe@mbn-code.dk';

  const subject = `Logistics Update: Item Dispatched [${orderDetails.trackingNumber}]`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 20px;">AUVRA</h1>
      <p style="font-size: 18px; font-weight: 500;">Archive Piece Dispatched.</p>
      <p>Your piece has successfully cleared the regional node and is now in transit.</p>
      <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; margin: 30px 0;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.2em;">Logistics Tracking ID</p>
        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 900; font-family: monospace;">${orderDetails.trackingNumber}</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        Please allow 24 hours for the tracking portal to synchronize. Your piece is expected to arrive within our standard EU logistics window.
      </p>
      <p style="margin-top: 40px; font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} AUVRA. Northern Europe Archive Pulse.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `AUVRA LOGISTICS <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
