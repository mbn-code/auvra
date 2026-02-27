const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const endpoints = [
  { path: '/api/ai/stylist/vibes', method: 'GET' },
  { path: '/api/ai/stylist/outfit?id=test', method: 'GET' },
  { path: '/api/ai/stylist', method: 'POST', body: { selectedVibeIds: [] } },
  { path: '/api/checkout', method: 'POST', body: { productIds: [] } },
  { path: '/api/newsletter/subscribe', method: 'POST', body: { email: 'test@example.com' } },
];

async function checkHealth() {
  console.log(`Starting Auvra API Health Audit on ${BASE_URL}...\n`);
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.method === 'POST' ? JSON.stringify(endpoint.body) : undefined,
      });
      
      const status = response.status;
      const color = status >= 200 && status < 400 ? '\x1b[32m' : (status === 401 || status === 403 || status === 400 ? '\x1b[33m' : '\x1b[31m');
      console.log(`${endpoint.method} ${endpoint.path} -> ${color}${status}\x1b[0m`);
      
    } catch (error) {
      console.log(`${endpoint.method} ${endpoint.path} -> \x1b[31mFAILED\x1b[0m (${error.message})`);
    }
  }
}

checkHealth();
