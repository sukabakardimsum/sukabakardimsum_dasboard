-- ============================================================
-- FIX RLS (ROW LEVEL SECURITY) - SUKA BAKAR DIMSUM POS
-- Jalankan ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- OPSI A (DIREKOMENDASIKAN untuk POS internal):
-- Nonaktifkan RLS pada semua tabel agar anon key bisa baca + tulis
-- Aman karena akses diproteksi lewat login PIN di aplikasi

ALTER TABLE tables       DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items   DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff        DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses     DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders       DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_status DISABLE ROW LEVEL SECURITY;

-- Grant semua permission ke anon dan authenticated role
GRANT ALL ON TABLE tables       TO anon, authenticated;
GRANT ALL ON TABLE menu_items   TO anon, authenticated;
GRANT ALL ON TABLE staff        TO anon, authenticated;
GRANT ALL ON TABLE expenses     TO anon, authenticated;
GRANT ALL ON TABLE orders       TO anon, authenticated;
GRANT ALL ON TABLE order_items  TO anon, authenticated;
GRANT ALL ON TABLE store_status TO anon, authenticated;

-- Grant usage pada sequences (untuk UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================
-- VERIFIKASI: Jalankan query ini untuk cek apakah fix berhasil
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
-- Semua kolom "rowsecurity" harus bernilai "f" (false = disabled)
