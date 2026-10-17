import React from 'react';
import { motion } from 'framer-motion';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-12 bg-gradient-to-b from-background via-card/20 to-background border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Shop by Category
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
          Explore curated gear across our top anime and automotive categories
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1 snap-x scroll-smooth">
          <button
            onClick={() => onSelectCategory('')}
            className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 border ${
              selectedCategory === ''
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105'
                : 'bg-card/80 text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground'
            }`}
          >
            All Products
          </button>

          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => onSelectCategory(cat)}
                className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105'
                    : 'bg-card/80 text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
