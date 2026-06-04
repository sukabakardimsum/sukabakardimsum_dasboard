# 🚀 Panduan Setup Supabase + Vercel

## 📋 Langkah-Langkah Setup

### 1️⃣ **Persiapan Supabase Keys**

Anda sudah memiliki keys dari file `.env`:

```env
VITE_SUPABASE_URL=https://uapefmshmofglbidikbc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_btlBprDJg2MfS8p4ivVCkg_FvDi7fHj
```

### 2️⃣ **Setup Project di Vercel**

#### A. Jika belum punya akun Vercel:
- 📍 Buka https://vercel.com
- 🔐 Login dengan GitHub akun `sukabakardimsum`
- ✅ Authorize Vercel untuk akses repository GitHub

#### B. Buat Project Baru:
1. Klik **"New Project"**
2. Cari repository: `sukabakardimsum/sukabakardimsum_dasboard`
3. Klik **"Import"**
4. Konfigurasi Project:
   - **Project Name**: `sukabakardimsum` (atau nama pilihan Anda)
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

### 3️⃣ **Add Environment Variables di Vercel**

Setelah mengklik Import, Anda akan melihat halaman "Environment Variables":

#### Tambahkan 2 variabel berikut:

**Variable 1:**
```
NAME: VITE_SUPABASE_URL
VALUE: https://uapefmshmofglbidikbc.supabase.co
```

**Variable 2:**
```
NAME: VITE_SUPABASE_ANON_KEY
VALUE: sb_publishable_btlBprDJg2MfS8p4ivVCkg_FvDi7fHj
```

✅ Klik **"Add"** untuk setiap variable

### 4️⃣ **Deploy**

1. Klik tombol **"Deploy"** besar di bawah
2. Tunggu proses deployment selesai (biasanya 2-5 menit)
3. Setelah selesai, Anda akan mendapat URL seperti:
   ```
   https://sukabakardimsum.vercel.app
   ```

### 5️⃣ **Verifikasi Deployment**

- Buka URL yang diberikan Vercel
- Login dengan credentials test:
  - **Username**: `owner`
  - **Password**: `yanu`
- Cek apakah database terhubung dengan baik

---

## ⚙️ Konfigurasi Lanjutan (Opsional)

### Production Deployment

Jika ingin menggunakan Supabase production (bukan test):

1. Buat project baru di Supabase atau gunakan yang sudah ada
2. Pergi ke **Settings → API** di Supabase dashboard
3. Copy:
   - **Project URL** → ke `VITE_SUPABASE_URL`
   - **anon public key** → ke `VITE_SUPABASE_ANON_KEY`
4. Update environment variables di Vercel:
   - Pergi ke Project Settings → Environment Variables
   - Edit kedua variables dengan values baru

### Custom Domain (Opsional)

Jika ingin menggunakan domain custom:

1. Di Vercel Project, pergi ke **Settings → Domains**
2. Klik **"Add Domain"**
3. Masukkan domain Anda (contoh: `pos.sukabakardimsum.com`)
4. Follow instruksi DNS yang diberikan Vercel
5. DNS biasanya propagate dalam 5-48 jam

---

## 🔑 Environment Variables Reference

| Variable | Deskripsi | Nilai |
|----------|-----------|-------|
| `VITE_SUPABASE_URL` | URL Project Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon Public Key | JWT Token dari Supabase |

**Catatan**: Variabel dengan prefix `VITE_` akan terekspos ke client-side (browser). Ini adalah intended behavior karena kita menggunakan `anon_key` yang aman.

---

## ✅ Checklist Sebelum Deploy

- [ ] Repository sudah di GitHub
- [ ] File `.env.example` sudah ada
- [ ] `.env` sudah di-gitignore (PENTING!)
- [ ] Supabase project sudah siap
- [ ] Database schema sudah dibuat (gunakan SQL Editor)
- [ ] Vercel account sudah terhubung dengan GitHub
- [ ] Environment variables sudah ditambahkan di Vercel

---

## 🆘 Troubleshooting

### Build Error: "VITE_SUPABASE_URL is not defined"
**Solusi**: 
- Pastikan environment variables sudah ditambahkan di Vercel
- Klik **"Deployments"** → Edit yang latest → lihat logs
- Redeploy setelah menambahkan variables

### Database Connection Error
**Solusi**:
- Verify Supabase URL dan Key sudah benar
- Cek Supabase project status di dashboard
- Pastikan database sudah dibuat (run SQL setup)

### CORS Error di Browser
**Solusi**:
- Supabase sudah handle CORS untuk domain Vercel
- Jika masih error, cek Supabase settings untuk allow origins

---

## 📚 Referensi

- **Vercel Docs**: https://vercel.com/docs
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-modes.html
- **Supabase Docs**: https://supabase.com/docs
- **Repository**: https://github.com/sukabakardimsum/sukabakardimsum_dasboard

---

Selamat deploy! 🎉
