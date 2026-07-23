// app/dashboard/payroll/actions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { revalidatePath } from 'next/cache'

export async function inputGaji(formData: FormData) {
  const karyawan_id = formData.get('karyawan_id') as string
  const pay_period  = formData.get('pay_period') as string
  const gross       = parseFloat(formData.get('gross') as string)
  const deduction   = parseFloat(formData.get('deduction') as string)
  const deduction_percentage = gross > 0 ? (deduction / gross) * 100 : 0
  const net_pay     = gross - deduction

  // Validasi
  if (!karyawan_id || !pay_period || isNaN(gross) || isNaN(deduction)) {
    return { error: 'Semua field harus diisi dengan benar.' }
  }

  if (gross <= 0) {
    return { error: 'Gross salary harus lebih dari 0.' }
  }

  if (deduction < 0) {
    return { error: 'Deduction tidak boleh negatif.' }
  }

  if (deduction > gross) {
    return { error: 'Deduction tidak boleh melebihi gross salary.' }
  }

  // Simpan ke database (upsert — update kalau sudah ada, insert kalau belum)
  const { error } = await supabase
    .from('penggajian')
    .upsert({
      karyawan_id,
      pay_period,
      gross,
      deduction,
      deduction_percentage: Math.round(deduction_percentage * 100) / 100,
      net_pay,
    }, {
      onConflict: 'karyawan_id,pay_period'
    })

  if (error) {
    return { error: `Gagal menyimpan: ${error.message}` }
  }

  revalidatePath('/dashboard/payroll')
  return { success: true, net_pay }
}