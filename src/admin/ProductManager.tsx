import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Sparkles, Image as ImageIcon, X, Check, AlertCircle } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductManagerProps {
  products: Product[];
  settings: StoreSettings;
  onRefresh: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  settings,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAnime, setFormAnime] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTrending, setFormTrending] = useState(false);
  const [formStock, setFormStock] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
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

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: dataUrl, filename: file.name }),
            });
            const result = await res.json();
            if (result.success && result.url) {
              setFormImage(result.url);
            } else {
              setFormImage(dataUrl);
            }
          } catch (err) {
            setFormImage(dataUrl);
          }
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  const animes = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.anime))).filter(Boolean);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.anime.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCategory]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormCategory(categories[0] || 'Anime Figures');
    setFormAnime(animes[0] || 'Naruto');
    setFormImage('');
    setImageInputMode('file');
    setFormTrending(false);
    setFormStock('In Stock');
    setIsAddModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(String(p.price));
    setFormOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setFormCategory(p.category);
    setFormAnime(p.anime);
    setFormImage(p.image);
    setImageInputMode(p.image?.startsWith('data:') ? 'file' : 'url');
    setFormTrending(Boolean(p.isTrending));
    setFormStock(p.stockStatus || 'In Stock');
    setIsAddModalOpen(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice || !formCategory || !formAnime || !formImage) {
      setMessage({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        name: formName.trim(),
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        category: formCategory.trim(),
        anime: formAnime.trim(),
        image: formImage.trim(),
        isTrending: formTrending,
        stockStatus: formStock,
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: editingProduct ? 'Product updated successfully!' : 'New product added!',
        });
        setTimeout(() => {
          setIsAddModalOpen(false);
          onRefresh();
        }, 800);
      } else {
        setMessage({ type: 'error', text: data.message || 'Operation failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to communicate with API server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeletingId(null);
        onRefresh();
      }
    } catch (err) {
      alert('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/70 border border-border/80 p-4 md:p-5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-card/70 border border-border/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Category</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Anime</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Stock / Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-muted/30 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white line-clamp-1 max-w-[200px] md:max-w-xs">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground sm:hidden">
                          {p.category} • {p.anime}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-white">
                      {settings.currency}{p.price.toLocaleString('en-IN')}
                    </div>
                    {p.originalPrice && (
                      <div className="text-[10px] text-muted-foreground line-through">
                        {settings.currency}{p.originalPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                    {p.anime}
                  </td>

                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.stockStatus === 'Out of Stock'
                            ? 'bg-red-950/60 text-red-400 border border-red-800'
                            : p.stockStatus === 'Low Stock'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {p.stockStatus || 'In Stock'}
                      </span>
                      {p.isTrending && (
                        <span className="p-1 rounded bg-primary/20 text-primary" title="Trending">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-muted/40 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {deletingId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-2 py-1 rounded bg-destructive text-white text-xs font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-card border border-primary/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-muted/30"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl md:text-2xl font-black text-white mb-2">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Enter the collectible details below. Changes sync directly to the live store.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1:18 Scale Toyota Trueno Drift RC Car"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1399"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Original Price (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1799"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Category & Anime */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    list="categories-list"
                    placeholder="e.g. Anime Figures"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  />
                  <datalist id="categories-list">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Anime Franchise *
                  </label>
                  <input
                    type="text"
                    required
                    list="anime-list"
                    placeholder="e.g. One Piece"
                    value={formAnime}
                    onChange={(e) => setFormAnime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  />
                  <datalist id="anime-list">
                    {animes.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Image Input (File Upload or URL) */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Product Image *
                </label>

                {/* Mode Selector */}
                <div className="flex gap-2 mb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('file')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      imageInputMode === 'file'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground hover:text-white'
                    }`}
                  >
                    Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      imageInputMode === 'url'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-muted-foreground hover:text-white'
                    }`}
                  >
                    Paste Image URL
                  </button>
                </div>

                {imageInputMode === 'file' ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-background/50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs font-semibold text-white">Click to select or drag image here</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">Supports PNG, JPG, WebP (auto-optimized)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://assets.bankaistore.store/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  />
                )}

                {/* Preview Box */}
                {formImage && (
                  <div className="mt-3 flex items-center justify-between p-2.5 bg-background/60 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover bg-muted/40 border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">Image Ready</span>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs block font-mono">
                          {formImage.startsWith('data:') ? 'Optimized WebP File' : formImage}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="p-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Stock Status & Trending */}
              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Stock Status
                  </label>
                  <select
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="trending-check"
                    checked={formTrending}
                    onChange={(e) => setFormTrending(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                  />
                  <label htmlFor="trending-check" className="text-xs font-semibold text-foreground cursor-pointer">
                    Feature as Trending / Exclusive
                  </label>
                </div>
              </div>

              {/* Feedback Message */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-destructive/10 text-destructive border border-destructive/30'
                  }`}
                >
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs md:text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold shadow-md shadow-primary/20 flex items-center gap-2"
                >
                  {loading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
