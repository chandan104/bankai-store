import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle,
  Upload,
  AlertCircle,
  FileCode,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../types';
import { CURATED_CATEGORIES, CURATED_ANIMES } from './ProductManager';

interface BatchProductUploaderProps {
  onSuccess: () => void;
  onAddBatch?: (batch: Partial<Product>[]) => void;
}

export const BatchProductUploader: React.FC<BatchProductUploaderProps> = ({ onSuccess, onAddBatch }) => {
  const [batch, setBatch] = useState<Partial<Product>[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Anime Figures');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [anime, setAnime] = useState('Naruto');
  const [isCustomAnime, setIsCustomAnime] = useState(false);
  const [customAnimeInput, setCustomAnimeInput] = useState('');
  const [image, setImage] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'file'>('file');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'reading' | 'compressing' | 'complete' | 'error'
  >('idle');
  const [jsonText, setJsonText] = useState('');
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('reading');
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadStatus('compressing');
      setUploadProgress(55);

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.85);

          setUploadProgress(85);
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: dataUrl, filename: file.name }),
            });
            const result = await res.json();
            if (result.success && result.url) {
              setImage(result.url);
            } else {
              setImage(dataUrl);
            }
          } catch (err) {
            setImage(dataUrl);
          }

          setUploadProgress(100);
          setUploadStatus('complete');
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddToBatch = () => {
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : category.trim();
    const finalAnime = isCustomAnime ? customAnimeInput.trim() : anime.trim();

    if (!name.trim() || !price || !finalCategory || !finalAnime || !image) {
      setMessage({ type: 'error', text: 'Please fill in all product fields and provide an image.' });
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
      category: finalCategory,
      anime: finalAnime,
      image: image.trim(),
      isTrending: false,
      stockStatus: 'In Stock',
    };

    setBatch([...batch, item]);
    setName('');
    setPrice('');
    setOriginalPrice('');
    setImage('');
    setUploadStatus('idle');
    setUploadProgress(0);
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
      setMessage({ type: 'success', text: `Loaded ${parsed.length} items from JSON into queue!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid JSON format. Please verify your syntax.' });
    }
  };

  const handleSubmitBatch = async () => {
    if (batch.length === 0) {
      setMessage({ type: 'error', text: 'Your batch queue is empty.' });
      return;
    }

    if (loading) return;
    setLoading(true);
    setMessage(null);

    // 1. Optimistically commit to local state & localStorage
    if (onAddBatch) {
      onAddBatch(batch);
    }

    try {
      // 2. Also send to API server
      await fetch('/api/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batch }),
      }).catch(() => null);

      setMessage({
        type: 'success',
        text: `Successfully added ${batch.length} products to store!`,
      });
      setBatch([]);
      setTimeout(() => onSuccess(), 800);
    } catch (err) {
      setBatch([]);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Batch Product Uploader</h3>
              <p className="text-xs text-muted-foreground">
                Queue multiple anime collectibles and commit them all in a single batch
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowJsonMode(!showJsonMode)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-white flex items-center gap-2 transition-colors"
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
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                Import into Queue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Name, Price, Orig Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name (e.g. Madara Uchiha 20cm Figure) *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Price (₹) *"
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

            {/* Exact Category & Franchise Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Exact Category *
                </label>
                <select
                  value={isCustomCategory ? '__CUSTOM__' : category}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomCategory(true);
                    } else {
                      setIsCustomCategory(false);
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                >
                  <optgroup label="Storefront Categories">
                    {CURATED_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__CUSTOM__">+ Custom Category...</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    placeholder="Enter custom category..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="mt-2 w-full px-3 py-1.5 text-xs bg-background border border-primary/50 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Anime Franchise *
                </label>
                <select
                  value={isCustomAnime ? '__CUSTOM__' : anime}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomAnime(true);
                    } else {
                      setIsCustomAnime(false);
                      setAnime(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                >
                  <optgroup label="Franchises">
                    {CURATED_ANIMES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__CUSTOM__">+ Custom Franchise...</option>
                </select>

                {isCustomAnime && (
                  <input
                    type="text"
                    placeholder="Enter anime franchise..."
                    value={customAnimeInput}
                    onChange={(e) => setCustomAnimeInput(e.target.value)}
                    className="mt-2 w-full px-3 py-1.5 text-xs bg-background border border-primary/50 rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                )}
              </div>
            </div>

            {/* Image Upload with live progress */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Product Image *
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      imageMode === 'file'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground'
                    }`}
                  >
                    Device Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      imageMode === 'url'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageMode === 'file' ? (
                <div>
                  <label className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-background/50 transition-colors">
                    <UploadCloud className="w-6 h-6 text-primary mb-1" />
                    <span className="text-xs font-semibold text-white">Select Product Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {uploadStatus !== 'idle' && (
                    <div className="mt-2 p-2 bg-background/80 rounded-xl border border-border text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          {uploadStatus === 'complete' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                          )}
                          {uploadStatus === 'complete' ? 'Ready!' : 'Compressing image...'}
                        </span>
                        <span className="font-mono text-primary font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  placeholder="https://assets.bankaistore.store/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              )}
            </div>

            {/* Add to batch action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleAddToBatch}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product to Staging Queue</span>
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
                className="text-xs text-destructive hover:underline font-semibold"
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
                      className="w-10 h-10 rounded-lg object-cover bg-muted border border-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://assets.bankaistore.store/wp-content/uploads/2026/08/IMG-20260826-WA0010.jpg';
                      }}
                    />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="text-primary font-semibold">{item.category}</span> •{' '}
                        {item.anime} • ₹{item.price}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFromBatch(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
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
                  {loading ? 'Committing to Store...' : `Submit Batch of ${batch.length} to Live Store`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
