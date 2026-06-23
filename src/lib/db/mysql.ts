import mysql from "mysql2/promise";
import type { IDatabase, ProductQuery, CreateProductData, UpdateProductData, CreateCategoryData } from "./types";
import type { Product, Category } from "@/types";

// Singleton connection pool
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ayp_affiliate",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
      // Cast TINYINT(1) to boolean
      typeCast(field, next) {
        if (field.type === "TINY" && field.length === 1) {
          return field.string() === "1";
        }
        return next();
      },
    });
  }
  return pool;
}

// Helper: run a query
async function query<T>(sql: string, values?: any[]): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, values);
  return rows as T[];
}

async function queryOne<T>(sql: string, values?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, values);
  return rows[0] ?? null;
}

// Row type from DB (snake_case, flat)
interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
  affiliate_url: string;
  platform: "shopee" | "tokopedia";
  category_id: string | null;
  is_active: boolean;
  click_count: number;
  created_at: string;
  category_name: string | null;
  category_slug: string | null;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    affiliate_url: row.affiliate_url,
    platform: row.platform,
    category_id: row.category_id,
    is_active: row.is_active,
    click_count: row.click_count,
    created_at: row.created_at as unknown as string,
    categories: row.category_id
      ? { id: row.category_id, name: row.category_name!, slug: row.category_slug!, created_at: "" }
      : null,
  };
}

const PRODUCT_SELECT = `
  SELECT
    p.*,
    c.name  AS category_name,
    c.slug  AS category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

export const mysqlDb: IDatabase = {
  // ── Products ──────────────────────────────────────────────────

  async getProducts({ search, categoryId, limit = 60, offset = 0, sort = "newest", includeInactive } = {}): Promise<Product[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (!includeInactive) {
      conditions.push("p.is_active = 1");
    }

    if (search) {
      conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      conditions.push("p.category_id = ?");
      values.push(categoryId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    
    // Sort logic
    let orderBy = "p.created_at DESC";
    if (sort === "cheapest") {
      orderBy = "p.price ASC";
    } else if (sort === "expensive") {
      orderBy = "p.price DESC";
    }

    // Limit and offset logic
    let limitOffsetClause = "LIMIT ?";
    values.push(limit);

    if (offset > 0) {
      limitOffsetClause = "LIMIT ? OFFSET ?";
      values.push(offset);
    }

    const rows = await query<ProductRow>(
      `${PRODUCT_SELECT} ${where} ORDER BY ${orderBy} ${limitOffsetClause}`,
      values
    );
    return rows.map(mapProduct);
  },

  async getProductById(id: string): Promise<Product | null> {
    const row = await queryOne<ProductRow>(
      `${PRODUCT_SELECT} WHERE p.id = ?`,
      [id]
    );
    return row ? mapProduct(row) : null;
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO products
        (id, name, description, price, image_url, affiliate_url, platform, category_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.description ?? null,
        data.price,
        data.image_url,
        data.affiliate_url,
        data.platform,
        data.category_id ?? null,
        data.is_active ?? true,
      ]
    );
    return (await this.getProductById(id))!;
  },

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined)          { fields.push("name = ?");          values.push(data.name); }
    if (data.description !== undefined)   { fields.push("description = ?");   values.push(data.description); }
    if (data.price !== undefined)         { fields.push("price = ?");         values.push(data.price); }
    if (data.image_url !== undefined)     { fields.push("image_url = ?");     values.push(data.image_url); }
    if (data.affiliate_url !== undefined) { fields.push("affiliate_url = ?"); values.push(data.affiliate_url); }
    if (data.platform !== undefined)      { fields.push("platform = ?");      values.push(data.platform); }
    if (data.category_id !== undefined)   { fields.push("category_id = ?");   values.push(data.category_id); }
    if (data.is_active !== undefined)     { fields.push("is_active = ?");     values.push(data.is_active); }

    if (fields.length) {
      values.push(id);
      await query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
    }

    return (await this.getProductById(id))!;
  },

  async deleteProduct(id: string): Promise<void> {
    await query("DELETE FROM products WHERE id = ?", [id]);
  },

  async incrementClickCount(id: string): Promise<void> {
    await query("UPDATE products SET click_count = click_count + 1 WHERE id = ?", [id]);
  },

  // ── Categories ────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    interface CategoryRow {
      id: string;
      name: string;
      slug: string;
      created_at: Date | string;
      product_count?: number;
    }
    const rows = await query<CategoryRow>(
      `SELECT c.id, c.name, c.slug, c.created_at, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
       GROUP BY c.id
       ORDER BY c.name`
    );
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      created_at: typeof r.created_at === "string" ? r.created_at : r.created_at.toISOString(),
      product_count: Number(r.product_count) || 0
    }));
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return queryOne<Category>(
      "SELECT * FROM categories WHERE slug = ?",
      [slug]
    );
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const id = crypto.randomUUID();
    try {
      await query(
        "INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)",
        [id, data.name, data.slug]
      );
    } catch (error: any) {
      if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
        throw new Error("DUPLICATE_SLUG");
      }
      throw error;
    }
    return (await queryOne<Category>("SELECT * FROM categories WHERE id = ?", [id]))!;
  },

  async deleteCategory(id: string): Promise<void> {
    await query("DELETE FROM categories WHERE id = ?", [id]);
  },
};
