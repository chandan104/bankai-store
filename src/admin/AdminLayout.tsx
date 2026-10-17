import React, { useState } from 'react';
import { LayoutDashboard, Package, Layers, MessageSquare, Settings, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { Product, StoreSettings as IStoreSettings, StoreStats } from '../types';
import { AdminOverview } from './AdminOverview';
import { ProductManager } from './ProductManager';
import { BatchProductUploader } from './BatchProductUploader';
import { OrdersManager } from './OrdersManager';
import { StoreSettings } from './StoreSettings';

interface AdminLayoutProps {
  products: Product[];
  stats: StoreStats | null;
  settings: IStoreSettings;
  onRefreshProducts: () => void;
  onUpdateSettings: (newSettings: IStoreSettings) => void;
  onResetStore: () => void;
  onLogout: () => void;
  onViewStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  products,
  stats,
  settings,
  onRefreshProducts,
  onUpdateSettings,
  onResetStore,
  onLogout,
  onViewStore,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'batch' | 'orders' | 'settings'>('overview');

  interface NavItem {
    id: 'overview' | 'products' | 'batch' | 'orders' | 'settings';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'batch', label: 'Batch Uploader', icon: Layers },
    { id: 'orders', label: 'Orders CRM', icon: MessageSquare, badge: stats?.newOrders },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and Admin Badge */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white text-lg shadow-md shadow-primary/30">
                B
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white">Bankai Admin</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                  Live Control
                </span>
              </div>
            </div>

            {/* Quick Actions on right */}
            <div className="flex items-center gap-3">
              <button
                onClick={onViewStore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
              >
                <span>View Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide py-2 border-t border-border/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:text-white hover:bg-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-black/30 text-white' : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <AdminOverview
            stats={stats}
            products={products}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onResetStore={onResetStore}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            products={products}
            settings={settings}
            onRefresh={onRefreshProducts}
          />
        )}

        {activeTab === 'batch' && (
          <BatchProductUploader
            onSuccess={() => {
              onRefreshProducts();
              setActiveTab('products');
            }}
          />
        )}

        {activeTab === 'orders' && <OrdersManager settings={settings} />}

        {activeTab === 'settings' && (
          <StoreSettings
            settings={settings}
            products={products}
            onUpdateSettings={onUpdateSettings}
            onResetStore={onResetStore}
          />
        )}
      </main>
    </div>
  );
};
