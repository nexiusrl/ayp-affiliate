<p align="center">
  <img src="public/logo.png" alt="AYP Affiliate Logo" width="120" height="120" />
</p>

<h1 align="center">AYP Affiliate</h1>

<p align="center">
  <strong>AYP Affiliate</strong> adalah platform showcase produk afiliasi yang dibangun menggunakan <strong>Next.js (App Router)</strong>. Aplikasi ini dirancang untuk menampilkan produk-produk terbaik dari marketplace seperti Shopee dan Tokopedia dengan dukungan filter kategori dan pencarian cepat.
</p>

<p align="center">
  Aplikasi dilengkapi dengan <strong>Dashboard Admin</strong> yang aman untuk mengelola kategori dan produk secara manual.
</p>

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=typescript,javascript,nextjs,react,tailwind,mysql,postgres,supabase" alt="Tech Stack" />
  </a>
</p>

---

## 🚀 Fitur Utama

- **Public Showcase**: Grid produk responsif dengan filter pencarian instan dan navigasi kategori.
- **Admin Dashboard**: Halaman manajemen produk dan kategori khusus admin.
- **Hybrid Database**: Mendukung penggunaan database lokal **MariaDB/MySQL** untuk pengembangan bebas-biaya (*local development*), dan **Supabase (PostgreSQL)** untuk server produksi.
- **Data Migration Tool**: Script otomatis (`scripts/migrate.js`) untuk memigrasikan data kategori dan produk dari database lokal (MariaDB/MySQL) ke production (Supabase).
- **Security Hardening**:
  - Semua endpoint API admin (`/api/admin/*`) dilindungi oleh middleware.
  - Cookie sesi ditandatangani secara kriptografis menggunakan **Web Crypto API HMAC SHA-256**.
  - Bebas dari kerentanan SQL Injection dengan Prepared Statements.

---

## 🛠️ Tech Stack

- **Languages**: ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![SQL](https://img.shields.io/badge/SQL-CC2927?style=flat-square&logo=sqlite&logoColor=white)
- **Framework**: ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
- **Styling**: ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
- **Icons**: ![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-2563EB?style=flat-square&logo=lucide&logoColor=white)
- **Database**: ![MySQL](https://img.shields.io/badge/MySQL-00758F?style=flat-square&logo=mysql&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
- **Token Signing**: Native Web Crypto API

---

## ⚙️ Cara Memulai

### 1. Setup Database
Rincian petunjuk instalasi dan impor skema database lokal (MariaDB) maupun awan (Supabase) dapat dilihat pada dokumen:
👉 **[PANDUAN SETUP DATABASE (GUIDE.md)](./GUIDE.md)**

### 2. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env.local` dan lengkapi nilai variabelnya:
```bash
cp .env.example .env.local
```

### 3. Jalankan Server Pengembangan
Instal dependensi dan jalankan aplikasi secara lokal:
```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat hasilnya.

---

## 🏗️ Struktur Folder Utama

```
ayp-affiliate/
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, API Handlers)
│   ├── components/          # Reusable UI, Layout, & Admin components
│   ├── lib/
│   │   ├── db/              # Database Abstraction Layer (MySQL & Supabase wrappers)
│   │   ├── auth.ts          # Cryptographic Token Helper (Web Crypto)
│   │   └── utils.ts         # Styled utility helpers
│   ├── types/               # TypeScript interfaces
│   └── proxy.ts             # Authentication proxy middleware
├── supabase/                # SQL Schema files
├── scripts/                 # Migration script and helper utilities
├── GUIDE.md                 # Database setup tutorial
└── README.md                # Dokumentasi utama proyek
```
