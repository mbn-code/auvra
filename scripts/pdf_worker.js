const express = require('express');
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post('/generate-pdf', async (req, res) => {
  const authHeader = req.headers.authorization;
  const workerSecret = process.env.WORKER_SECRET;

  // Immediate termination of unauthorized requests
  if (!authHeader || authHeader !== `Bearer ${workerSecret}`) {
    console.warn("Unauthorized connection attempt blocked.");
    return res.status(401).json({ error: 'Unauthorized Node Execution' });
  }

  const { outfit_id, user_id } = req.body;

  if (!outfit_id || !user_id) {
    return res.status(400).json({ error: 'Missing outfit_id or user_id' });
  }

  let browser;
  try {
    console.log(`Generating PDF for outfit ${outfit_id}`);
    
    // Using localhost Next.js server for rendering the hidden print route
    const targetUrl = `http://localhost:3000/pdf-render?outfit_id=${outfit_id}&secret=${workerSecret}`;
    
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Add auth cookie if needed by the route, or use a service key route
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    const fileName = `brief_${user_id}_${outfit_id}_${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('briefs_vault')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('briefs_vault')
      .getPublicUrl(fileName);

    // Save record to dna_briefs
    await supabase.from('dna_briefs').insert({
      user_id,
      outfit_id,
      pdf_storage_path: fileName
    });

    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PDF_WORKER_PORT || 4000;
app.listen(PORT, () => {
  console.log(`PDF Worker running on port ${PORT}`);
});
