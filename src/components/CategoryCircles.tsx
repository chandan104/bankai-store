import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCirclesProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryCircles: React.FC<CategoryCirclesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const allCategories = ['All Items', ...categories];

  return (
    <section className="py-16 bg-gradient-to-b from-background via-background/95 to-background border-y border-border/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <h2
          className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          Shop by Category
        </h2>
        <p className="text-sm md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
          Explore our curated collections of premium anime merchandise
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/90 border border-purple-500/30 text-white items-center justify-center shadow-lg shadow-purple-950 hover:bg-primary/20 hover:border-primary transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-purple-300" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card/90 border border-purple-500/30 text-white items-center justify-center shadow-lg shadow-purple-950 hover:bg-primary/20 hover:border-primary transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-purple-300" />
        </button>

        {/* Categories Horizontal Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide py-4 px-2 sm:px-6 snap-x snap-mandatory scroll-smooth"
        >
          {allCategories.map((cat, idx) => {
            const actualCategory = cat === 'All Items' ? '' : cat;
            const isSelected = selectedCategory === actualCategory;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex-shrink-0 snap-center"
              >
                <button
                  onClick={() => onSelectCategory(actualCategory)}
                  className="flex flex-col items-center cursor-pointer group bg-transparent border-0 p-0 focus:outline-none"
                >
                  {/* Glowing Circle */}
                  <div
                    className={`relative w-[115px] h-[115px] sm:w-[125px] sm:h-[125px] rounded-full flex items-center justify-center text-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 bg-gradient-to-br from-[#140a24] via-[#0d0618] to-[#06030d] overflow-hidden ${
                      isSelected
                        ? 'border-2 border-primary shadow-[0_0_40px_rgba(168,85,247,0.7)] scale-105 ring-4 ring-primary/20'
                        : 'border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_50px_rgba(168,85,247,0.7)]'
                    }`}
                  >
                    {/* Inner glowing halo on hover */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 via-purple-500/25 to-purple-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none" />

                    {/* Category Label */}
                    <span className="relative z-10 text-[11px] sm:text-xs font-black text-white tracking-widest uppercase px-3 leading-snug drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                      {cat}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
