import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, StoreSettings as IStoreSettings, StoreStats, QuizQuestion, AnimeQuote } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryCircles } from './components/CategoryCircles';
import { PremiumCarousel } from './components/PremiumCarousel';
import { ProductGrid } from './components/ProductGrid';
import { CategoryShowcase } from './components/CategoryShowcase';
import { QuotesSection } from './components/QuotesSection';
import { QuizModal } from './components/QuizModal';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { AdminLoginModal } from './admin/AdminLoginModal';
import { AdminLayout } from './admin/AdminLayout';
import { Trophy, Sparkles } from 'lucide-react';

// Fallback seed data (guarantees the site works instantly anywhere, including Vercel serverless cold starts)
import initialProducts from '../data/products.json';
import initialQuotes from '../data/anime_quotes.json';
import initialQuiz from '../data/quiz_questions.json';

const DEFAULT_SETTINGS: IStoreSettings = {
  storeName: 'Bankai Store',
  tagline: 'Premium Anime Collectibles & Merchandise',
  whatsappNumber: '918413958014',
  announcement: '⚡ Exclusive Anime Collectibles — 1-Click WhatsApp Ordering & Express Shipping Across India!',
  currency: '₹',
};

// Deduplication helper to prevent double-rendered cards
export const deduplicateProducts = (list: Product[]): Product[] => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const seenContentKeys = new Set<string>();
  const unique: Product[] = [];

  for (const item of list) {
    if (!item) continue;
    const idKey = String(item.id || '').trim();
    const nameKey = (item.name || '').trim().toLowerCase();
    const catKey = (item.category || '').trim().toLowerCase();
    const contentKey = nameKey ? `${nameKey}:::${catKey}` : '';

    if (idKey && seenIds.has(idKey)) continue;
    if (contentKey && seenContentKeys.has(contentKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (contentKey) seenContentKeys.add(contentKey);
    unique.push(item);
  }

  return unique;
};

// Persistent deletion tracking helpers
export const getDeletedSet = (): Set<string> => {
  try {
    const raw = localStorage.getItem('bankai_deleted_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map((x) => String(x).trim().toLowerCase()));
    }
  } catch (e) {}
  return new Set();
};

export const isProductDeleted = (p: Product, deletedSet: Set<string>): boolean => {
  if (!p) return true;
  if (deletedSet.has(String(p.id).trim().toLowerCase())) return true;
  const nameKey = (p.name || '').trim().toLowerCase();
  const catKey = (p.category || '').trim().toLowerCase();
  if (nameKey && catKey && deletedSet.has(`${nameKey}:::${catKey}`)) return true;
  return false;
};

export const App: React.FC = () => {
  // Initialize with local cache or fallback seed data, automatically cleaning any deleted products
  const [products, setProducts] = useState<Product[]>(() => {
    const deletedSet = getDeletedSet();
    try {
      const cached = localStorage.getItem('bankai_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deduplicated = deduplicateProducts(parsed).filter((p) => !isProductDeleted(p, deletedSet));
          try {
            localStorage.setItem('bankai_products', JSON.stringify(deduplicated));
          } catch (e) {}
          return deduplicated;
        }
      }
    } catch (e) {}
    return deduplicateProducts(initialProducts as Product[]).filter((p) => !isProductDeleted(p, deletedSet));
  });

  const [settings, setSettings] = useState<IStoreSettings>(() => {
    try {
      const cached = localStorage.getItem('bankai_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<StoreStats | null>(null);
  const [quotes, setQuotes] = useState<AnimeQuote[]>(initialQuotes as AnimeQuote[]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(initialQuiz as QuizQuestion[]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bankai_admin_token') !== null;
  });
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return new URLSearchParams(window.location.search).get('admin') === 'true';
  });

  // Fetch live API data from server with smart persistence merge & strict deduplication & deletion filtering
  const fetchData = async () => {
    try {
      const [resProd, resSet, resStats, resQuotes, resQuiz, resDeleted] = await Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => null),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
        fetch('/api/stats').then((r) => r.json()).catch(() => null),
        fetch('/api/quotes').then((r) => r.json()).catch(() => null),
        fetch('/api/quiz').then((r) => r.json()).catch(() => null),
        fetch('/api/products/deleted').then((r) => r.json()).catch(() => null),
      ]);

      const deletedSet = getDeletedSet();
      if (resDeleted && Array.isArray(resDeleted.deleted)) {
        resDeleted.deleted.forEach((d: string) => deletedSet.add(String(d).trim().toLowerCase()));
        try {
          localStorage.setItem('bankai_deleted_ids', JSON.stringify(Array.from(deletedSet)));
        } catch (e) {}
      }

      if (resProd && resProd.products && Array.isArray(resProd.products)) {
        setProducts((prev) => {
          const activeDeleted = getDeletedSet();
          const serverProducts = (resProd.products as Product[]).filter((p) => !isProductDeleted(p, activeDeleted));
          const serverMap = new Map(serverProducts.map((p: Product) => [String(p.id), p]));
          const serverContentSet = new Set(
            serverProducts.map((p: Product) => `${(p.name || '').trim().toLowerCase()}:::${(p.category || '').trim().toLowerCase()}`)
          );

          // Retain local items that do not exist on the server by ID or content match, and not deleted
          const localOnly = prev.filter((p) => {
            if (isProductDeleted(p, activeDeleted)) return false;
            const idMatch = serverMap.has(String(p.id));
            const contentKey = `${(p.name || '').trim().toLowerCase()}:::${(p.category || '').trim().toLowerCase()}`;
            const contentMatch = serverContentSet.has(contentKey);
            return !idMatch && !contentMatch;
          });

          const merged = deduplicateProducts([...localOnly, ...serverProducts]).filter((p) => !isProductDeleted(p, activeDeleted));
          try {
            localStorage.setItem('bankai_products', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }

      if (resSet && resSet.settings) {
        setSettings(resSet.settings);
        try {
          localStorage.setItem('bankai_settings', JSON.stringify(resSet.settings));
        } catch (e) {}
      }

      if (resStats && resStats.stats) {
        setStats(resStats.stats);
      }
      if (resQuotes && resQuotes.quotes) {
        setQuotes(resQuotes.quotes);
      }
      if (resQuiz && resQuiz.quiz) {
        setQuizQuestions(resQuiz.quiz);
      }
    } catch (err) {
      console.warn('API sync: using cached/seed data', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if ?admin=true is in URL
    if (new URLSearchParams(window.location.search).get('admin') === 'true') {
      if (!sessionStorage.getItem('bankai_admin_token')) {
        setIsLoginModalOpen(true);
      } else {
        setIsAdminView(true);
      }
    }
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  // Direct state updaters for 0ms lag persistence & strict duplicate/deletion prevention
  const handleAddProduct = (newProd: Product) => {
    // Unmark from deleted set if re-adding
    try {
      const raw = localStorage.getItem('bankai_deleted_ids');
      if (raw) {
        const deletedArr: string[] = JSON.parse(raw);
        const targetContentKey = `${(newProd.name || '').trim().toLowerCase()}:::${(newProd.category || '').trim().toLowerCase()}`;
        const targetIdStr = String(newProd.id).trim().toLowerCase();
        const cleaned = deletedArr.filter(
          (d) => String(d).trim().toLowerCase() !== targetIdStr && String(d).trim().toLowerCase() !== targetContentKey
        );
        localStorage.setItem('bankai_deleted_ids', JSON.stringify(cleaned));
      }
    } catch (e) {}

    setProducts((prev) => {
      const targetContentKey = `${(newProd.name || '').trim().toLowerCase()}:::${(newProd.category || '').trim().toLowerCase()}`;
      const filtered = prev.filter((p) => {
        if (String(p.id) === String(newProd.id)) return false;
        const currentKey = `${(p.name || '').trim().toLowerCase()}:::${(p.category || '').trim().toLowerCase()}`;
        return currentKey !== targetContentKey;
      });

      const updated = deduplicateProducts([newProd, ...filtered]);
      try {
        localStorage.setItem('bankai_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) => {
      const updated = deduplicateProducts(
        prev.map((p) => (String(p.id) === String(updatedProd.id) ? updatedProd : p))
      );
      try {
        localStorage.setItem('bankai_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteProduct = (id: number | string) => {
    setProducts((prev) => {
      const target = prev.find((p) => String(p.id) === String(id));
      const targetName = target ? target.name.trim().toLowerCase() : '';
      const targetCat = target ? target.category.trim().toLowerCase() : '';

      // Persistently record deletion in localStorage bankai_deleted_ids
      try {
        const raw = localStorage.getItem('bankai_deleted_ids');
        const deletedArr: string[] = raw ? JSON.parse(raw) : [];
        const deletedSet = new Set<string>(deletedArr.map((x) => String(x).trim().toLowerCase()));
        deletedSet.add(String(id).trim().toLowerCase());
        if (targetName && targetCat) {
          deletedSet.add(`${targetName}:::${targetCat}`);
        }
        localStorage.setItem('bankai_deleted_ids', JSON.stringify(Array.from(deletedSet)));
      } catch (e) {}

      const updated = prev.filter((p) => {
        if (String(p.id) === String(id)) return false;
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

      try {
        localStorage.setItem('bankai_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleAddBatch = (batchItems: Partial<Product>[]) => {
    setProducts((prev) => {
      const formatted = batchItems.map((b, idx) => ({
        id: b.id || Date.now() + idx,
        name: b.name || 'Anime Collectible',
        price: b.price || 999,
        originalPrice: b.originalPrice,
        category: b.category || 'Anime Figures',
        anime: b.anime || 'Anime',
        image: b.image || '',
        isTrending: Boolean(b.isTrending),
        stockStatus: b.stockStatus || 'In Stock',
        createdAt: new Date().toISOString(),
      })) as Product[];
      const updated = deduplicateProducts([...formatted, ...prev]);
      try {
        localStorage.setItem('bankai_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminView(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (token: string) => {
    sessionStorage.setItem('bankai_admin_token', token);
    setIsAdminAuthenticated(true);
    setIsAdminView(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bankai_admin_token');
    setIsAdminAuthenticated(false);
    setIsAdminView(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  const handleResetStore = async () => {
    if (!confirm('Are you sure you want to restore the store to the default 50 anime collectibles?')) return;
    try {
      localStorage.removeItem('bankai_deleted_ids');
      const res = await fetch('/api/products/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProducts(initialProducts as Product[]);
        localStorage.setItem('bankai_products', JSON.stringify(initialProducts));
        alert('Store reset successfully!');
      }
    } catch (err) {
      // Local fallback reset
      localStorage.removeItem('bankai_deleted_ids');
      setProducts(initialProducts as Product[]);
      localStorage.setItem('bankai_products', JSON.stringify(initialProducts));
      alert('Store reset to default 50 products.');
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in Admin Dashboard view
  if (isAdminView && isAdminAuthenticated) {
    return (
      <AdminLayout
        products={products}
        stats={stats}
        settings={settings}
        onRefreshProducts={fetchData}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddBatch={handleAddBatch}
        onUpdateSettings={(newSet) => {
          setSettings(newSet);
          localStorage.setItem('bankai_settings', JSON.stringify(newSet));
        }}
        onResetStore={handleResetStore}
        onLogout={handleLogout}
        onViewStore={() => setIsAdminView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={scrollToProducts}
        isAdmin={isAdminAuthenticated}
        onOpenAdmin={handleOpenAdmin}
        settings={settings}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero settings={settings} onExplore={scrollToProducts} />

        {/* Shop by Category - Exact Glowing Circular Wheels matching Bankai Store */}
        <CategoryCircles
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToProducts();
          }}
        />

        {/* Exclusive Trending Collectibles Carousel */}
        <PremiumCarousel
          products={products}
          settings={settings}
          onOrderClick={(p) => {
            const text = encodeURIComponent(
              `Hi Bankai Store, I would like to order: ${p.name} (Price: ${settings.currency}${p.price}).`
            );
            window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
          }}
          onViewAllClick={scrollToProducts}
        />

        {/* Main Product Catalog Grid with real-time filters */}
        <ProductGrid
          products={products}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          settings={settings}
          onOrderLogged={fetchData}
        />

        {/* Category Showcase Section */}
        <CategoryShowcase
          products={products}
          settings={settings}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToProducts();
          }}
          onOrderLogged={fetchData}
        />

        {/* Anime Quotes of the Masters Section */}
        <QuotesSection quotes={quotes} />

        {/* Anime Knowledge Quiz Banner */}
        <section id="quiz" className="py-24 bg-card/20 border-t border-border/40 relative overflow-hidden scroll-mt-16">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Otaku Knowledge Gauntlet
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              The Ultimate Anime Knowledge Quiz
            </h2>

            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Think you know your anime? Challenge yourself with our 20-question gauntlet ranging from classic shonen to hardcore trivia. Prove your otaku credentials!
            </p>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base md:text-lg shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
            >
              <Trophy className="w-5 h-5" />
              <span>Start The 20-Question Challenge</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Floating Back To Top Button */}
      <BackToTop />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        questions={quizQuestions}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
