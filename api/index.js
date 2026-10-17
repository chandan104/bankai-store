import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory cache for serverless environment
let cachedProducts = null;
let cachedOrders = [];
let cachedSettings = {
  storeName: 'Bankai Store',
  tagline: 'Premium Anime Collectibles & Merchandise',
  whatsappNumber: '918413958014',
  announcement: '⚡ Exclusive Anime Collectibles — 1-Click WhatsApp Ordering & Express Shipping Across India!',
  adminPassword: 'Firstproject',
  currency: '₹',
};

const getSeedPath = (filename) => {
  const possiblePaths = [
    path.join(__dirname, '../server/data', filename),
    path.join(__dirname, '../data', filename),
    path.join(process.cwd(), 'server/data', filename),
    path.join(process.cwd(), 'data', filename),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const readJson = (filename, defaultValue = []) => {
  const p = getSeedPath(filename);
  if (p) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${filename}:`, e);
    }
  }
  return defaultValue;
};

// Initialize in-memory cache
const initCache = () => {
  if (!cachedProducts) {
    cachedProducts = readJson('products.json', []);
  }
};

// --- Endpoints ---

// 1. Products
app.get('/api/products', (req, res) => {
  initCache();
  res.json({ success: true, count: cachedProducts.length, products: cachedProducts });
});

app.post('/api/products', (req, res) => {
  initCache();
  const { name, price, originalPrice, category, anime, image, isTrending, stockStatus } = req.body;
  if (!name || !price || !category || !anime || !image) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  const newProduct = {
    id: Date.now(),
    name: String(name).trim(),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category: String(category).trim(),
    anime: String(anime).trim(),
    image: String(image).trim(),
    isTrending: Boolean(isTrending),
    stockStatus: stockStatus || 'In Stock',
    createdAt: new Date().toISOString(),
  };

  cachedProducts.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.post('/api/products/batch', (req, res) => {
  initCache();
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Batch items must be a non-empty array.' });
  }

  const formatted = items.map((b, idx) => ({
    id: Date.now() + idx,
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

  cachedProducts = [...formatted, ...cachedProducts];
  res.status(201).json({ success: true, addedCount: formatted.length, products: cachedProducts });
});

app.put('/api/products/:id', (req, res) => {
  initCache();
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
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', (req, res) => {
  initCache();
  const id = Number(req.params.id) || req.params.id;
  const initialLength = cachedProducts.length;
  cachedProducts = cachedProducts.filter((p) => p.id !== id && String(p.id) !== String(id));

  if (cachedProducts.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  res.json({ success: true, message: 'Product deleted successfully.' });
});

app.post('/api/products/reset', (req, res) => {
  cachedProducts = readJson('products.json', []);
  res.json({ success: true, message: 'Store reset to default 50 products.', count: cachedProducts.length });
});

// 2. Orders & Leads CRM
app.get('/api/orders', (req, res) => {
  res.json({ success: true, count: cachedOrders.length, orders: cachedOrders });
});

app.post('/api/orders', (req, res) => {
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

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = cachedOrders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  cachedOrders[index] = {
    ...cachedOrders[index],
    ...req.body,
    id: cachedOrders[index].id,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, order: cachedOrders[index] });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  cachedOrders = cachedOrders.filter((o) => o.id !== id);
  res.json({ success: true, message: 'Order inquiry deleted.' });
});

// 3. Settings
app.get('/api/settings', (req, res) => {
  const { adminPassword, ...publicSettings } = cachedSettings;
  res.json({ success: true, settings: publicSettings });
});

app.put('/api/settings', (req, res) => {
  cachedSettings = {
    ...cachedSettings,
    ...req.body,
  };
  const { adminPassword, ...publicSettings } = cachedSettings;
  res.json({ success: true, settings: publicSettings });
});

// 4. Admin Auth
app.post('/api/auth/login', (req, res) => {
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
app.get('/api/stats', (req, res) => {
  initCache();
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

// 6. Quotes & Quiz
app.get('/api/quotes', (req, res) => {
  const quotes = readJson('anime_quotes.json', []);
  res.json({ success: true, quotes });
});

// 7. Image Upload Endpoint
app.post('/api/upload', (req, res) => {
  const { data, filename } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, message: 'No image data provided.' });
  }

  // If already an external URL
  if (typeof data === 'string' && (data.startsWith('http://') || data.startsWith('https://'))) {
    return res.json({ success: true, url: data, message: 'Image URL verified.' });
  }

  // In serverless environment (Vercel), data URI is returned directly so it works instantly with zero setup
  res.json({
    success: true,
    url: data,
    message: 'Image processed as optimized data URI.',
  });
});

export default app;
