# ⚡ Bankai Store (`bankaistore.store`) & Admin Panel CMS

> **Full-Stack Anime Merchandise & Collectibles Storefront + Real-Time Admin Panel**  
> *Faithful, high-performance replica and enterprise enhancement of the Hostinger Horizon application.*

---

## 🌟 The Problem Solved

The original **Hostinger Horizon** website (`https://bankaistore.store`) was generated as a client-side Vite SPA with a simulated admin uploader. However, it suffered from critical limitations:
1. **Mock LocalStorage Persistence**: Products added via the `?admin=true` panel were only saved into the administrator's local browser storage (`bankai_products`). Regular visitors from other devices could never see newly added products!
2. **No Central Database**: Changes made on one device did not sync to the live store or other devices.
3. **No Order Tracking / CRM**: WhatsApp click orders were not logged anywhere, making it difficult to follow up on customer leads.
4. **Hardcoded Credentials**: The password (`Firstproject`) was hardcoded directly in client JavaScript.

### ✅ What We Built
This standalone full-stack application provides:
- **100% Exact & Enhanced Storefront**: Recreated every visual element, animation, color token (`hsl(270 91% 65%)`), Google Font (`DM Sans`), Lucide SVG icon, and Framer Motion micro-interaction.
- **Real Persistent REST API**: Backend built with Node.js & Express, automatically syncing product additions, updates, and deletions across all devices in real time.
- **Enterprise Admin Dashboard (`/admin` or `?admin=true`)**:
  - **Overview & Analytics**: Live catalog value (₹), product count, active categories, and WhatsApp inquiries.
  - **Product Management (CRUD)**: Create, edit, delete, set stock status (In Stock, Low Stock, Out of Stock), toggle trending/exclusive flags.
  - **Batch Import**: Add up to 20 products at once via form or paste raw JSON.
  - **WhatsApp Orders & Leads CRM**: Automatically records every customer who clicks "Order on WhatsApp", logging the product, price, timestamp, and status (New, Contacted, Confirmed, Shipped, Cancelled) with a 1-click WhatsApp chat link.
  - **Store Settings**: Change WhatsApp phone number, announcement bar text, store title, and admin password on the fly.
  - **Backup & Restore**: 1-click JSON backup export and 1-click disaster recovery reset to default 50 anime items.
- **Full 50 Real Products Preloaded**: Complete with original INR pricing, categories, anime series, and CDN-hosted images.
- **Interactive 20-Question Otaku Quiz Challenge & Quotes of the Masters**: 100% extracted and working with score celebrations.

---

## 🚀 Quickstart & Running Locally

### 1. Installation
```bash
cd c:\projects\bankai-store
npm install
```

### 2. Development Mode
To start both the API server (Port 3001) and Vite client (Port 3000) concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Unified Server
```bash
npm run build
npm start
```
The server will boot on `http://localhost:3001` serving both the API and the optimized frontend bundle.

---

## 🔐 Admin Credentials & Access

- **Access URL**: [http://localhost:3000/?admin=true](http://localhost:3000/?admin=true) or click the **"Admin"** shield button in the navigation header.
- **Default Password**: `Firstproject`
- *Tip: You can change the admin password at any time in the Admin Settings tab.*

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all live products |
| `POST` | `/api/products` | Add a new product |
| `POST` | `/api/products/batch` | Batch add up to 20 products |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Delete a product |
| `POST` | `/api/products/reset` | Restore 50 default seed products |
| `GET` | `/api/orders` | Fetch logged WhatsApp order leads |
| `POST` | `/api/orders` | Record a customer WhatsApp inquiry |
| `PUT` | `/api/orders/:id` | Update lead status & notes |
| `DELETE` | `/api/orders/:id` | Delete an order inquiry |
| `GET` | `/api/settings` | Public store configuration |
| `PUT` | `/api/settings` | Update WhatsApp number, announcements, password |
| `POST` | `/api/auth/login` | Authenticate admin |
| `GET` | `/api/stats` | Analytics & catalog metrics |
| `GET` | `/api/quotes` | Anime quotes of the masters |
| `GET` | `/api/quiz` | 20-question trivia gauntlet |

---

## 🌐 Deploying to Hostinger (Custom Domain `bankaistore.store`)

1. **Hostinger Node.js Application / VPS**:
   - Push this repository to GitHub or upload via Git/FTP.
   - Run `npm install` and `npm run build`.
   - Set start command to `node server/index.js`.
   - Set environment variable `PORT=3000` (or as assigned by Hostinger).
   - Point domain `bankaistore.store` to the application.
2. **Alternatively on Vercel / Render / Railway**:
   - Easily deployable with zero configuration.
