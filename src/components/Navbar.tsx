import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Shield, Menu, X, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  settings: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  isAdmin,
  onOpenAdmin,
  settings,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'Categories', href: '#categories' },
    { name: 'About', href: '#about' },
    { name: 'Quotes', href: '#quotes' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank');
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-purple-950 via-primary/30 to-purple-950 border-b border-primary/20 text-xs text-center py-1.5 px-4 text-purple-200 font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-lg shadow-primary/5 border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavClick('#home')}
                className="flex items-center gap-3 text-left group focus:outline-none"
              >
                <img
                  src="https://horizons-cdn.hostinger.com/2e00df01-6de9-40c2-a30f-a77c0c9dbb9c/74034da85e49a8108df924a977443dad.png"
                  alt="Bankai Store Logo"
                  className="h-10 w-auto transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))' }}
                />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 py-1"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchSubmit();
                }}
                className="relative w-full"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm bg-card/60 border border-border/60 rounded-xl focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 text-foreground transition-all placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={openWhatsApp}
                className="hidden sm:inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  isAdmin
                    ? 'bg-primary/20 text-primary border-primary/40 shadow-sm shadow-primary/20'
                    : 'bg-card/80 text-muted-foreground border-border/60 hover:text-primary hover:border-primary/30'
                }`}
                title={isAdmin ? 'Open Admin Dashboard' : 'Admin Login'}
              >
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="hidden md:inline">{isAdmin ? 'Dashboard' : 'Admin'}</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search & Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border/60 py-4 px-2 space-y-4 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchSubmit();
                  setMobileMenuOpen(false);
                }}
                className="relative"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </form>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left px-3 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-card rounded-lg transition-colors"
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
                <button
                  onClick={() => {
                    openWhatsApp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-950"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
