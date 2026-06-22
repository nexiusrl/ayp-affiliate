import { createClient } from "@supabase/supabase-js";
import type { IDatabase, ProductQuery, CreateProductData, UpdateProductData, CreateCategoryData } from "./types";
import type { Product, Category } from "@/types";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export const supabaseDb: IDatabase = {
  // ── Products ──────────────────────────────────────────────────

  async getProducts({ search, categoryId, limit = 60, includeInactive } = {}): Promise<Product[]> {
    const client = getClient();
    let q = client
      .from("products")
      .select("*, categories(id, name, slug)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!includeInactive) {
      q = q.eq("is_active", true);
    }
    if (search) {
      q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (categoryId) {
      q = q.eq("category_id", categoryId);
    }

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Product[];
  },

  async getProductById(id: string): Promise<Product | null> {
    const client = getClient();
    const { data } = await client
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("id", id)
      .single();
    return data as unknown as Product | null;
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const client = getClient();
    const { data: created, error } = await client
      .from("products")
      .insert({
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        image_url: data.image_url,
        affiliate_url: data.affiliate_url,
        platform: data.platform,
        category_id: data.category_id ?? null,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return created as unknown as Product;
  },

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const client = getClient();
    const { data: updated, error } = await client
      .from("products")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated as unknown as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // ── Categories ────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    const client = getClient();
    const { data } = await client.from("categories").select("*").order("name");
    return (data ?? []) as Category[];
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const client = getClient();
    const { data } = await client
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();
    return data as Category | null;
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const client = getClient();
    const { data: created, error } = await client
      .from("categories")
      .insert({ name: data.name, slug: data.slug })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("DUPLICATE_SLUG");
      throw new Error(error.message);
    }
    return created as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
