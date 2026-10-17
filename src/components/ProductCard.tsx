import React, { useState } from 'react';
import { MessageSquare, Check, Sparkles } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onOrderLogged?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onOrderLogged,
}) => {
  const [ordering, setOrdering] = useState(false);

  if (!product || !product.id || !product.name || typeof product.price !== 'number') {
    return null;
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : null;

  const handleOrder = async () => {
    setOrdering(true);

    // 1. Log the inquiry to the backend API CRM
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          customerName: 'WhatsApp Visitor',
        }),
      });
      if (onOrderLogged) onOrderLogged();
    } catch (err) {
      console.warn('Could not log order to CRM:', err);
    }

    // 2. Open WhatsApp with formatted product message matching original site
    const message = encodeURIComponent(
      `Hello, I want to order:\n\nProduct: ${product.name}\nPrice: ₹${product.price}\n\nImage: ${product.image}\n\nPlease confirm availability.`
    );

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
    setTimeout(() => setOrdering(false), 1500);
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square bg-muted/10">
        {discount && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {discount}% OFF
          </span>
        )}

        {product.isTrending && (
          <span className="absolute bottom-2.5 left-2.5 z-10 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            Trending
          </span>
        )}

        <div className="absolute top-3 right-3 z-10">
          <span className="bg-primary text-primary-foreground font-semibold text-xs px-2.5 py-1 rounded-md shadow">
            {product.category}
          </span>
        </div>

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {product.anime}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-2xl font-bold text-primary">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {savings && (
            <span className="text-xs font-semibold text-green-400 block mt-0.5">
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-5 pt-0">
        <button
          onClick={handleOrder}
          disabled={ordering}
          className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-primary/20"
        >
          {ordering ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Opening WhatsApp...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>Order Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
