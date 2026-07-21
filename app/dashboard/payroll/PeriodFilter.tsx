'use client'

type Option = { value: string; label: string }

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
      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
} 