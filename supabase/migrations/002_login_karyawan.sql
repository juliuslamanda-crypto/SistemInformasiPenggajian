-- Migrasi: Fitur login karyawan (self-service portal + cetak slip gaji mandiri)

-- 1. Tambah kolom penghubung akun karyawan
ALTER TABLE karyawan
ADD COLUMN email TEXT UNIQUE,
ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id);

-- 2. Function pengecekan role: true jika user yang login adalah karyawan (bukan admin)
CREATE OR REPLACE FUNCTION is_karyawan()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM karyawan WHERE user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. RLS Policy: karyawan hanya bisa melihat data gajinya sendiri
CREATE POLICY "karyawan_lihat_gaji_sendiri" ON penggajian
FOR SELECT
USING (
  NOT is_karyawan()
  OR karyawan_id = (SELECT id FROM karyawan WHERE user_id = auth.uid())
);

-- 4. RLS Policy: karyawan tidak boleh insert/update/delete data gaji sama sekali
CREATE POLICY "karyawan_tidak_boleh_ubah_gaji" ON penggajian
FOR ALL
USING (NOT is_karyawan())
WITH CHECK (NOT is_karyawan());

-- 5. Trigger cadangan: otomatis menyambungkan user baru ke data karyawan
-- berdasarkan kecocokan email (dilengkapi exception handler agar tidak
-- menggagalkan proses signup jika terjadi error saat linking).
-- Catatan: linking utama dilakukan secara eksplisit di kode aplikasi
-- (app/(auth)/Daftar/page.tsx) setelah signUp() berhasil, karena lebih
-- reliable dibanding mengandalkan trigger ini saja.
CREATE OR REPLACE FUNCTION link_karyawan_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    UPDATE karyawan
    SET user_id = NEW.id
    WHERE email = NEW.email AND user_id IS NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Gagal menyambungkan user ke karyawan: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION link_karyawan_user();