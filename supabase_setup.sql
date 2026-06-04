-- ============================================================
-- SUPABASE POSTGRESQL DATABASE SETUP FOR SUKA BAKAR DIMSUM POS
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. DROP EXISTING TABLES (IF RESETTING)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS store_status CASCADE;

-- ------------------------------------------------------------
-- 2. CREATE TABLE SCHEMA
-- ------------------------------------------------------------

-- Table: tables
CREATE TABLE tables (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    is_vip BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table: menu_items
CREATE TABLE menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    emoji TEXT NOT NULL DEFAULT '🥟',
    description TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    badge_color TEXT NOT NULL DEFAULT 'yellow'
);

-- Table: staff
CREATE TABLE staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Cashier',
    pin TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar TEXT,
    initials TEXT
);

-- Table: expenses
CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    staff TEXT NOT NULL,
    staff_initials TEXT,
    icon TEXT DEFAULT '💸'
);

-- Table: orders
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    order_number INTEGER NOT NULL,
    customer_name TEXT NOT NULL DEFAULT 'Customer',
    service_type TEXT NOT NULL DEFAULT 'dine-in',
    table_name TEXT,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    amount_tendered NUMERIC(12, 2) NOT NULL DEFAULT 0,
    change NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    cashier_name TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1
);

-- Table: store_status
CREATE TABLE store_status (
    id TEXT PRIMARY KEY,
    is_open BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at TIMESTAMP WITH TIME ZONE,
    petty_cash NUMERIC(12, 2) DEFAULT 0
);

-- ------------------------------------------------------------
-- 3. INSERT SEED DATA
-- ------------------------------------------------------------

-- Seed Data: tables
INSERT INTO tables (id, name, capacity, is_vip) VALUES
('table-1', 'Meja 1', 2, FALSE),
('table-2', 'Meja 2', 4, FALSE),
('table-3', 'Meja 3', 6, FALSE),
('table-4', 'Meja 4', 2, FALSE),
('table-5', 'Meja 5', 2, FALSE),
('table-6', 'Meja 6', 4, FALSE),
('table-7', 'Meja 7', 4, FALSE),
('table-8', 'Meja 8', 6, FALSE),
('table-9', 'Meja 9', 2, FALSE),
('table-10', 'Meja 10', 2, FALSE),
('vip-1', 'VIP 1', 8, TRUE),
('vip-2', 'VIP 2', 10, TRUE);

-- Seed Data: menu_items
INSERT INTO menu_items (id, name, category, price, emoji, description, stock, available, badge_color) VALUES
-- ORIGINAL
('item-1', 'Original Satuan', 'Original', 3000.00, '🥟', 'Dimsum original satuan.', 100, TRUE, 'yellow'),
('item-1a', 'Original Isi (4)', 'Original', 12000.00, '🥟', 'Paket isi 4 pcs dimsum original.', 50, TRUE, 'yellow'),
('item-1b', 'Original Isi (6)', 'Original', 18000.00, '🥟', 'Paket isi 6 pcs dimsum original.', 50, TRUE, 'pink'),
('item-2', 'Original Isi (8)', 'Original', 24000.00, '🥟', 'Paket isi 8 pcs dimsum original.', 35, TRUE, 'pink'),

-- MENTAI
('mentai-1', 'Mentai Satuan', 'Mentai', 5000.00, '🔥', 'Dimsum mentai satuan.', 100, TRUE, 'red'),
('mentai-4', 'Mentai Isi (4)', 'Mentai', 20000.00, '🔥', 'Paket isi 4 pcs dimsum mentai.', 50, TRUE, 'red'),
('mentai-6', 'Mentai Isi (6)', 'Mentai', 28000.00, '🔥', 'Paket isi 6 pcs dimsum mentai.', 50, TRUE, 'pink'),
('mentai-8', 'Mentai Isi (8)', 'Mentai', 36000.00, '🔥', 'Paket isi 8 pcs dimsum mentai.', 30, TRUE, 'pink'),

-- TARTAR
('tartar-1', 'Tartar Satuan', 'Tartar', 5000.00, '🍋', 'Dimsum saus tartar satuan.', 100, TRUE, 'yellow'),
('tartar-4', 'Tartar Isi (4)', 'Tartar', 20000.00, '🍋', 'Paket isi 4 pcs dimsum tartar.', 50, TRUE, 'yellow'),
('tartar-6', 'Tartar Isi (6)', 'Tartar', 28000.00, '🍋', 'Paket isi 6 pcs dimsum tartar.', 50, TRUE, 'blue'),
('tartar-8', 'Tartar Isi (8)', 'Tartar', 36000.00, '🍋', 'Paket isi 8 pcs dimsum tartar.', 30, TRUE, 'blue'),

-- MIX SAUS
('mix-4', 'Mix Saus Isi (4)', 'Mix Saus', 20000.00, '🍱', 'Paket isi 4 pcs campur saus.', 50, TRUE, 'purple'),
('mix-6', 'Mix Saus Isi (6)', 'Mix Saus', 28000.00, '🍱', 'Paket isi 6 pcs campur saus.', 50, TRUE, 'purple'),
('mix-8', 'Mix Saus Isi (8)', 'Mix Saus', 35000.00, '🍱', 'Paket isi 8 pcs campur saus.', 30, TRUE, 'purple'),

-- GORENG
('goreng-1', 'Goreng Satuan', 'Goreng', 5000.00, '🥠', 'Dimsum goreng satuan.', 100, TRUE, 'yellow'),
('goreng-4', 'Goreng Isi (4)', 'Goreng', 20000.00, '🥠', 'Paket isi 4 pcs dimsum goreng.', 50, TRUE, 'yellow'),
('goreng-6', 'Goreng Isi (6)', 'Goreng', 30000.00, '🥠', 'Paket isi 6 pcs dimsum goreng.', 50, TRUE, 'pink'),
('goreng-8', 'Goreng Isi (8)', 'Goreng', 40000.00, '🥠', 'Paket isi 8 pcs dimsum goreng.', 30, TRUE, 'pink'),

-- FROZEN
('frozen-over30', 'Satuan diatas (30)', 'Frozen', 2500.00, '❄️', 'Frozen dimsum satuan pembelian di atas 30 pcs.', 200, TRUE, 'blue'),
('frozen-under30', 'Satuan dibawah (30)', 'Frozen', 3000.00, '❄️', 'Frozen dimsum satuan pembelian di bawah 30 pcs.', 100, TRUE, 'blue'),

-- MINUMAN
('minuman-1', 'Es Teh Manis', 'Minuman', 5000.00, '🧋', 'Teh melati seduh segar dengan es batu.', 100, TRUE, 'yellow'),
('minuman-2', 'Es Kopi Susu', 'Minuman', 12000.00, '☕', 'Kopi robusta dicampur susu segar dan gula aren.', 80, TRUE, 'yellow'),
('minuman-3', 'Es Jeruk', 'Minuman', 6000.00, '🍊', 'Jeruk segar diperas langsung dengan es.', 60, TRUE, 'yellow');

-- Seed Data: staff
INSERT INTO staff (id, name, role, pin, active, initials) VALUES
('staff-1', 'Rizal', 'Owner', '1110', TRUE, 'RZ'),
('staff-2', 'Yanuar', 'Owner', '0000', TRUE, 'YN'),
('staff-3', 'Genta', 'Cashier', '0000', TRUE, 'GT'),
('staff-4', 'Fathur', 'Kitchen', '0000', FALSE, 'FT');

-- Seed Data: store_status
INSERT INTO store_status (id, is_open, opened_at, petty_cash) VALUES
('main', FALSE, NULL, 0)
ON CONFLICT (id) DO NOTHING;
