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

async function runMigration() {
  const provider = process.env.DATABASE_PROVIDER || "mysql";
  console.log(`🔄 Menjalankan migrasi database untuk provider: ${provider.toUpperCase()}`);

  if (provider === "mysql") {
    let connection;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "ayp_affiliate",
      });

      console.log("🔌 Terhubung ke MariaDB/MySQL lokal.");
      
      // Check if click_count column exists
      const [columns] = await connection.execute("SHOW COLUMNS FROM products LIKE 'click_count'");
      if (columns.length > 0) {
        console.log("✅ Kolom 'click_count' sudah ada di database lokal.");
      } else {
        console.log("📤 Menambahkan kolom 'click_count' ke tabel 'products'...");
        await connection.execute("ALTER TABLE products ADD COLUMN click_count INT NOT NULL DEFAULT 0");
        console.log("✅ Berhasil menambahkan kolom 'click_count'!");
      }
    } catch (err) {
      console.error("❌ Gagal migrasi MariaDB lokal:", err.message);
      process.exit(1);
    } finally {
      if (connection) await connection.end();
    }
  } else if (provider === "supabase") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Kredensial Supabase tidak lengkap di .env.local.");
      process.exit(1);
    }

    // Connect to Supabase using postgres connection direct if we had connection string,
    // but wait! Since we only have HTTP client via supabaseServiceKey, we cannot execute arbitrary ALTER TABLE queries directly via supabase-js client
    // unless we use an RPC function or the Supabase SQL Editor.
    // Let's explain this to the user, and check if we can run it or if we can use a direct Postgres connection if they configure it.
    // Actually, we can check if they have a postgres connection string DB_URL or they can run it directly in Supabase SQL Editor.
    console.log("💡 Untuk database Supabase (produksi), silakan jalankan query berikut di SQL Editor Supabase Anda:");
    console.log("👉 ALTER TABLE products ADD COLUMN IF NOT EXISTS click_count INT NOT NULL DEFAULT 0;");
  } else {
    console.error("❌ Provider tidak didukung.");
  }
}

runMigration();
