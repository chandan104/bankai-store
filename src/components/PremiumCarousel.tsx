import React from 'react';
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface PremiumCarouselProps {
  products: Product[];
  settings: StoreSettings;
  onOrderClick: (product: Product) => void;
  onViewAllClick: () => void;
}

export const PremiumCarousel: React.FC<PremiumCarouselProps> = ({
  products,
  settings,
  onOrderClick,
  onViewAllClick,
}) => {
  const premiumItems = products.filter((p) => p.price >= 1399 || p.isTrending);
  if (premiumItems.length === 0) return null;

  // Duplicate for seamless infinite marquee loop
  const marqueeItems = [...premiumItems, ...premiumItems];

  const handleItemClick = (item: Product) => {
    const text = encodeURIComponent(`Hi, I want to order ${item.name} - ₹${item.price.toLocaleString('en-IN')}`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden border-y border-border/50">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wide uppercase">
                Exclusive
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold leading-tight text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              Premium Collection
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Discover our most sought-after, limited edition luxury collectibles crafted for true connoisseurs.
            </p>
          </div>

          <button
            onClick={onViewAllClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/10 hover:text-primary text-sm font-semibold transition-colors"
          >
            <span>View All Premium</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Infinite scrolling marquee container */}
      <div className="relative w-full overflow-hidden pause-on-hover pb-12 pt-4">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-8 animate-infinite-scroll px-8 w-max">
          {marqueeItems.map((item, index) => {
            const discount = item.originalPrice
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              : null;

            return (
              <div
                key={`${item.id}-${index}`}
                className="w-72 md:w-80 flex-shrink-0 bg-card/90 border border-border/80 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-muted/20">
                  {discount && (
                    <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="absolute top-3 right-3 z-10 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {item.category}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback && target.src.startsWith('http')) {
                        target.dataset.fallback = 'true';
                        target.src = `/api/proxy-image?url=${encodeURIComponent(item.image)}`;
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
                      {item.anime}
                    </span>
                    <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-white">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                      {item.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{item.originalPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleItemClick(item)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
