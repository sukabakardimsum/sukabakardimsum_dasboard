-- ============================================================
-- UPDATE MENU ITEMS - SUKA BAKAR DIMSUM POS
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- Updated: 2026-06-11
-- ============================================================

-- Hapus semua menu lama
TRUNCATE TABLE order_items CASCADE;
DELETE FROM menu_items;

-- Insert menu baru
INSERT INTO menu_items (id, name, category, price, emoji, description, stock, available, badge_color) VALUES

-- BAKAR
('bakar-ori-4',    'Bakar Ori (4)',    'Bakar', 20000, '🔥', 'Dimsum bakar original isi 4 pcs.',    50,  TRUE, 'red'),
('bakar-kremes-4', 'Bakar Kremes (4)', 'Bakar', 22000, '🔥', 'Dimsum bakar kremes isi 4 pcs.',       50,  TRUE, 'red'),
('bakar-chese-4',  'Bakar Chese (4)',  'Bakar', 25000, '🔥', 'Dimsum bakar keju isi 4 pcs.',         50,  TRUE, 'yellow'),

-- GORENG
('goreng-4',        'Goreng (4)',        'Goreng', 20000, '🥠', 'Dimsum goreng isi 4 pcs.',        50,  TRUE, 'yellow'),
('goreng-mentai-4', 'Goreng Mentai (4)', 'Goreng', 26000, '🥠', 'Dimsum goreng mentai isi 4 pcs.', 50,  TRUE, 'red'),

-- ORIGINAL
('ori-4',  'Original (4)',  'Original', 15000, '🥟', 'Dimsum original isi 4 pcs.',  50, TRUE, 'yellow'),
('ori-6',  'Original (6)',  'Original', 22000, '🥟', 'Dimsum original isi 6 pcs.',  50, TRUE, 'yellow'),
('ori-8',  'Original (8)',  'Original', 28000, '🥟', 'Dimsum original isi 8 pcs.',  35, TRUE, 'pink'),
('ori-16', 'Original (16)', 'Original', 56000, '🥟', 'Dimsum original isi 16 pcs.', 20, TRUE, 'pink'),

-- MENTAI
('mentai-4',  'Mentai (4)',  'Mentai', 22000, '🔥', 'Dimsum mentai isi 4 pcs.',  50, TRUE, 'red'),
('mentai-6',  'Mentai (6)',  'Mentai', 30000, '🔥', 'Dimsum mentai isi 6 pcs.',  50, TRUE, 'red'),
('mentai-8',  'Mentai (8)',  'Mentai', 40000, '🔥', 'Dimsum mentai isi 8 pcs.',  30, TRUE, 'pink'),
('mentai-16', 'Mentai (16)', 'Mentai', 90000, '🔥', 'Dimsum mentai isi 16 pcs.', 15, TRUE, 'pink'),

-- TARTAR
('tartar-4',  'Tartar (4)',  'Tartar', 22000, '🍋', 'Dimsum tartar isi 4 pcs.',  50, TRUE, 'yellow'),
('tartar-6',  'Tartar (6)',  'Tartar', 30000, '🍋', 'Dimsum tartar isi 6 pcs.',  50, TRUE, 'yellow'),
('tartar-8',  'Tartar (8)',  'Tartar', 40000, '🍋', 'Dimsum tartar isi 8 pcs.',  30, TRUE, 'blue'),
('tartar-16', 'Tartar (16)', 'Tartar', 90000, '🍋', 'Dimsum tartar isi 16 pcs.', 15, TRUE, 'blue'),

-- MIX SAUS
('mix-4',  'Mix Saus (4)',  'Mix Saus', 22000, '🍱', 'Mix saus isi 4 pcs.',  50, TRUE, 'purple'),
('mix-6',  'Mix Saus (6)',  'Mix Saus', 30000, '🍱', 'Mix saus isi 6 pcs.',  50, TRUE, 'purple'),
('mix-8',  'Mix Saus (8)',  'Mix Saus', 40000, '🍱', 'Mix saus isi 8 pcs.',  30, TRUE, 'purple'),
('mix-16', 'Mix Saus (16)', 'Mix Saus', 90000, '🍱', 'Mix saus isi 16 pcs.', 15, TRUE, 'purple'),

-- ADDS ON
('addon-chese',    'Chese',      'Adds On', 5000, '🧀', 'Tambahan keju.',     100, TRUE, 'yellow'),
('addon-chilioil', 'Chili Oil',  'Adds On', 3000, '🌶️', 'Tambahan chili oil.', 100, TRUE, 'red'),
('addon-air',      'Air Mineral', 'Adds On', 5000, '💧', 'Air mineral botol.', 100, TRUE, 'blue');

-- Verifikasi
SELECT category, name, price FROM menu_items ORDER BY category, price;
