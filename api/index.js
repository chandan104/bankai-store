import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Bundled seed datasets (Guaranteed to be bundled by Vercel NFT)
const seedProducts = require('../data/products.json');
const seedQuotes = require('../data/anime_quotes.json');
const seedQuiz = require('../data/quiz_questions.json');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Persistent /tmp storage for Vercel serverless environment
const TMP_PRODUCTS_FILE = '/tmp/bankai_products.json';
const TMP_DELETED_FILE = '/tmp/bankai_deleted.json';

function getPersistedDeleted() {
  try {
    if (fs.existsSync(TMP_DELETED_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_DELETED_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}
  return [];
}

function savePersistedDeleted(list) {
  try {
    fs.writeFileSync(TMP_DELETED_FILE, JSON.stringify(list));
  } catch (e) {}
}

function getPersistedProducts() {
  try {
    if (fs.existsSync(TMP_PRODUCTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_PRODUCTS_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  return [...seedProducts];
}

function savePersistedProducts(list) {
  try {
    fs.writeFileSync(TMP_PRODUCTS_FILE, JSON.stringify(list));
  } catch (e) {}
}

let cachedDeleted = getPersistedDeleted();
let cachedProducts = getPersistedProducts().filter((p) => {
  const isDel =
    cachedDeleted.includes(String(p.id)) ||
    cachedDeleted.includes(`${(p.name || '').trim().toLowerCase()}:::${(p.category || '').trim().toLowerCase()}`);
  return !isDel;
});

let cachedOrders = [];
let cachedSettings = {
  storeName: 'Bankai Store',
  tagline: 'Premium Anime Collectibles & Merchandise',
  whatsappNumber: '918413958014',
  announcement: '⚡ Exclusive Anime Collectibles — 1-Click WhatsApp Ordering & Express Shipping Across India!',
  adminPassword: 'Firstproject',
  currency: '₹',
};

const router = express.Router();

// --- Endpoints ---

// 1. Products
router.get('/products', (req, res) => {
  // Always filter out any deleted products
  const active = cachedProducts.filter((p) => {
    const isDel =
      cachedDeleted.includes(String(p.id)) ||
      cachedDeleted.includes(`${(p.name || '').trim().toLowerCase()}:::${(p.category || '').trim().toLowerCase()}`);
    return !isDel;
  });
  res.json({ success: true, count: active.length, products: active });
});

router.get('/products/deleted', (req, res) => {
  res.json({ success: true, deleted: cachedDeleted });
});

router.post('/products', (req, res) => {
  const { id, name, price, originalPrice, category, anime, image, isTrending, stockStatus } = req.body;
  if (!name || !price || !category || !anime || !image) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  const assignedId = id ? (Number(id) || id) : Date.now();
  const trimmedName = String(name).trim();
  const trimmedCategory = String(category).trim();

  // If re-adding an item previously deleted, remove it from deleted list
  cachedDeleted = cachedDeleted.filter(
    (d) => d !== String(assignedId) && d !== `${trimmedName.toLowerCase()}:::${trimmedCategory.toLowerCase()}`
  );
  savePersistedDeleted(cachedDeleted);

  const newProduct = {
    id: assignedId,
    name: trimmedName,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category: trimmedCategory,
    anime: String(anime).trim(),
    image: String(image).trim(),
    isTrending: Boolean(isTrending),
    stockStatus: stockStatus || 'In Stock',
    createdAt: new Date().toISOString(),
  };

  const existingIdx = cachedProducts.findIndex(
    (p) =>
      String(p.id) === String(assignedId) ||
      (p.name &&
        p.category &&
        p.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        p.category.trim().toLowerCase() === trimmedCategory.toLowerCase())
  );

  if (existingIdx !== -1) {
    cachedProducts[existingIdx] = { ...cachedProducts[existingIdx], ...newProduct };
    savePersistedProducts(cachedProducts);
    return res.status(200).json({ success: true, product: cachedProducts[existingIdx] });
  }

  cachedProducts.unshift(newProduct);
  savePersistedProducts(cachedProducts);
  res.status(201).json({ success: true, product: newProduct });
});

router.post('/products/batch', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Batch items must be a non-empty array.' });
  }

  const formatted = items.map((b, idx) => ({
    id: b.id || Date.now() + idx,
    name: String(b.name).trim(),
    price: Number(b.price),
    originalPrice: b.originalPrice ? Number(b.originalPrice) : undefined,
    category: String(b.category).trim(),
    anime: String(b.anime).trim(),
    image: String(b.image || b.imageUrl).trim(),
    isTrending: Boolean(b.isTrending),
    stockStatus: b.stockStatus || 'In Stock',
    createdAt: new Date().toISOString(),
  }));

  for (const item of formatted) {
    cachedDeleted = cachedDeleted.filter(
      (d) => d !== String(item.id) && d !== `${item.name.toLowerCase()}:::${item.category.toLowerCase()}`
    );

    const existingIdx = cachedProducts.findIndex(
      (p) =>
        String(p.id) === String(item.id) ||
        (p.name &&
          p.category &&
          p.name.trim().toLowerCase() === item.name.toLowerCase() &&
          p.category.trim().toLowerCase() === item.category.toLowerCase())
    );
    if (existingIdx !== -1) {
      cachedProducts[existingIdx] = { ...cachedProducts[existingIdx], ...item };
    } else {
      cachedProducts.unshift(item);
    }
  }

  savePersistedDeleted(cachedDeleted);
  savePersistedProducts(cachedProducts);
  res.status(201).json({ success: true, addedCount: formatted.length, products: cachedProducts });
});

router.put('/products/:id', (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  const index = cachedProducts.findIndex((p) => p.id === id || String(p.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const current = cachedProducts[index];
  const updated = {
    ...current,
    ...req.body,
    id: current.id,
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : current.originalPrice,
    updatedAt: new Date().toISOString(),
  };

  cachedProducts[index] = updated;
  savePersistedProducts(cachedProducts);
  res.json({ success: true, product: updated });
});

router.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  const nameQuery = req.query.name ? String(req.query.name).trim().toLowerCase() : '';
  const catQuery = req.query.category ? String(req.query.category).trim().toLowerCase() : '';

  const target = cachedProducts.find((p) => p.id == id || String(p.id) === String(id));
  const targetName = target ? target.name.trim().toLowerCase() : nameQuery;
  const targetCat = target ? target.category.trim().toLowerCase() : catQuery;

  // Add to persistent deleted list
  if (!cachedDeleted.includes(String(id))) {
    cachedDeleted.push(String(id));
  }
  if (targetName && targetCat) {
    const key = `${targetName}:::${targetCat}`;
    if (!cachedDeleted.includes(key)) {
      cachedDeleted.push(key);
    }
  }
  savePersistedDeleted(cachedDeleted);

  cachedProducts = cachedProducts.filter((p) => {
    if (p.id == id || String(p.id) === String(id)) return false;
    if (
      targetName &&
      targetCat &&
      p.name &&
      p.category &&
      p.name.trim().toLowerCase() === targetName &&
      p.category.trim().toLowerCase() === targetCat
    ) {
      return false;
    }
    return true;
  });

  savePersistedProducts(cachedProducts);
  res.json({ success: true, message: 'Product deleted successfully.' });
});

router.post('/products/reset', (req, res) => {
  cachedDeleted = [];
  savePersistedDeleted([]);
  cachedProducts = [...seedProducts];
  savePersistedProducts(cachedProducts);
  res.json({ success: true, message: 'Store reset to default 50 products.', count: cachedProducts.length });
});

// 2. Orders & Leads CRM
router.get('/orders', (req, res) => {
  res.json({ success: true, count: cachedOrders.length, orders: cachedOrders });
});

router.post('/orders', (req, res) => {
  const { productId, productName, productPrice, productImage, customerPhone, customerName } = req.body;
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    productId: productId || null,
    productName: productName || 'Unknown Product',
    productPrice: productPrice || 0,
    productImage: productImage || '',
    customerPhone: customerPhone || '',
    customerName: customerName || 'WhatsApp Shopper',
    status: 'New',
    notes: '',
    createdAt: new Date().toISOString(),
  };

  cachedOrders.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

router.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = cachedOrders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  cachedOrders[index] = { ...cachedOrders[index], ...req.body };
  res.json({ success: true, order: cachedOrders[index] });
});

router.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  cachedOrders = cachedOrders.filter((o) => o.id !== id);
  res.json({ success: true, message: 'Order deleted.' });
});

// 3. Settings
router.get('/settings', (req, res) => {
  res.json({ success: true, settings: cachedSettings });
});

router.put('/settings', (req, res) => {
  cachedSettings = { ...cachedSettings, ...req.body };
  res.json({ success: true, settings: cachedSettings });
});

// 4. Authentication
router.post('/auth/login', (req, res) => {
  const { password } = req.body;
  const validPassword = cachedSettings.adminPassword || 'Firstproject';

  if (password === validPassword) {
    return res.json({
      success: true,
      token: 'bankai_admin_token_' + Date.now(),
      message: 'Admin access granted.',
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect admin password.' });
});

// 5. Stats
router.get('/stats', (req, res) => {
  const categories = [...new Set(cachedProducts.map((p) => p.category))];
  const animes = [...new Set(cachedProducts.map((p) => p.anime))];
  const totalCatalogValue = cachedProducts.reduce((acc, p) => acc + (p.price || 0), 0);
  const trendingCount = cachedProducts.filter((p) => p.isTrending || p.price >= 1500).length;

  res.json({
    success: true,
    stats: {
      totalProducts: cachedProducts.length,
      totalCategories: categories.length,
      totalAnimes: animes.length,
      totalCatalogValue,
      trendingCount,
      totalOrders: cachedOrders.length,
      newOrders: cachedOrders.filter((o) => o.status === 'New').length,
      confirmedOrders: cachedOrders.filter((o) => o.status === 'Confirmed').length,
    },
  });
});

// 6. Content Data (Quotes & Quiz)
router.get('/quotes', (req, res) => {
  res.json({ success: true, quotes: seedQuotes });
});

router.get('/quiz', (req, res) => {
  res.json({ success: true, quiz: seedQuiz });
});

// 7. Image Upload Endpoint
router.post('/upload', (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, message: 'No image data provided.' });
  }

  res.json({
    success: true,
    url: data,
    message: 'Image processed as optimized data URI.',
  });
});

// 8. Image Proxy Endpoint (bypasses any ISP/DNS cache issues for assets)
router.get('/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('No image URL provided');
  }

  try {
    const urlObj = new URL(imageUrl);
    const isAssetsBankai = urlObj.hostname === 'assets.bankaistore.store';

    const options = {
      host: isAssetsBankai ? '195.35.33.201' : urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      servername: urlObj.hostname,
      headers: {
        host: urlObj.hostname,
        'User-Agent': 'BankaiStore/1.0',
      },
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const proxyReq = protocol.request(options, (proxyRes) => {
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.status(502).send('Error loading image');
    });

    proxyReq.end();
  } catch (err) {
    res.status(400).send('Invalid URL');
  }
});

// Support both /api/* and direct /* routing from Vercel rewrites
app.use('/api', router);
app.use('/', router);

export default app;
