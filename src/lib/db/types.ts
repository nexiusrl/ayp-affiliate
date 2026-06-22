import type { Product, Category } from "@/types";

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  limit?: number;
  includeInactive?: boolean;
}

export interface CreateProductData {
  name: string;
  description?: string | null;
  price: number;
  image_url: string;
  affiliate_url: string;
  platform: "shopee" | "tokopedia";
  category_id?: string | null;
  is_active?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface CreateCategoryData {
  name: string;
  slug: string;
}

export interface IDatabase {
  // Products
  getProducts(query?: ProductQuery): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: CreateProductData): Promise<Product>;
  updateProduct(id: string, data: UpdateProductData): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(data: CreateCategoryData): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}
