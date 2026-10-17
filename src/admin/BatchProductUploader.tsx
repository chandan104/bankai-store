import React, { useState } from 'react';
import { Layers, Plus, Trash2, CheckCircle, Upload, AlertCircle, FileCode } from 'lucide-react';
import { Product } from '../types';

interface BatchProductUploaderProps {
  onSuccess: () => void;
}

export const BatchProductUploader: React.FC<BatchProductUploaderProps> = ({ onSuccess }) => {
  const [batch, setBatch] = useState<Partial<Product>[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [anime, setAnime] = useState('');
  const [image, setImage] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddToBatch = () => {
    if (!name || !price || !category || !anime || !image) {
      setMessage({ type: 'error', text: 'Please fill in all product fields to add to batch.' });
      return;
    }

    if (batch.length >= 20) {
      setMessage({ type: 'error', text: 'Maximum 20 items per batch.' });
      return;
    }

    const item: Partial<Product> = {
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category: category.trim(),
      anime: anime.trim(),
      image: image.trim(),
      isTrending: false,
      stockStatus: 'In Stock',
    };

    setBatch([...batch, item]);
    setName('');
    setPrice('');
    setOriginalPrice('');
    setImage('');
    setMessage(null);
  };

  const handleRemoveFromBatch = (index: number) => {
    setBatch(batch.filter((_, idx) => idx !== index));
  };

  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setMessage({ type: 'error', text: 'JSON must be an array of product objects.' });
        return;
      }
      setBatch([...batch, ...parsed]);
      setJsonText('');
      setShowJsonMode(false);
      setMessage({ type: 'success', text: `Loaded ${parsed.length} items from JSON!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid JSON format. Please verify your syntax.' });
    }
  };

  const handleSubmitBatch = async () => {
    if (batch.length === 0) {
      setMessage({ type: 'error', text: 'Your batch queue is empty.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batch }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully uploaded ${data.addedCount} products to live database!`,
        });
        setBatch([]);
        setTimeout(() => onSuccess(), 1200);
      } else {
        setMessage({ type: 'error', text: data.message || 'Batch upload failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to communicate with API server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Batch Product Uploader</h3>
              <p className="text-xs text-muted-foreground">
                Queue multiple anime collectibles and commit them in a single batch
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowJsonMode(!showJsonMode)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-white flex items-center gap-2"
          >
            <FileCode className="w-4 h-4 text-primary" />
            <span>{showJsonMode ? 'Form Mode' : 'Paste Raw JSON'}</span>
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                : 'bg-destructive/10 text-destructive border border-destructive/30'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {showJsonMode ? (
          <div className="space-y-4">
            <textarea
              rows={8}
              placeholder={`[\n  {\n    "name": "Zoro Sitting Figure",\n    "price": 799,\n    "originalPrice": 1099,\n    "category": "Anime Figures",\n    "anime": "One Piece",\n    "image": "https://assets.bankaistore.store/..."\n  }\n]`}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full p-4 font-mono text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
            <div className="flex justify-end">
              <button
                onClick={handleParseJson}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
              >
                Import into Queue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name (e.g. Madara Uchiha 20cm Figure)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
                <input
                  type="number"
                  placeholder="Orig. Price (₹)"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Category (e.g. Anime Figures, RC Car, Katanas)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />

              <input
                type="text"
                placeholder="Anime Series (e.g. Naruto, Bleach, One Piece)"
                value={anime}
                onChange={(e) => setAnime(e.target.value)}
                className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex gap-3">
              <input
                type="url"
                placeholder="Permanent Image URL (e.g. https://assets.bankaistore.store/...)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />

              <button
                type="button"
                onClick={handleAddToBatch}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold flex items-center gap-2 shadow-md shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Batch</span>
              </button>
            </div>
          </div>
        )}

        {/* Staging Queue List */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-white">
              Staging Queue ({batch.length} {batch.length === 1 ? 'item' : 'items'})
            </h4>
            {batch.length > 0 && (
              <button
                onClick={() => setBatch([])}
                className="text-xs text-destructive hover:underline"
              >
                Clear Queue
              </button>
            )}
          </div>

          {batch.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No products queued. Add products using the form above or paste raw JSON.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {batch.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border text-xs gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-9 h-9 rounded-lg object-cover bg-muted"
                    />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.category} • {item.anime} • ₹{item.price}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFromBatch(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {batch.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
              <button
                onClick={handleSubmitBatch}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {loading ? 'Uploading...' : `Submit Batch of ${batch.length} to Live Store`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
