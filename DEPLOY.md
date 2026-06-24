# Panduan Mendeploy ke Vercel

Dokumen ini berisi panduan lengkap langkah-demi-langkah untuk mendeploy aplikasi **AYP Affiliate** ke **Vercel** menggunakan database produksi **Supabase**.

---

## Prasyarat
1. Akun [Vercel](https://vercel.com/) (Gratis).
2. Akun [Supabase](https://supabase.com/) (Gratis).
3. Repositori GitHub berisi kode proyek ini yang sudah di-push ke branch utama (`main`).

---

## Langkah 1: Pengaturan Database di Supabase

Karena database lokal menggunakan MariaDB/MySQL (`localhost`), kita harus membuat database cloud **Supabase** untuk digunakan di lingkungan produksi Vercel.

1. Masuk ke [Supabase Dashboard](https://supabase.com/).
2. Buat proyek baru (*Create New Project*), tentukan nama proyek, password database, dan pilih region terdekat (misalnya Singapura).
3. Tunggu hingga proyek Supabase selesai diinisialisasi (biasanya 1-2 menit).
4. Buka menu **SQL Editor** pada panel navigasi sebelah kiri.
5. Klik **New Query** -> **Blank Query**.
6. Buka berkas [supabase/schema.sql](file:///home/dzul/Documents/Affiliate/ayp-affiliate/supabase/schema.sql) di editor lokal Anda, lalu salin (*copy*) seluruh isinya.
7. Tempel (*paste*) kode SQL tersebut ke dalam SQL Editor Supabase.
8. Klik tombol **Run** untuk membuat tabel `categories` dan `products`. Pastikan query berhasil dijalankan dengan sukses.

---

## Langkah 2: Mengambil Kredensial API Supabase

Buka menu **Project Settings** -> **API** di dashboard Supabase Anda untuk menyalin kunci-kunci API berikut:

### 1. Variabel Publik (Aman untuk Browser/Client)
- **`NEXT_PUBLIC_SUPABASE_URL`**: Salin URL dari bagian **Project URL**.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Salin key `anon` `public` dari bagian **Project API keys**.

### 2. Variabel Privat (Rahasia, Hanya untuk Sisi Server)
- **`SUPABASE_SERVICE_ROLE_KEY`**: Salin key `service_role` dari bagian **Project API keys** (klik *Reveal* terlebih dahulu untuk melihat kuncinya).
  > [!CAUTION]
  > Kunci `service_role` memiliki hak akses penuh untuk membypass kebijakan Row-Level Security (RLS) di database Anda. **JANGAN PERNAH** menambahkan prefix `NEXT_PUBLIC_` pada variabel ini karena kuncinya akan bocor ke browser pengguna!

---

## Langkah 3: Menyiapkan Variabel Sesi dan Admin

Anda juga membutuhkan variabel rahasia tambahan untuk mengamankan otentikasi admin:

- **`DATABASE_PROVIDER`**: Isi dengan nilai `supabase` (untuk mengarahkan aplikasi menggunakan Supabase, bukan database MySQL lokal).
- **`ADMIN_USERNAME`**: Tentukan nama pengguna kustom untuk masuk ke dashboard admin (contoh: `admin`).
- **`ADMIN_PASSWORD`**: Tentukan kata sandi kuat untuk masuk ke dashboard admin.
- **`SESSION_SECRET`**: Buat kunci enkripsi sesi acak dengan panjang 64 karakter hex. Anda dapat membuatnya di terminal lokal dengan menjalankan perintah:
  ```bash
  openssl rand -hex 32
  ```

---

## Langkah 4: Mendeploy Proyek di Vercel

1. Masuk ke [Vercel Dashboard](https://vercel.com/).
2. Klik tombol **Add New...** -> **Project**.
3. Di bawah daftar repositori GitHub yang terhubung, cari repositori proyek **ayp-affiliate** Anda, lalu klik **Import**.
4. Di bagian **Configure Project**:
   - **Framework Preset**: Biarkan terdeteksi otomatis sebagai **Next.js**.
   - **Root Directory**: `./` (Biarkan default).
5. Buka bagian **Environment Variables** dan masukkan satu per satu variabel lingkungan berikut:

   | Nama Variabel (Key) | Nilai (Value) | Scope |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | *URL Supabase Anda (Langkah 2)* | Centang semua (Production, Preview, Dev) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Key Anon Supabase Anda (Langkah 2)* | Centang semua (Production, Preview, Dev) |
   | `SUPABASE_SERVICE_ROLE_KEY` | *Key Service Role Supabase Anda (Langkah 2)* | Centang semua (Production, Preview, Dev) |
   | `DATABASE_PROVIDER` | `supabase` | Centang semua (Production, Preview, Dev) |
   | `ADMIN_USERNAME` | *Username Admin Pilihan Anda (Langkah 3)* | Centang semua (Production, Preview, Dev) |
   | `ADMIN_PASSWORD` | *Password Admin Pilihan Anda (Langkah 3)* | Centang semua (Production, Preview, Dev) |
   | `SESSION_SECRET` | *Session Secret Hasil Generate (Langkah 3)* | Centang semua (Production, Preview, Dev) |

6. Klik tombol **Deploy**.
7. Tunggu proses build selesai (sekitar 2-3 menit). 
8. Selamat! Website Anda kini online dan Vercel akan memberikan domain gratis `.vercel.app` untuk membuka website Anda.

---

## Langkah 5: Pemeliharaan & Fitur Produksi yang Aktif

Aplikasi Next.js Anda kini berjalan di Vercel dengan optimasi-optimasi penting berikut secara otomatis:
- **Kompresi WebP/AVIF Otomatis**: Server Vercel menggunakan modul `sharp` yang sudah terpasang untuk mempercepat proses konversi format gambar demi LCP yang lebih cepat.
- **Proteksi Brute Force**: Halaman login admin dibatasi dengan in-memory IP rate limiting, yang memblokir IP secara otomatis selama 15 menit jika terdeteksi 5 kegagalan login berturut-turut dari IP yang sama.
- **Mutasi Cache Instan**: Caching Next.js dikonfigurasi untuk langsung melakukan *invalidation* / *revalidate* sesaat setelah Anda mengedit, menambahkan, atau mengimpor produk di panel admin agar perubahan langsung tampil di beranda depan bagi pembeli.
