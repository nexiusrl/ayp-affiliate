const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local environment variables manually
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("⚠️ File .env.local tidak ditemukan. Menggunakan environment variables sistem.");
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

loadEnv();

async function migrate() {
  console.log("🔄 Memulai proses migrasi data dari MariaDB ke Supabase...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ Error: Kredensial Supabase tidak lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY terisi di .env.local."
    );
    process.exit(1);
  }

  // 1. Koneksi ke MariaDB
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ayp_affiliate",
      decimalNumbers: true,
    });
    console.log("🔌 Terhubung ke database MariaDB lokal.");
  } catch (err) {
    console.error("❌ Gagal terhubung ke MariaDB lokal:", err.message);
    process.exit(1);
  }

  // 2. Inisialisasi Supabase Client dengan Service Role Key (untuk bypass RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    // --- 1. MIGRASI KATEGORI ---
    console.log("⌛ Mengambil data kategori dari MariaDB...");
    const [categories] = await connection.execute("SELECT * FROM categories");
    console.log(`📂 Ditemukan ${categories.length} kategori.`);

    if (categories.length > 0) {
      // Hilangkan field created_at agar Supabase menggunakan default timestamp-nya sendiri
      const cleanCategories = categories.map(({ created_at, ...rest }) => rest);

      console.log("📤 Menyisipkan kategori ke Supabase...");
      const { error: catError } = await supabase
        .from("categories")
        .upsert(cleanCategories);

      if (catError) {
        throw new Error(`Gagal migrasi kategori ke Supabase: ${catError.message}`);
      }
      console.log("✅ Kategori berhasil dimigrasikan!");
    } else {
      console.log("ℹ️ Tidak ada kategori untuk dimigrasikan.");
    }

    // --- 2. MIGRASI PRODUK ---
    console.log("⌛ Mengambil data produk dari MariaDB...");
    const [products] = await connection.execute("SELECT * FROM products");
    console.log(`🛍️ Ditemukan ${products.length} produk.`);

    if (products.length > 0) {
      // Cast is_active ke boolean untuk PostgreSQL (karena MariaDB menyimpannya sebagai TINYINT 1/0)
      const cleanProducts = products.map(({ created_at, is_active, ...rest }) => ({
        ...rest,
        is_active: is_active === 1 || is_active === true,
      }));

      console.log("📤 Menyisipkan produk ke Supabase...");
      const { error: prodError } = await supabase
        .from("products")
        .upsert(cleanProducts);

      if (prodError) {
        throw new Error(`Gagal migrasi produk ke Supabase: ${prodError.message}`);
      }
      console.log("✅ Produk berhasil dimigrasikan!");
    } else {
      console.log("ℹ️ Tidak ada produk untuk dimigrasikan.");
    }

    console.log("🎉 Proses migrasi database lokal ke production selesai dengan sukses!");
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat migrasi:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Koneksi database lokal ditutup.");
    }
  }
}

migrate();
