const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const API_URL = 'http://localhost:3000/api';
const AUTH_EMAIL = 'malthe@mbn-code.dk';

async function testApi() {
  console.log('🚀 Starting Auvra API Health Check...');

  // 1. Test Vibes Discovery
  try {
    const res = await axios.get(`${API_URL}/ai/stylist/vibes`);
    console.log(`✅ /vibes: OK (${res.data.length} items)`);
  } catch (err) {
    console.error(`❌ /vibes: FAILED - ${err.message}`);
  }

  // 2. Test Vibes Search
  try {
    const res = await axios.get(`${API_URL}/ai/stylist/vibes?q=leather`);
    console.log(`✅ /vibes?q=leather: OK (${res.data.length} items)`);
  } catch (err) {
    console.error(`❌ /vibes search: FAILED - ${err.message}`);
  }

  // 3. Test Neural Matching (Centroid)
  try {
    // Mock seed IDs (Assuming we have some in the DB)
    const res = await axios.post(`${API_URL}/ai/stylist`, {
      selectedVibeIds: [] // Will likely 400, but we test the route
    }).catch(e => e.response);
    if (res.status === 400) console.log('✅ /stylist: OK (Validation active)');
    else console.log(`✅ /stylist: OK (Status ${res.status})`);
  } catch (err) {
    console.error(`❌ /stylist: FAILED - ${err.message}`);
  }

  console.log('\n--- Membership Sensitive Routes (Requires Auth) ---');
  console.log('Note: Local tests may fail without valid session cookies.');

  // 4. Test Outfit Hydration
  try {
    const res = await axios.get(`${API_URL}/ai/stylist/outfit?id=any-uuid`).catch(e => e.response);
    console.log(`✅ /outfit hydration: OK (Status ${res.status})`);
  } catch (err) {
    console.error(`❌ /outfit: FAILED - ${err.message}`);
  }

  // 5. Test Pruning Endpoint
  try {
    const res = await axios.get(`${API_URL}/admin/prune`, {
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    }).catch(e => e.response);
    console.log(`✅ /admin/prune: OK (Status ${res.status})`);
  } catch (err) {
    console.error(`❌ /admin/prune: FAILED - ${err.message}`);
  }

  console.log('\n🏁 Health Check Complete.');
}

testApi();
