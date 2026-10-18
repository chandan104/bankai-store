import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  UploadCloud,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

export const CURATED_CATEGORIES = [
  'Anime Figures',
  'RC Car',
  'Katanas',
  'Bobbleheads',
  'Pocket Watches',
  'Diecast Cars',
  'Kids Toys',
  'RC Aircraft',
  'Keychains',
  'Posters',
];

export const CURATED_ANIMES = [
  'One Piece',
  'Naruto',
  'Demon Slayer',
  'Dragon Ball Z',
  'Bleach',
  'Attack on Titan',
  'Death Note',
  'My Hero Academia',
  'Shinchan',
  'Pokemon',
  'Automotive',
  'DC Comics',
  'Kung Fu Panda',
  'Kaiju No. 8',
  'Aviation',
];

interface ProductManagerProps {
  products: Product[];
  settings: StoreSettings;
  onRefresh: () => void;
  onAddProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: number | string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  settings,
  onRefresh,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
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
  const [formCategory, setFormCategory] = useState('Anime Figures');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formAnime, setFormAnime] = useState('Naruto');
  const [isCustomAnime, setIsCustomAnime] = useState(false);
  const [customAnimeInput, setCustomAnimeInput] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTrending, setFormTrending] = useState(false);
  const [formStock, setFormStock] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Image Upload Progress State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'reading' | 'compressing' | 'uploading' | 'complete' | 'error'
  >('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadStats, setUploadStats] = useState<{
    fileName: string;
    rawSize: string;
    optimizedSize: string;
    savings: string;
  } | null>(null);

  // Category and Anime dynamic lists combining curated + existing
  const allCategories = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...CURATED_CATEGORIES, ...fromProducts]));
  }, [products]);

  const allAnimes = useMemo(() => {
    const fromProducts = products.map((p) => p.anime).filter(Boolean);
    return Array.from(new Set([...CURATED_ANIMES, ...fromProducts]));
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Image processor with real progress animations
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WebP).' });
      return;
    }

    const rawSizeStr = formatFileSize(file.size);
    setUploadStats(null);
    setUploadStatus('reading');
    setUploadProgress(15);
    setUploadStatusText(`Reading ${file.name} (${rawSizeStr})...`);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 30);
        setUploadProgress(15 + percent);
      }
    };

    reader.onload = (event) => {
      setUploadStatus('compressing');
      setUploadProgress(50);
      setUploadStatusText('Optimizing & converting to high-efficiency WebP...');

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

        if (!ctx) {
          setUploadStatus('error');
          setUploadStatusText('Canvas rendering failed.');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        setUploadProgress(70);
        setUploadStatus('uploading');
        setUploadStatusText('Encoding WebP & sending to store API...');

        // High efficiency WebP compression
        const dataUrl = canvas.toDataURL('image/webp', 0.85);

        // Approximate size of data URI in bytes
        const optSizeBytes = Math.round((dataUrl.length * 3) / 4);
        const optSizeStr = formatFileSize(optSizeBytes);
        const savingsPercent =
          file.size > optSizeBytes
            ? Math.round(((file.size - optSizeBytes) / file.size) * 100) + '%'
            : '0%';

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataUrl, filename: file.name }),
          });

          setUploadProgress(95);

          const result = await res.json();
          if (result.success && result.url) {
            setFormImage(result.url);
          } else {
            setFormImage(dataUrl);
          }

          setUploadProgress(100);
          setUploadStatus('complete');
          setUploadStatusText(`Ready! Optimized by ${savingsPercent}`);
          setUploadStats({
            fileName: file.name,
            rawSize: rawSizeStr,
            optimizedSize: optSizeStr,
            savings: savingsPercent,
          });
        } catch (err) {
          // Fallback to dataUrl on serverless
          setFormImage(dataUrl);
          setUploadProgress(100);
          setUploadStatus('complete');
          setUploadStatusText(`Ready! Optimized by ${savingsPercent}`);
          setUploadStats({
            fileName: file.name,
            rawSize: rawSizeStr,
            optimizedSize: optSizeStr,
            savings: savingsPercent,
          });
        }
      };

      img.onerror = () => {
        setUploadStatus('error');
        setUploadStatusText('Could not decode image file.');
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      setUploadStatus('error');
      setUploadStatusText('Failed to read file from disk.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormCategory(allCategories[0] || 'Anime Figures');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormAnime(allAnimes[0] || 'Naruto');
    setIsCustomAnime(false);
    setCustomAnimeInput('');
    setFormImage('');
    setImageInputMode('file');
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadStatusText('');
    setUploadStats(null);
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

    if (allCategories.includes(p.category)) {
      setFormCategory(p.category);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setFormCategory('__CUSTOM__');
      setIsCustomCategory(true);
      setCustomCategoryInput(p.category);
    }

    if (allAnimes.includes(p.anime)) {
      setFormAnime(p.anime);
      setIsCustomAnime(false);
      setCustomAnimeInput('');
    } else {
      setFormAnime('__CUSTOM__');
      setIsCustomAnime(true);
      setCustomAnimeInput(p.anime);
    }

    setFormImage(p.image);
    setImageInputMode(p.image?.startsWith('data:') ? 'file' : 'url');
    setUploadStatus(p.image ? 'complete' : 'idle');
    setUploadProgress(p.image ? 100 : 0);
    setUploadStatusText(p.image ? 'Current product image loaded' : '');
    setUploadStats(null);
    setFormTrending(Boolean(p.isTrending));
    setFormStock(p.stockStatus || 'In Stock');
    setIsAddModalOpen(true);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = isCustomCategory ? customCategoryInput.trim() : formCategory.trim();
    const finalAnime = isCustomAnime ? customAnimeInput.trim() : formAnime.trim();

    if (!formName.trim() || !formPrice || !finalCategory || !finalAnime || !formImage) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and upload an image.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formName.trim(),
      price: Number(formPrice),
      originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
      category: finalCategory,
      anime: finalAnime,
      image: formImage.trim(),
      isTrending: formTrending,
      stockStatus: formStock,
    };

    // 1. Optimistic instant local save (0ms lag, guarantees product appears immediately)
    if (editingProduct) {
      if (onUpdateProduct) onUpdateProduct(productPayload);
    } else {
      if (onAddProduct) onAddProduct(productPayload);
    }

    try {
      // 2. Also send to API server
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload),
        }).catch(() => null);
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload),
        }).catch(() => null);
      }

      setMessage({
        type: 'success',
        text: editingProduct
          ? `Successfully updated "${formName}" in ${finalCategory}!`
          : `Product added directly to "${finalCategory}"!`,
      });

      setTimeout(() => {
        setIsAddModalOpen(false);
        onRefresh();
      }, 700);
    } catch (err) {
      // Even if network fails, the product is already safely saved in local memory
      setIsAddModalOpen(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    setLoading(true);
    // 1. Immediately remove from local state
    if (onDeleteProduct) onDeleteProduct(id);
    setDeletingId(null);

    try {
      // 2. Also notify server API
      await fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => null);
      onRefresh();
    } catch (err) {
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/70 border border-border/80 p-4 md:p-5 rounded-2xl shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products or anime..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Exact Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2.5 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
          >
            <option value="">All Categories ({products.length})</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c} ({products.filter((p) => p.category === c).length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-card/70 border border-border/80 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Exact Category</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Franchise</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted/40 border border-border/60 flex-shrink-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://assets.bankaistore.store/wp-content/uploads/2026/08/IMG-20260826-WA0010.jpg';
                          }}
                        />
                      </div>
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
                      {settings.currency}
                      {p.price.toLocaleString('en-IN')}
                    </div>
                    {p.originalPrice && (
                      <div className="text-[10px] text-muted-foreground line-through">
                        {settings.currency}
                        {p.originalPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground font-medium">
                    {p.anime}
                  </td>

                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
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
                        <span
                          className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800 text-[10px] font-bold flex items-center gap-1"
                          title="Trending"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Exclusive</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-muted/40 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {deletingId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-destructive text-white text-xs font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
          <div className="relative w-full max-w-xl bg-card border border-primary/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh]">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-muted/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                {editingProduct ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Places product directly in its matching storefront category wheel
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-6">
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
                  className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
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

              {/* Exact Category & Anime Selection */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Exact Category *
                  </label>
                  <select
                    value={isCustomCategory ? '__CUSTOM__' : formCategory}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setFormCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <optgroup label="Storefront Category Wheels">
                      {allCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__CUSTOM__">+ New Custom Category...</option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom category name..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-xs bg-background border border-primary/50 rounded-lg text-foreground focus:outline-none focus:border-primary"
                    />
                  )}
                </div>

                {/* Anime Franchise Selector */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Anime Franchise *
                  </label>
                  <select
                    value={isCustomAnime ? '__CUSTOM__' : formAnime}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomAnime(true);
                      } else {
                        setIsCustomAnime(false);
                        setFormAnime(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <optgroup label="Popular Franchises">
                      {allAnimes.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__CUSTOM__">+ New Custom Franchise...</option>
                  </select>

                  {isCustomAnime && (
                    <input
                      type="text"
                      required
                      placeholder="Type anime franchise name..."
                      value={customAnimeInput}
                      onChange={(e) => setCustomAnimeInput(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-xs bg-background border border-primary/50 rounded-lg text-foreground focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
              </div>

              {/* IMAGE UPLOAD & VISUAL PROGRESS BAR */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Image *
                  </label>
                  <div className="flex gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        imageInputMode === 'file'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-background border border-border text-muted-foreground hover:text-white'
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        imageInputMode === 'url'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-background border border-border text-muted-foreground hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div className="space-y-3">
                    {/* Drag and Drop Zone */}
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processImageFile(file);
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'border-border/80 hover:border-primary/60 bg-background/50'
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 text-primary mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-white text-center">
                        Click to select or drag photo here
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5 text-center">
                        Auto-optimizes PNG, JPG, or WebP to high-speed WebP format
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    {/* LIVE UPLOAD PROCESS & PROGRESS BAR */}
                    {uploadStatus !== 'idle' && (
                      <div className="p-3.5 bg-background/80 rounded-2xl border border-border/80 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {uploadStatus === 'reading' ||
                            uploadStatus === 'compressing' ||
                            uploadStatus === 'uploading' ? (
                              <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            ) : uploadStatus === 'complete' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className="font-semibold text-white">{uploadStatusText}</span>
                          </div>
                          <span className="font-mono font-bold text-primary">{uploadProgress}%</span>
                        </div>

                        {/* Animated Progress Track */}
                        <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/60">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>

                        {/* Optimization Stats Badge */}
                        {uploadStats && (
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40 font-mono">
                            <span>Raw: {uploadStats.rawSize}</span>
                            <span className="text-emerald-400 font-bold">
                              ➔ Optimized: {uploadStats.optimizedSize} ({uploadStats.savings} saved)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://assets.bankaistore.store/..."
                      value={formImage}
                      onChange={(e) => {
                        setFormImage(e.target.value);
                        setUploadStatus(e.target.value ? 'complete' : 'idle');
                        setUploadProgress(e.target.value ? 100 : 0);
                        setUploadStatusText('Image URL specified');
                      }}
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>
                )}

                {/* Preview Box */}
                {formImage && (
                  <div className="mt-3 flex items-center justify-between p-3 bg-background/80 rounded-2xl border border-border/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover bg-muted/40 border border-purple-500/30 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://assets.bankaistore.store/wp-content/uploads/2026/08/IMG-20260826-WA0010.jpg';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-white block">Image Ready</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs block font-mono mt-0.5">
                          {formImage.startsWith('data:') ? 'Embedded WebP Image' : formImage}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImage('');
                        setUploadStatus('idle');
                        setUploadProgress(0);
                        setUploadStats(null);
                      }}
                      className="px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-semibold"
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
                  <label
                    htmlFor="trending-check"
                    className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Feature in Top Marquee</span>
                  </label>
                </div>
              </div>

              {/* Feedback Message */}
              {message && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                    message.type === 'success'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-destructive/10 text-destructive border border-destructive/30'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs md:text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || uploadStatus === 'reading' || uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs md:text-sm font-bold shadow-lg shadow-primary/25 flex items-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Store...</span>
                    </>
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
