import { describe, it, expect } from 'vitest'
import {
  formatRupiah,
  formatPeriod,
  hitungStatistik,
  getPeriodOptions,
  type PayrollRecord,
} from './payrollHelper'

describe('formatRupiah', () => {
  it('mengubah angka jadi format Rupiah dengan pemisah ribuan', () => {
    // Toleran terhadap spasi non-breaking yang kadang dihasilkan Intl.NumberFormat
    expect(formatRupiah(5000000)).toMatch(/^Rp\s?5\.000\.000$/)
  })

  it('menangani angka nol dengan benar', () => {
    expect(formatRupiah(0)).toMatch(/^Rp\s?0$/)
  })

  it('tidak menampilkan desimal (minimumFractionDigits: 0)', () => {
    expect(formatRupiah(1500000)).not.toContain(',')
  })
})

describe('formatPeriod', () => {
  it('mengubah bulan dan tahun jadi nama bulan Indonesia', () => {
    expect(formatPeriod(7, 2025)).toBe('Juli 2025')
  })

  it('menangani bulan Januari (index 0) dengan benar', () => {
    expect(formatPeriod(1, 2025)).toBe('Januari 2025')
  })

  it('menangani bulan Desember dengan benar', () => {
    expect(formatPeriod(12, 2026)).toBe('Desember 2026')
  })
})

describe('hitungStatistik', () => {
  it('mengembalikan nilai nol semua jika data kosong', () => {
    const result = hitungStatistik([])
    expect(result).toEqual({
      totalGajiKotor: 0,
      totalPotongan: 0,
      totalGajiBersih: 0,
      rataRataGajiBersih: 0,
      jumlahKaryawan: 0,
    })
  })

  it('menghitung total dan rata-rata dengan benar untuk beberapa record', () => {
    const dummyData: Partial<PayrollRecord>[] = [
      { gaji_kotor: 6000000, total_potongan: 400000, gaji_bersih: 5600000 },
      { gaji_kotor: 8000000, total_potongan: 600000, gaji_bersih: 7400000 },
    ]

    const result = hitungStatistik(dummyData as PayrollRecord[])

    expect(result.totalGajiKotor).toBe(14000000)
    expect(result.totalPotongan).toBe(1000000)
    expect(result.totalGajiBersih).toBe(13000000)
    expect(result.rataRataGajiBersih).toBe(6500000)
    expect(result.jumlahKaryawan).toBe(2)
  })

  it('menangani nilai berupa string angka (konversi Number)', () => {
    // mensimulasikan data dari database yang kadang bertipe string
    const dummyData = [
      { gaji_kotor: '5000000', total_potongan: '300000', gaji_bersih: '4700000' },
    ]

    const result = hitungStatistik(dummyData as unknown as PayrollRecord[])

    expect(result.totalGajiKotor).toBe(5000000)
  })
})

describe('getPeriodOptions', () => {
  it('menghasilkan 18 periode (Januari 2025 - Juni 2026)', () => {
    const options = getPeriodOptions()
    expect(options).toHaveLength(18)
  })

  it('periode pertama adalah Januari 2025', () => {
    const options = getPeriodOptions()
    expect(options[0]).toEqual({
      bulan: 1,
      tahun: 2025,
      label: 'Januari 2025',
      value: '1-2025',
    })
  })

  it('periode terakhir adalah Juni 2026', () => {
    const options = getPeriodOptions()
    const last = options[options.length - 1]
    expect(last).toEqual({
      bulan: 6,
      tahun: 2026,
      label: 'Juni 2026',
      value: '6-2026',
    })
  })

  it('setiap value mengikuti format "bulan-tahun"', () => {
    const options = getPeriodOptions()
    options.forEach(opt => {
      expect(opt.value).toBe(`${opt.bulan}-${opt.tahun}`)
    })
  })
})