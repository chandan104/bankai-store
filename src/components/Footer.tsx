import React from 'react';
import { MessageSquare, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'Categories', href: '#categories' },
    { name: 'Anime Quotes', href: '#quotes' },
    { name: 'Knowledge Quiz', href: '#quiz' },
  ];

  const supportLinks = [
    { name: 'Shipping Policy', href: '#' },
    { name: 'Return Policy (7 Days)', href: '#' },
    { name: 'Quality Inspection', href: '#' },
    { name: 'WhatsApp Hotline Support', href: `https://wa.me/${settings.whatsappNumber}` },
  ];

  const openWhatsApp = () => {
    window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank');
  };

  return (
    <footer id="about" className="bg-card border-t border-border/60">
      {/* About Bankai Store Narrative */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            About Bankai Store
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            Bankai Store is built for true anime fans who want more than just products — we deliver an experience. From premium katanas and authentic anime figures to 4x4 high-performance RC drift cars and collectibles, every item is hand-selected to match the energy of your favorite anime worlds.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg mt-4">
            Our mission is simple: bring high-quality, visually stunning anime merchandise to fans across India who appreciate style, detail, and authenticity.
          </p>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-border/40">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-accent flex items-center justify-center font-black text-white text-xl shadow-lg shadow-primary/30">
                B
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {settings.storeName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Your premier destination for high-grade anime collectibles, replica katanas, and precision RC cars delivered securely across India.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Genuine Quality Guaranteed</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base text-white mb-6 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-bold text-base text-white mb-6 uppercase tracking-wider text-xs">
              Customer Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="font-bold text-base text-white mb-6 uppercase tracking-wider text-xs">
              Direct Inquiries
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions about an anime figure, scale model, or custom order? Chat with our team directly:
            </p>
            <button
              onClick={openWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp: +{settings.whatsappNumber}</span>
            </button>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>Fast Doorstep Delivery in Padded Safety Boxes</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with precision for true Otaku fans</span>
            <span className="text-primary font-medium">bankaistore.store</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
