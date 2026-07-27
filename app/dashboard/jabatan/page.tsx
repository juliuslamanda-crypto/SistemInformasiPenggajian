// app/dashboard/jabatan/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function JabatanPage() {
  const supabase = await createClient()

  const { data: jabatanList, error } = await supabase
    .from('jabatan')
    .select(`*, karyawan (id)`)
    .order('nama')

  const jabatanTerpakai = jabatanList?.filter(j => j.karyawan?.length > 0)

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-10">
        <div className="bg-white border border-deduction/30 p-6 text-deduction text-sm">
          Error: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen">
      <div className="bg-white border border-border-hairline p-8">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-sm font-medium tracking-wide text-foreground">Jabatan</p>
          </div>
          <h1 className="font-display text-xl text-foreground/80">
            {jabatanTerpakai?.length ?? 0} jabatan terdaftar
          </h1>
        </div>

        <div className="border-t border-border-strong">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-hairline">
                <th className="py-3 text-xs font-medium text-muted">Nama jabatan</th>
                <th className="py-3 text-xs font-medium text-muted text-right">Jumlah karyawan</th>
              </tr>
            </thead>
            <tbody>
              {jabatanTerpakai?.map((j) => (
                <tr key={j.id} className="border-b border-border-hairline hover:bg-background transition-colors">
                  <td className="py-3 text-foreground">{j.nama}</td>
                  <td className="py-3 text-right">
                    <span className="font-mono text-xs text-accent">
                      {j.karyawan?.length ?? 0} karyawan
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}