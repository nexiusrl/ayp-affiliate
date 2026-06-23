export type Platform = "shopee" | "tokopedia";

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  affiliate_url: string;
  platform: Platform;
  category_id: string | null;
  is_active: boolean;
  click_count: number;
  created_at: string;
  categories?: Category | null;
}

export interface ScrapeResult {
  name: string;
  price: number;
  image_url: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
