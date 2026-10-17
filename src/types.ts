export interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  anime: string;
  image: string;
  isTrending?: boolean;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderInquiry {
  id: string;
  productId?: number | string | null;
  productName: string;
  productPrice: number;
  productImage?: string;
  customerPhone?: string;
  customerName?: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  announcement: string;
  currency: string;
  shippingFee?: number;
  supportEmail?: string;
}

export interface QuizQuestion {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface AnimeQuote {
  id: number;
  character: string;
  anime: string;
  text: string;
}

export interface StoreStats {
  totalProducts: number;
  totalCategories: number;
  totalAnimes: number;
  totalCatalogValue: number;
  trendingCount: number;
  totalOrders: number;
  newOrders: number;
  confirmedOrders: number;
}
