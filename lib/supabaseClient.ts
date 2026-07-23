// lib/supabaseClient.ts
// ============================================
// SUPABASE CLIENT — Konfigurasi koneksi database
// File ini diimpor oleh semua halaman yang butuh akses database
// ============================================

// Impor fungsi createClient dari package Supabase JS SDK
// Fungsi ini digunakan untuk membuat instance koneksi ke Supabase
import { createClient } from '@supabase/supabase-js';

// Ambil URL project Supabase dari environment variables (.env.local)
// NEXT_PUBLIC_ berarti variabel ini bisa diakses dari sisi browser maupun server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Ambil anonymous key dari environment variables (.env.local)
// Key ini digunakan untuk autentikasi request ke Supabase
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validasi — pastikan kedua variabel tidak kosong sebelum membuat koneksi
// Jika salah satu kosong, lempar error dengan pesan yang jelas
// Ini mencegah aplikasi crash dengan pesan error yang membingungkan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

// Buat instance koneksi Supabase menggunakan URL dan key yang sudah diambil
// Ekspor agar bisa diimpor dan dipakai di file lain dengan:
// import { supabase } from '@/lib/supabaseClient'
export const supabase = createClient(supabaseUrl, supabaseAnonKey);