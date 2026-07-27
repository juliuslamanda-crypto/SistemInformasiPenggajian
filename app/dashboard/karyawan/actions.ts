'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Server Action untuk menambahkan karyawan baru ke database.
 * Dipanggil dari KaryawanForm.tsx (mode tambah) saat admin submit form.
 *
 * employee_id digenerate otomatis (5 digit acak) agar admin tidak perlu mengisi manual
 * 
 * @param formData - Data dari form HTML, berisi:
 *   nama, gender, jabatan_id, departemen_id (required)
 *   age, tenure_months (optional, boleh kosong boleh diisi)
 * @returns Object {error} jika validasi/insert gagal,
 *          atau Object {success: true} jika berhasil disimpan
 */
export async function tambahKaryawan(formData: FormData) {
  const supabase = await createClient()

  const nama           = formData.get('nama') as string
  const gender         = formData.get('gender') as string
  const age            = parseInt(formData.get('age') as string)
  const tenure_months  = parseInt(formData.get('tenure_months') as string)
  const jabatan_id     = formData.get('jabatan_id') as string
  const departemen_id  = formData.get('departemen_id') as string

  // Semua field wajib diisi sebelum data bisa disimpan
  if (!nama || !gender || !jabatan_id || !departemen_id) {
    return { error: 'Nama, gender, jabatan, dan departemen wajib diisi.' }
  }

  // Generate employee_id dan email otomatis supaya tidak perlu diisi manual
  const employee_id = String(Math.floor(10000 + Math.random() * 90000))
  const email = `${nama.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}.${Date.now()}@abc.com`

  const { error } = await supabase.from('karyawan').insert({
    employee_id,
    nama,
    gender,
    age: isNaN(age) ? null : age,
    tenure_months: isNaN(tenure_months) ? 0 : tenure_months,
    jabatan_id,
    departemen_id,
    status: 'aktif',
  })

  if (error) return { error: `Gagal menambah karyawan: ${error.message}` }

  // Refresh halaman setelah data berhasil ditambah
  revalidatePath('/dashboard/karyawan')
  return { success: true }
}

/**
 * Server Action untuk memperbarui data karyawan yang sudah ada.
 * Dipanggil dari KaryawanForm.tsx (mode edit) saat admin submit perubahan.
 *
 * Berbeda dari tambahKaryawan(), function ini butuh `id` (UUID) untuk
 * menentukan baris mana yang di-update, dan tidak mengubah employee_id.
 *
 * @param formData - Data dari form HTML,berisi:
 *   id (UUID karyawan yang diedit), nama, gender, jabatan_id, departemen_id
 *   age, tenure_months (optional)
 * @returns Object {error} jika validasi/update gagal,
 *          atau Object {success: true} jika berhasil disimpan
 */
export async function editKaryawan(formData: FormData) {
  const supabase = await createClient()

  const id            = formData.get('id') as string
  const nama          = formData.get('nama') as string
  const gender        = formData.get('gender') as string
  const age           = parseInt(formData.get('age') as string)
  const tenure_months = parseInt(formData.get('tenure_months') as string)
  const jabatan_id    = formData.get('jabatan_id') as string
  const departemen_id = formData.get('departemen_id') as string

  if (!id || !nama || !gender || !jabatan_id || !departemen_id) {
    return { error: 'Semua field wajib diisi.' }
  }

  const { error } = await supabase
    .from('karyawan')
    .update({
      nama,
      gender,
      age: isNaN(age) ? null : age,
      tenure_months: isNaN(tenure_months) ? 0 : tenure_months,
      jabatan_id,
      departemen_id,
    })
    .eq('id', id) // Update hanya baris dengan id yang cocok

  if (error) return { error: `Gagal mengupdate karyawan: ${error.message}` }

  revalidatePath('/dashboard/karyawan')
  return { success: true }
}

/**
 * Server Action untuk menghapus karyawan dari database secara permanen. Dipanggil dari KaryawanTable.tsx setelah admin mengonfirmasi dialog hapus.
 *
 * skema database menerapkan ON DELETE CASCADE pada foreign key
 * penggajian_karyawan_id_fkey (tabel penggajian -> karyawan).
 * 
 * @param id - UUID karyawan yang akan dihapus (bukan employee_id 5 digit)
 * @returns Object {error} jika delete gagal,
 *          atau Object {success: true} jika berhasil dihapus
 */
export async function hapusKaryawan(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('karyawan')
    .delete()
    .eq('id', id)

  if (error) return { error: `Gagal menghapus karyawan: ${error.message}` }

  revalidatePath('/dashboard/karyawan')
  return { success: true }
}