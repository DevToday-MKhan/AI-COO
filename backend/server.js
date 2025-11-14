const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Simple in-memory store for installed shops -> access tokens
const SHOP_TOKENS = new Map();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES = 'read_products,write_products',
  HOST = 'http://localhost:3000'
} = process.env;

function buildInstallUrl(shop, state) {
  const redirectUri = `${HOST.replace(/\/$/, '')}/auth/callback`;
  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${encodeURIComponent(
    SCOPES
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
}

// Step 1: Redirect merchant to Shopify permission screen
app.get('/auth', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter');

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('shopify_state', state, { httpOnly: true, sameSite: 'lax' });

  const installUrl = buildInstallUrl(shop, state);
  return res.redirect(installUrl);
});

// Step 2: OAuth callback — Shopify sends back "code"
app.get('/auth/callback', async (req, res) => {
  const { shop, code, state } = req.query;
  const cookieState = req.cookies['shopify_state'];

  if (!shop || !code || !state || cookieState !== state) {
    return res.status(400).send('Invalid auth callback');
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      SHOP_TOKENS.set(shop, tokenData.access_token);
      return res.send('App installed successfully — you can close this window.');
    }

    return res.status(500).json({ error: 'Failed to obtain access token', details: tokenData });
  } catch (err) {
    console.error('auth callback error', err);
    return res.status(500).json({ error: 'Exception while exchanging token' });
  }
});

// Optional: Webhooks
app.post('/webhooks', (req, res) => {
  const hmac = req.get('x-shopify-hmac-sha256');
  const body = JSON.stringify(req.body || {});

  const digest = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET || '')
    .update(body, 'utf8')
    .digest('base64');

  if (hmac !== digest) {
    return res.status(401).send('Unauthorized');
  }

  console.log('Received webhook:', req.body);
  res.status(200).send('OK');
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

module.exports = app;
