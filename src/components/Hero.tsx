import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, ShieldCheck, Truck, Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroProps {
  settings: StoreSettings;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExplore }) => {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank');
  };

  return (
    <section id="home" className="relative min-h-[95vh] md:min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background Anime Visual Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1670469447000-6d644c45141f)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide">
              anime collectibles
            </span>
          </div>

          {/* Heading matching original site */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            Premium Anime <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Collectibles & Merchandise
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
            Discover exclusive figures, katanas, pocket watches, and more from your favorite anime series
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-card border border-border/80 text-foreground hover:text-emerald-400 hover:border-emerald-500/40 font-semibold text-lg flex items-center justify-center gap-2.5 hover:bg-emerald-950/20 active:scale-[0.98] transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Contact on WhatsApp</span>
            </button>
          </div>

          {/* Highlights Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border/40 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
              <Zap className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">50+ Rare Items</p>
                <p className="text-[11px] text-muted-foreground">Hand-picked gear</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">100% Quality</p>
                <p className="text-[11px] text-muted-foreground">Inspected before ship</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Fast Dispatch</p>
                <p className="text-[11px] text-muted-foreground">Padded safe parcel</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/40">
              <MessageSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">1-Click Order</p>
                <p className="text-[11px] text-muted-foreground">Direct WhatsApp chat</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
