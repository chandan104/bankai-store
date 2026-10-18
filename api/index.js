import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Bundled seed datasets (Guaranteed to be bundled by Vercel NFT)
const seedProducts = require('../data/products.json');
const seedQuotes = require('../data/anime_quotes.json');
const seedQuiz = require('../data/quiz_questions.json');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory cache for serverless environment
let cachedProducts = [...seedProducts];
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
  res.json({ success: true, count: cachedProducts.length, products: cachedProducts });
});

router.post('/products', (req, res) => {
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

router.post('/products/batch', (req, res) => {
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
  res.json({ success: true, product: updated });
});

router.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  const initialLength = cachedProducts.length;
  cachedProducts = cachedProducts.filter((p) => p.id !== id && String(p.id) !== String(id));

  if (cachedProducts.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  res.json({ success: true, message: 'Product deleted successfully.' });
});

router.post('/products/reset', (req, res) => {
  cachedProducts = [...seedProducts];
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

  cachedOrders[index] = {
    ...cachedOrders[index],
    ...req.body,
    id: cachedOrders[index].id,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, order: cachedOrders[index] });
});

router.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  cachedOrders = cachedOrders.filter((o) => o.id !== id);
  res.json({ success: true, message: 'Order inquiry deleted.' });
});

// 3. Settings
router.get('/settings', (req, res) => {
  const { adminPassword, ...publicSettings } = cachedSettings;
  res.json({ success: true, settings: publicSettings });
});

router.put('/settings', (req, res) => {
  cachedSettings = {
    ...cachedSettings,
    ...req.body,
  };
  const { adminPassword, ...publicSettings } = cachedSettings;
  res.json({ success: true, settings: publicSettings });
});

// 4. Admin Auth
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

// Support both /api/* and direct /* routing from Vercel rewrites
app.use('/api', router);
app.use('/', router);

export default app;
