/**
 * Database abstraction layer.
 *
 * Selects the correct implementation based on DATABASE_PROVIDER env:
 *   DATABASE_PROVIDER=mysql    → MariaDB/MySQL (local dev)
 *   DATABASE_PROVIDER=supabase → Supabase (production)  ← default
 *
 * Usage:
 *   import { db } from '@/lib/db'
 *   const products = await db.getProducts({ search: 'headset' })
 */

import { mysqlDb } from "./mysql";
import { supabaseDb } from "./supabase";
import type { IDatabase } from "./types";

const provider = process.env.DATABASE_PROVIDER ?? "supabase";

export const db: IDatabase = provider === "mysql" ? mysqlDb : supabaseDb;

export type { IDatabase, ProductQuery, CreateProductData, UpdateProductData, CreateCategoryData } from "./types";
