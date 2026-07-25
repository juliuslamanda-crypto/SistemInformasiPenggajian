// app/dashboard/karyawan/actions.ts
// Semua operasi database untuk tabel karyawan diletakkan di sini.
// Dengan 'use server', kode ini hanya jalan di server — aman dari browser.
'use server'

import { supabase } from '@/lib/supabaseClient'
import { revalidatePath } from 'next/cache'

// Tambah karyawan baru ke database
export async function tambahKaryawan(formData: FormData) {
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
  const employee_id = `EMP-${Date.now()}`
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

// Update data karyawan yang sudah ada
export async function editKaryawan(formData: FormData) {
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

// Hapus karyawan dari database berdasarkan UUID
export async function hapusKaryawan(id: string) {
  const { error } = await supabase
    .from('karyawan')
    .delete()
    .eq('id', id)

  if (error) return { error: `Gagal menghapus karyawan: ${error.message}` }

  revalidatePath('/dashboard/karyawan')
  return { success: true }
}