-- ============================================
-- AYP Affiliate - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Table: categories
-- ============================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now() not null
);

-- ============================================
-- Table: products
-- ============================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(15, 0) not null default 0,
  image_url text not null default '',
  affiliate_url text not null,
  platform text not null check (platform in ('shopee', 'tokopedia')),
  category_id uuid references categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

-- ============================================
-- Indexes for performance
-- ============================================
create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_is_active_idx on products(is_active);
create index if not exists products_platform_idx on products(platform);
create index if not exists products_created_at_idx on products(created_at desc);

-- Full-text search index
create index if not exists products_fts_idx on products
  using gin(to_tsvector('indonesian', name || ' ' || coalesce(description, '')));

-- ============================================
-- Row Level Security (RLS)
-- Allow public read, no public write
-- ============================================
alter table categories enable row level security;
alter table products enable row level security;

-- Public can read active products
create policy "Public can read active products"
  on products for select
  using (is_active = true);

-- Public can read categories
create policy "Public can read categories"
  on categories for select
  using (true);

-- Service role can do everything (used by admin API routes)
create policy "Service role full access to products"
  on products for all
  using (auth.role() = 'service_role');

create policy "Service role full access to categories"
  on categories for all
  using (auth.role() = 'service_role');

-- ============================================
-- Sample Data (optional, remove if not needed)
-- ============================================
insert into categories (name, slug) values
  ('Elektronik', 'elektronik'),
  ('Fashion', 'fashion'),
  ('Rumah & Dapur', 'rumah-dapur'),
  ('Kecantikan', 'kecantikan'),
  ('Olahraga', 'olahraga')
on conflict (slug) do nothing;
