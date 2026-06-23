-- ============================================
-- AYP Affiliate - MariaDB Schema (Development)
-- Run this in your local MariaDB/MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS ayp_affiliate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ayp_affiliate;

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  name       VARCHAR(255) NOT NULL,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id            CHAR(36)       NOT NULL DEFAULT (UUID()),
  name          VARCHAR(512)   NOT NULL,
  description   TEXT,
  price         DECIMAL(15, 0) NOT NULL DEFAULT 0,
  image_url     TEXT           NOT NULL DEFAULT '',
  affiliate_url TEXT           NOT NULL,
  platform      ENUM('shopee', 'tokopedia') NOT NULL,
  category_id   CHAR(36),
  is_active     TINYINT(1)     NOT NULL DEFAULT 1,
  click_count   INT            NOT NULL DEFAULT 0,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category_id (category_id),
  KEY idx_is_active   (is_active),
  KEY idx_platform    (platform),
  KEY idx_created_at  (created_at DESC),
  FULLTEXT KEY idx_fts (name, description),
  CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES categories (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample categories (optional)
-- ============================================
INSERT IGNORE INTO categories (id, name, slug) VALUES
  (UUID(), 'Elektronik',    'elektronik'),
  (UUID(), 'Fashion',       'fashion'),
  (UUID(), 'Rumah & Dapur', 'rumah-dapur'),
  (UUID(), 'Kecantikan',    'kecantikan'),
  (UUID(), 'Olahraga',      'olahraga');
