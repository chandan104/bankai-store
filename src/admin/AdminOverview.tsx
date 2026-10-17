import React from 'react';
import { Package, Layers, Clapperboard, IndianRupee, MessageSquare, TrendingUp, Plus, Database, Sparkles, RefreshCw } from 'lucide-react';
import { StoreStats, Product } from '../types';

interface AdminOverviewProps {
  stats: StoreStats | null;
  products: Product[];
  onNavigateTab: (tab: string) => void;
  onResetStore: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  products,
  onNavigateTab,
  onResetStore,
}) => {
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Products</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {stats ? stats.totalProducts : products.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Live in store</p>
          </div>
        </div>

        {/* Total Categories */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {stats ? stats.totalCategories : categories.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Active sections</p>
          </div>
        </div>

        {/* Anime Series */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Animes</span>
            <Clapperboard className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {stats ? stats.totalAnimes : 16}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Franchises</p>
          </div>
        </div>

        {/* Total Catalog Value */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Worth</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400">
              ₹{stats ? stats.totalCatalogValue.toLocaleString('en-IN') : '0'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Sum of prices</p>
          </div>
        </div>

        {/* WhatsApp Inquiries */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Inquiries</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {stats ? stats.totalOrders : 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats ? stats.newOrders : 0} new leads
            </p>
          </div>
        </div>

        {/* Trending Items */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Trending</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {stats ? stats.trendingCount : 9}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Premium items</p>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-white mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab('products')}
            className="p-4 rounded-2xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-primary text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                Add New Product
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add collectible with image and price
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('batch')}
            className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 hover:bg-purple-950/30 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-purple-600 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                Batch Import
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload up to 20 products at once
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:bg-emerald-950/30 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Orders & CRM
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track WhatsApp inquiries & leads
              </p>
            </div>
          </button>

          <button
            onClick={onResetStore}
            className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 hover:bg-red-950/30 text-left transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-red-600 text-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-red-300 transition-colors">
                Reset Store
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Restore default 50 anime products
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-white mb-4">Inventory by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <div key={cat} className="p-3.5 rounded-xl bg-background/60 border border-border/60">
                <p className="text-xs font-semibold text-white truncate">{cat}</p>
                <p className="text-xs text-primary font-mono font-bold mt-1">{count} items</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
