import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimeQuote } from '../types';

interface QuotesSectionProps {
  quotes: AnimeQuote[];
}

export const QuotesSection: React.FC<QuotesSectionProps> = ({ quotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!quotes || quotes.length === 0) return null;

  const current = quotes[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  return (
    <section id="quotes" className="py-24 bg-background relative overflow-hidden border-t border-border/40 scroll-mt-16">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Anime Philosophy & Words of Power
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Quotes of the Masters
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
            Timeless wisdom and fierce determinations that forged legendary anime worlds
          </p>
        </div>

        {/* Featured Quote Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card/80 border border-primary/20 rounded-3xl p-8 md:p-14 shadow-2xl backdrop-blur-xl">
            <Quote className="w-12 h-12 text-primary/30 mb-6" />

            <div className="min-h-[160px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <p className="text-lg md:text-2xl text-foreground font-medium leading-relaxed italic">
                    "{current.text}"
                  </p>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-white">
                        {current.character}
                      </h4>
                      <p className="text-xs md:text-sm text-primary font-medium">
                        {current.anime}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground font-mono">
                      {currentIndex + 1} / {quotes.length}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/40">
              <div className="flex gap-1.5 overflow-x-auto max-w-[240px] sm:max-w-md py-1">
                {quotes.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/40'
                    }`}
                    title={q.character}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-background/80 border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-white transition-all active:scale-95"
                  aria-label="Previous quote"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-background/80 border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-white transition-all active:scale-95"
                  aria-label="Next quote"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
