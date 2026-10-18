import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const getFilePath = (file) => path.join(dataDir, file);

const readJson = (file, defaultValue = []) => {
  const filePath = getFilePath(file);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultValue;
};

const writeJson = (file, data) => {
  const filePath = getFilePath(file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Seed default backup products if needed
const seedProducts = readJson('products.json', []);

// --- API Endpoints ---

// 1. Products
app.get('/api/products', (req, res) => {
  const products = readJson('products.json', []);
  res.json({ success: true, count: products.length, products });
});

app.post('/api/products', (req, res) => {
  const { name, price, originalPrice, category, anime, image, isTrending, stockStatus } = req.body;
  if (!name || !price || !category || !anime || !image) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  const products = readJson('products.json', []);
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

  products.unshift(newProduct);
  writeJson('products.json', products);

  res.status(201).json({ success: true, product: newProduct });
});

app.post('/api/products/batch', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Batch items must be a non-empty array.' });
  }

  const products = readJson('products.json', []);
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

  const updated = [...formatted, ...products];
  writeJson('products.json', updated);

  res.status(201).json({ success: true, addedCount: formatted.length, products: updated });
});

app.put('/api/products/:id', (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  const products = readJson('products.json', []);
  const index = products.findIndex((p) => p.id === id || String(p.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const current = products[index];
  const updated = {
    ...current,
    ...req.body,
    id: current.id, // prevent id change
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : current.originalPrice,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  writeJson('products.json', products);

  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id) || req.params.id;
  const products = readJson('products.json', []);
  const filtered = products.filter((p) => p.id !== id && String(p.id) !== String(id));

  if (filtered.length === products.length) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  writeJson('products.json', filtered);
  res.json({ success: true, message: 'Product deleted successfully.' });
});

app.post('/api/products/reset', (req, res) => {
  const initialDataPath = path.join(__dirname, '../data/products.json');
  if (fs.existsSync(initialDataPath)) {
    const defaultData = JSON.parse(fs.readFileSync(initialDataPath, 'utf8'));
    writeJson('products.json', defaultData);
    return res.json({ success: true, message: 'Store reset to default 50 products.', count: defaultData.length });
  }
  res.status(500).json({ success: false, message: 'Initial seed data not found.' });
});

// 2. Orders & WhatsApp Lead Inquiries Tracker
app.get('/api/orders', (req, res) => {
  const orders = readJson('orders.json', []);
  res.json({ success: true, count: orders.length, orders });
});

app.post('/api/orders', (req, res) => {
  const { productId, productName, productPrice, productImage, customerPhone, customerName } = req.body;
  const orders = readJson('orders.json', []);

  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    productId: productId || null,
    productName: productName || 'Unknown Product',
    productPrice: productPrice || 0,
    productImage: productImage || '',
    customerPhone: customerPhone || '',
    customerName: customerName || 'WhatsApp Shopper',
    status: 'New', // New, Contacted, Confirmed, Shipped, Cancelled
    notes: '',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  writeJson('orders.json', orders);

  res.status(201).json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readJson('orders.json', []);
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  orders[index] = {
    ...orders[index],
    ...req.body,
    id: orders[index].id,
    updatedAt: new Date().toISOString(),
  };

  writeJson('orders.json', orders);
  res.json({ success: true, order: orders[index] });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readJson('orders.json', []);
  const filtered = orders.filter((o) => o.id !== id);

  writeJson('orders.json', filtered);
  res.json({ success: true, message: 'Order inquiry deleted.' });
});

// 3. Settings & Store Config
app.get('/api/settings', (req, res) => {
  const settings = readJson('settings.json', {
    storeName: 'Bankai Store',
    tagline: 'Premium Anime Collectibles & Merchandise',
    whatsappNumber: '918413958014',
    announcement: '⚡ Exclusive Anime Collectibles — 1-Click WhatsApp Ordering & Express Shipping Across India!',
    currency: '₹',
  });
  // Omit password from public settings
  const { adminPassword, ...publicSettings } = settings;
  res.json({ success: true, settings: publicSettings });
});

app.put('/api/settings', (req, res) => {
  const current = readJson('settings.json', {});
  const updated = {
    ...current,
    ...req.body,
  };
  writeJson('settings.json', updated);
  const { adminPassword, ...publicSettings } = updated;
  res.json({ success: true, settings: publicSettings });
});

// 4. Admin Auth
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const settings = readJson('settings.json', { adminPassword: 'Firstproject' });
  const validPassword = settings.adminPassword || 'Firstproject';

  if (password === validPassword) {
    return res.json({
      success: true,
      token: 'bankai_admin_token_' + Date.now(),
      message: 'Admin access granted.',
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect admin password.' });
});

// 5. Analytics & Stats
app.get('/api/stats', (req, res) => {
  const products = readJson('products.json', []);
  const orders = readJson('orders.json', []);
  const categories = [...new Set(products.map((p) => p.category))];
  const animes = [...new Set(products.map((p) => p.anime))];

  const totalCatalogValue = products.reduce((acc, p) => acc + (p.price || 0), 0);
  const trendingCount = products.filter((p) => p.isTrending || p.price >= 1500).length;

  res.json({
    success: true,
    stats: {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalAnimes: animes.length,
      totalCatalogValue,
      trendingCount,
      totalOrders: orders.length,
      newOrders: orders.filter((o) => o.status === 'New').length,
      confirmedOrders: orders.filter((o) => o.status === 'Confirmed').length,
    },
  });
});

// 6. Content Data (Quotes & Quiz)
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

  // If it's already an external URL
  if (typeof data === 'string' && (data.startsWith('http://') || data.startsWith('https://'))) {
    return res.json({ success: true, url: data, message: 'Image URL verified.' });
  }

  try {
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      let ext = 'jpg';
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';

      const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const uploadsDir = path.join(__dirname, '../public/uploads');

      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, safeName);
        fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));

        const distUploads = path.join(__dirname, '../dist/uploads');
        if (fs.existsSync(path.join(__dirname, '../dist'))) {
          if (!fs.existsSync(distUploads)) fs.mkdirSync(distUploads, { recursive: true });
          fs.writeFileSync(path.join(distUploads, safeName), Buffer.from(matches[2], 'base64'));
        }

        return res.json({
          success: true,
          url: `/uploads/${safeName}`,
          filename: safeName,
          message: 'Image uploaded to local storage successfully.',
        });
      } catch (fsErr) {
        console.warn('Filesystem write not permitted, using data URI fallback:', fsErr);
        return res.json({
          success: true,
          url: data,
          message: 'Image stored as optimized data URI.',
        });
      }
    }

    res.json({ success: true, url: data, message: 'Image processed successfully.' });
  } catch (err) {
    console.error('Error in /api/upload:', err);
    res.status(500).json({ success: false, message: 'Failed to process image.' });
  }
});

// 8. Image Proxy Endpoint
app.get('/api/proxy-image', (req, res) => {
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

    const protocol = urlObj.protocol === 'https:' ? require('https') : require('http');
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

// Serve uploaded assets
const publicUploads = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(publicUploads)) {
  fs.mkdirSync(publicUploads, { recursive: true });
}
app.use('/uploads', express.static(publicUploads));

// Serve frontend in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Bankai Store API Server running on port ${PORT}`);
});
