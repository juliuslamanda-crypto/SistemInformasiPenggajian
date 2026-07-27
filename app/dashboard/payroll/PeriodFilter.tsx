'use client'

type Option = {
  value: string
  label: string
}

export default function PeriodFilter({
  options,
  selected,
}: {
  options: Option[]
  selected: string
}) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    window.location.href = `/dashboard/payroll?period=${e.target.value}`
  }

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}