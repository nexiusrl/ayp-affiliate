# Panduan Setup Database — AYP Affiliate

Proyek AYP Affiliate mendukung penggunaan dua provider database yang berbeda secara dinamis berdasarkan nilai environment variable `DATABASE_PROVIDER` pada file `.env.local`:
1. **Local Development (MariaDB/MySQL)**
2. **Production (Supabase PostgreSQL)**

Berikut adalah langkah-langkah untuk melakukan setup pada kedua database tersebut.

---

## 1. Setup Database Lokal (MariaDB/MySQL) — Development

Proses ini dilakukan di komputer lokal Anda (Linux/macOS/Windows) untuk keperluan pengembangan.

### Langkah 1.1: Pastikan Service MariaDB/MySQL Aktif
Pastikan database engine lokal Anda berjalan. Di sistem operasi Linux, jalankan perintah:
```bash
sudo systemctl status mariadb
# atau jika menggunakan mysql:
sudo systemctl status mysql
```
*Jika belum menyala, jalankan dengan `sudo systemctl start mariadb`.*

### Langkah 1.2: Import Schema Database
Skema database untuk MariaDB telah disiapkan pada berkas `supabase/schema.mariadb.sql`. Impor skema tersebut ke dalam database lokal Anda dengan perintah berikut:
```bash
mysql -u your_root_username -p < supabase/schema.mariadb.sql
```
Perintah ini akan membuat database `ayp_affiliate` beserta tabel-tabelnya (`categories` & `products`) serta mengisi data kategori sampel awal.

### Langkah 1.3: Mengatasi Masalah Hak Akses User 'root' (Penting untuk Linux)
Di sistem operasi Linux, user `root` database secara default menggunakan modul `unix_socket` (autentikasi sistem) sehingga tidak bisa diakses dari aplikasi Next.js menggunakan password. Anda disarankan membuat user database baru:

1. Masuk ke console database:
   ```bash
   sudo mysql
   ```
2. Buat user baru (misalnya `ayp_user`) dan berikan hak akses penuh ke database `ayp_affiliate`:
   ```sql
   CREATE USER 'your_dev_db_user'@'localhost' IDENTIFIED BY 'your_dev_db_password';
   GRANT ALL PRIVILEGES ON ayp_affiliate.* TO 'your_dev_db_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Langkah 1.4: Konfigurasi `.env.local`
Buka file `.env.local` di folder root proyek Anda dan atur variabel koneksi MariaDB lokal:
```env
DATABASE_PROVIDER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_dev_db_user
DB_PASSWORD=your_dev_db_password
DB_NAME=ayp_affiliate
```

---

## 2. Setup Database Supabase — Production

Gunakan Supabase untuk database produksi saat aplikasi dideploy ke layanan cloud seperti Vercel.

### Langkah 2.1: Buat Proyek Supabase
1. Masuk atau daftar akun di [Supabase.com](https://supabase.com/).
2. Buat proyek baru (*New Project*).
3. Catat **Project URL** dan **API Keys (anon key)** yang diberikan pada bagian settings.

### Langkah 2.2: Buat Skema Tabel di Supabase
1. Masuk ke proyek Supabase Anda dan buka menu **SQL Editor** dari sidebar kiri.
2. Salin seluruh isi file `supabase/schema.sql` dari proyek lokal Anda.
3. Tempel (*paste*) kode SQL tersebut ke SQL Editor Supabase, lalu klik tombol **Run**.
4. Tabel `categories` dan `products` beserta relasi kunci asing (*Foreign Key*) akan otomatis terbuat.

### Langkah 2.3: Ambil Service Role Key (Untuk Operasi Admin)
Operasi dashboard admin (tambah/edit/hapus) membutuhkan hak akses penuh bypass RLS (Row Level Security). Anda perlu mengambil **Service Role Key**:
1. Di dasbor Supabase, buka menu **Settings** (ikon gerigi) > **API**.
2. Cari bagian **Project API keys** dan temukan key dengan nama `service_role` (klik *Reveal* untuk melihat kuncinya).
3. *PENTING: Jangan pernah membagikan Service Role Key ini ke publik.*

### Langkah 2.4: Konfigurasi `.env.local` atau Environment Variables Vercel
Tambahkan kredensial Supabase Anda ke `.env.local` lokal Anda untuk pengujian produksi, atau ke pengaturan Environment Variables di Vercel:
```env
DATABASE_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_secret
```

---

## 3. Menjalankan Aplikasi
Setelah database dan file `.env.local` siap, jalankan aplikasi di komputer Anda:
```bash
npm run dev
```

Buka browser Anda ke alamat:
* **Halaman Publik**: `http://localhost:3000`
* **Dasbor Admin**: `http://localhost:3000/admin/login` *(Login menggunakan kredensial `ADMIN_USERNAME` dan `ADMIN_PASSWORD` pada `.env.local`)*

---

## 4. Migrasi Data dari Lokal (MariaDB/MySQL) ke Production (Supabase)

Jika Anda telah memasukkan data kategori atau produk di komputer lokal selama masa pengembangan, Anda bisa langsung menyinkronkan data tersebut ke Supabase produksi tanpa perlu input manual ulang.

### Langkah 4.1: Lengkapi Kredensial di `.env.local`
Pastikan variabel lingkungan lokal (MariaDB) dan produksi (Supabase) terisi dengan benar di file `.env.local` Anda:
```env
# MariaDB Lokal
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_dev_db_user
DB_PASSWORD=your_dev_db_password
DB_NAME=ayp_affiliate

# Supabase Produksi
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_secret
```
*PENTING: Pastikan Anda menggunakan `SUPABASE_SERVICE_ROLE_KEY` (Service Role Key) agar script migrasi memiliki wewenang penuh untuk bypass kebijakan RLS (Row Level Security) saat menyisipkan data secara langsung.*

### Langkah 4.2: Jalankan Script Migrasi
Di terminal root proyek Anda, jalankan perintah Node.js berikut:
```bash
node scripts/migrate.js
```

Script akan otomatis:
1. Membaca data kategori lokal dan melakukan `upsert` ke Supabase.
2. Membaca data produk lokal, melakukan penyesuaian tipe data boolean, dan melakukan `upsert` ke Supabase.
3. Menjaga kecocokan ID UUID antara kategori dan produk lokal agar relasi antar-tabel tidak terputus.
