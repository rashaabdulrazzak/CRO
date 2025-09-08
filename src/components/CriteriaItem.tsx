interface CriteriaItemProps {
  label: string
  value: boolean | null
  onChange: (value: boolean) => void
}

export function CriteriaItem({ label, value, onChange }: CriteriaItemProps) {
  const id = label.replace(/\s+/g, "-").toLowerCase()
  return (
    <div className="rounded-lg p-4 border border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 flex-1">{label}</label>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`${id}-yes`}
              name={id}
              checked={value === true}
              onChange={() => onChange(true)}
              className="w-4 h-4"
            />
            <label htmlFor={`${id}-yes`} className="text-sm">Evet</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`${id}-no`}
              name={id}
              checked={value === false}
              onChange={() => onChange(false)}
              className="w-4 h-4"
            />
            <label htmlFor={`${id}-no`} className="text-sm">Hayır</label>
          </div>
        </div>
      </div>
    </div>
  )
}
