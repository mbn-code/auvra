import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not defined");
  return new Resend(apiKey);
}

const FROM_PULSE = 'AUVRA Pulse <concierge@auvra.eu>';
const FROM_LOGISTICS = 'AUVRA LOGISTICS <logistics@auvra.eu>';

export async function sendNewsletterWelcomeEmail(to: string) {
  const resend = getResend();

  const subject = `Welcome to the Auvra Pulse Network`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f; background-color: #fff; padding: 40px; border: 1px solid #eee; border-radius: 24px;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; margin-bottom: 30px;">AUVRA</h1>
      
      <p style="font-size: 20px; font-weight: 900; tracking: tight;">Access Granted.</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        You have successfully joined the Auvra Pulse network. We curate the world's most high-fidelity archive pieces and deliver them straight to your view.
      </p>

      <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.2em;">Your Welcome Access Code</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: 900; color: #fbbf24; letter-spacing: 0.1em;">PULSE10</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 700; opacity: 0.8;">10% OFF YOUR FIRST CURATION FEE</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        Stay tuned for our hourly archive injections. You will be among the first to see new drops from Chrome Hearts, Arc'teryx, and more.
      </p>

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
      from: FROM_PULSE,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
  }
}

export async function sendSocietyActiveEmail(to: string) {
  const resend = getResend();

  const subject = `Society Access: Pulse Node Activated`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f; background-color: #fff; padding: 40px; border: 1px solid #eee; border-radius: 24px;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; margin-bottom: 30px;">AUVRA</h1>
      
      <p style="font-size: 20px; font-weight: 900; tracking: tight;">Pulse Network Access: ACTIVE</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Your node has been successfully integrated into the Auvra Society. You now have full "At-Cost" visibility and priority link access rights.
      </p>

      <div style="background: #fbbf24; color: #000; padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.8; letter-spacing: 0.2em;">Membership Status</p>
        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: 0.1em;">SOCIETY MEMBER</p>
      </div>

      <div style="margin-top: 30px; border-left: 4px solid #fbbf24; padding-left: 20px;">
        <p style="font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Your Active Benefits:</p>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; font-weight: 500; color: #333;">
          <li style="margin-bottom: 8px;">✓ Direct "At-Cost" Source Links (Zero Markup)</li>
          <li style="margin-bottom: 8px;">✓ 1-Hour Early Access to Daily Drops</li>
          <li style="margin-bottom: 8px;">✓ Priority Logistics Queue</li>
          <li style="margin-bottom: 8px;">✓ 24/7 Neural Sourcing Assistance</li>
        </ul>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <a href="https://auvra.eu/vault" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Enter The Vault</a>
      </div>

      <p style="margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
        &copy; ${new Date().getFullYear()} AUVRA. Designed for the Modern Individual.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_PULSE,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending society active email:', error);
  }
}

export async function sendOrderEmail(to: string, orderDetails: {
  productName: string,
  price: string,
  type: 'archive' | 'static',
  stripeSessionId?: string,
  sourceUrls?: string[],
}) {
  const resend = getResend();

  const isDigital = orderDetails.type === 'archive';
  const subject = isDigital ? `Source Link Unlocked: ${orderDetails.productName}` : `Transfer Initiated: ${orderDetails.productName}`;
  
  const digitalLinksHtml = orderDetails.sourceUrls && orderDetails.sourceUrls.length > 0
    ? `
      <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.2em;">Your Source Link${orderDetails.sourceUrls.length > 1 ? 's' : ''}</p>
        ${orderDetails.sourceUrls.map(url => `
          <a href="${url}" style="display: inline-block; background: #fff; color: #000; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 20px;">Access Source Link</a>
        `).join('')}
      </div>
    `
    : '';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f; background-color: #fff; padding: 40px; border: 1px solid #eee; border-radius: 24px;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 20px;">AUVRA</h1>
      <p style="font-size: 18px; font-weight: 500;">${isDigital ? 'Source Link Unlocked.' : 'Core Hardware Order Initiated.'}</p>
      <p>${isDigital 
        ? 'Thank you for your curation fee. Your exclusive digital source link is now available.' 
        : 'Thank you for choosing Auvra to secure your selection. Your hardware order has been received and is being prepared for dispatch.'}</p>
      
      <div style="background: #fbfbfd; padding: 30px; border-radius: 20px; margin: 30px 0;">
        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.2em;">${isDigital ? 'Digital Archive Piece' : 'Archive Piece'}</p>
        <p style="margin: 5px 0 20px 0; font-size: 20px; font-weight: 900;">${orderDetails.productName}</p>
        <p style="margin: 0; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.2em;">${isDigital ? 'Curation Fee' : 'Hardware Value'}</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 900;">${orderDetails.price}</p>
      </div>

      ${isDigital ? digitalLinksHtml : `
        <p style="font-size: 14px; line-height: 1.6; color: #555;">
          Every piece undergoes a multi-layer integrity check. You will receive a second notification containing your unique logistics tracking ID once the item is secured and verified at our regional node (24-48 hours).
        </p>
      `}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #aaa;">Digital Certificate of Curation</p>
        <p style="font-size: 11px; font-weight: 700; color: #333; margin-top: 10px;">AUVRA-PULSE-ID: ${orderDetails.stripeSessionId ? orderDetails.stripeSessionId.replace(/^cs_/, '').toUpperCase().substring(0, 16) : 'N/A'}</p>
        <p style="font-size: 9px; color: #ccc; margin-top: 5px;">This document verifies that the item has been scanned, filtered, and secured via the Auvra Neural Network.</p>
      </div>
      <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} AUVRA. High-Fidelity Archive Sourcing.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_PULSE,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}

export async function sendDispatchEmail(to: string, orderDetails: {
  productName: string,
  trackingNumber: string
}) {
  const resend = getResend();

  const subject = `Logistics Update: Item Dispatched [${orderDetails.trackingNumber}]`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f; background-color: #fff; padding: 40px; border: 1px solid #eee; border-radius: 24px;">
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
      from: FROM_LOGISTICS,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending dispatch email:', error);
  }
}

export async function sendFreeLookbookEmail(to: string, products: any[]) {
  const resend = getResend();

  const productsHtml = (products || []).filter(p => p.images && p.images.length > 0).map(p => `
    <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 10px;">
      <img src="${p.images[0]}" style="width: 100px; border-radius: 5px;" />
      <div style="display: inline-block; vertical-align: top; margin-left: 15px;">
        <h3 style="margin: 0;">${p.brand} - ${p.title}</h3>
        <p style="color: #666;">Curation Fee: €${Math.max(Math.floor(p.listing_price * 0.05), 5)}</p>
        <a href="https://auvra.eu/archive/${p.id}" style="color: black; font-weight: bold;">View in Archive</a>
      </div>
    </div>
  `).join('');

  const subject = `Your Free Auvra Archive Lookbook`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1d1d1f; background-color: #fff; padding: 40px; border: 1px solid #eee; border-radius: 24px;">
      <h1 style="letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 20px;">AUVRA</h1>
      <p style="font-size: 18px; font-weight: 500;">Your Archive Lookbook.</p>
      <p>Thank you for using the Auvra Pulse Network. Here are the items from your recent manifestation.</p>
      
      <div style="margin: 30px 0;">
        ${productsHtml || '<p style="color: #666; font-style: italic;">No specific items were locked in this session.</p>'}
      </div>

      <div style="background: #000; color: #fff; padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.2em;">Unlock Full Access</p>
        <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 700;">Join The Society</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 500; opacity: 0.8;">Get unlimited permanent cloud sync, full PDF DNA Brief exports, and at-cost direct sourcing links.</p>
        <a href="https://auvra.eu/pricing" style="display: inline-block; background: #fff; color: #000; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 20px;">Upgrade Node</a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        Stay tuned for our hourly archive injections. You have also been added to the Auvra Pulse network to receive our latest drops.
      </p>

      <div style="background: #fbfbfd; padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 0.2em;">Your Welcome Access Code</p>
        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 900; color: #fbbf24; letter-spacing: 0.1em;">PULSE10</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: 700; opacity: 0.8;">10% OFF YOUR FIRST CURATION FEE</p>
      </div>

      <p style="margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
        &copy; ${new Date().getFullYear()} AUVRA. Designed for the Modern Individual.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_PULSE,
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error('Error sending free lookbook email:', error);
  }
}
