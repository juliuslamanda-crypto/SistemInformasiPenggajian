-- Migrasi: tambah kolom untuk fitur potongan denda alpa dan telat
ALTER TABLE penggajian
ADD COLUMN hari_alpa INTEGER DEFAULT 0,
ADD COLUMN hari_telat INTEGER DEFAULT 0,
ADD COLUMN denda_absensi NUMERIC DEFAULT 0;