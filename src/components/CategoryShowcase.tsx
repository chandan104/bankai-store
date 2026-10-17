import React from 'react';
import { motion } from 'framer-motion';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';

interface CategoryShowcaseProps {
  products: Product[];
  settings: StoreSettings;
  onSelectCategory: (cat: string) => void;
  onOrderLogged?: () => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  products,
  settings,
  onSelectCategory,
  onOrderLogged,
}) => {
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const productsByCategory = React.useMemo(() => {
    const map: Record<string, Product[]> = {};
    categories.forEach((cat) => {
      map[cat] = products.filter((p) => p.category === cat);
    });
    return map;
  }, [products, categories]);

  if (categories.length === 0 || products.length === 0) return null;

  return (
    <section id="categories" className="py-24 bg-muted/5 border-t border-border/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            Browse by Category
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover our complete range organized by product type
          </p>
        </div>

        <div className="space-y-20">
          {categories.map((cat, idx) => {
            const items = productsByCategory[cat] || [];
            if (items.length === 0) return null;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {cat}
                  </h3>
                  <p className="text-muted-foreground">
                    {items.length} product{items.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {items.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      settings={settings}
                      onOrderLogged={onOrderLogged}
                    />
                  ))}
                </div>

                {items.length > 4 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        onSelectCategory(cat);
                        const el = document.getElementById('products');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors duration-200 cursor-pointer"
                    >
                      View all {cat} →
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
