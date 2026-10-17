import React, { useState, useMemo } from 'react';
import { Search, PackageOpen, RotateCcw } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  settings: StoreSettings;
  onOrderLogged?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  settings,
  onOrderLogged,
}) => {
  const [selectedAnime, setSelectedAnime] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  const animes = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.anime))).filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.anime.toLowerCase().includes(q)
        );
      });
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Anime filter
    if (selectedAnime) {
      list = list.filter((p) => p.anime === selectedAnime);
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedAnime, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedAnime('');
    setSearchQuery('');
    setSortBy('default');
  };

  const hasActiveFilters = Boolean(selectedCategory || selectedAnime || searchQuery || sortBy !== 'default');

  return (
    <section id="products" className="py-24 bg-background border-t border-border/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching original site */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            {selectedCategory
              ? `${selectedCategory} Collection`
              : searchQuery
              ? 'Search Results'
              : 'Our Complete Collection'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {searchQuery
              ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} matching "${searchQuery}"`
              : selectedCategory
              ? `Explore our premium ${selectedCategory.toLowerCase()} collection`
              : 'Browse through our extensive range of premium anime collectibles and merchandise'}
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-card/60 border border-border/70 rounded-2xl p-4 md:p-5 mb-12 shadow-lg backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              >
                <option value="">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedAnime}
                onChange={(e) => setSelectedAnime(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              >
                <option value="">All Anime Series</option>
                {animes.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-xl transition-all"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid matching original 4-column responsive layout */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-3xl border border-dashed border-border/50">
            <PackageOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try a different search term.`
                : selectedCategory
                ? `No products available in the ${selectedCategory} category yet.`
                : 'No products available.'}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onOrderLogged={onOrderLogged}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
