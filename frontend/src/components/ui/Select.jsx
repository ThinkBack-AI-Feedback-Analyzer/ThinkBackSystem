import * as RadixSelect from '@radix-ui/react-select'
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa'

/**
 * options: string[] | { value, label }[]
 */
export function Select({ id, name, value, onChange, placeholder = 'Select…', options = [], disabled = false }) {
  const normalised = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )

  const handleChange = (val) => {
    onChange({ target: { name, value: val } })
  }

  return (
    <RadixSelect.Root value={value || ''} onValueChange={handleChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        className={[
          'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm outline-none transition',
          'data-[placeholder]:text-slate-400',
          disabled
            ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-default'
            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
        ].join(' ')}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <FaChevronDown className="text-xs text-slate-400" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-[9999] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-slate-400">
            <FaChevronUp className="text-xs" />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="max-h-56 p-1">
            {normalised.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">No options available</div>
            ) : (
              normalised.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center justify-between rounded-lg px-4 py-2.5 text-sm text-slate-700 outline-none transition data-[highlighted]:bg-emerald-50 data-[highlighted]:text-emerald-800 data-[state=checked]:font-semibold data-[state=checked]:text-emerald-700"
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <FaCheck className="text-xs text-emerald-600" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))
            )}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-slate-400">
            <FaChevronDown className="text-xs" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
