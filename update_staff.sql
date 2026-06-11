-- ============================================================
-- UPDATE STAFF TABLE - pastikan initials & data login lengkap
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Hapus dan insert ulang semua staff dengan data lengkap
DELETE FROM staff;

INSERT INTO staff (id, name, role, pin, active, initials) VALUES
('staff-1', 'Rizal',  'Owner',   '1110', TRUE,  'RZ'),
('staff-2', 'Yanuar', 'Owner',   '0000', TRUE,  'YN'),
('staff-3', 'Tania',  'Owner',   '0000', TRUE,  'TN'),
('staff-4', 'Fathur', 'Kitchen', '0000', FALSE, 'FT'),
('staff-5', 'Omo',    'Manager', '0000', FALSE, 'OM');

-- Verifikasi
SELECT id, name, role, pin, active, initials FROM staff ORDER BY id;
