import React from 'react'
import { ChevronDown } from 'lucide-react'

function NativeSelect({ className = '', children, ...props }) {
  return (
    <div className={`relative w-fit has-[select:disabled]:opacity-50 ${className}`} data-slot="native-select-wrapper">
      <select
        data-slot="native-select"
        className={
          "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-gray-800 dark:hover:bg-gray-700 h-9 w-full min-w-0 appearance-none rounded-md border bg-white dark:bg-gray-800 px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed dark:text-white"
        }
        {...props}
      />
      <ChevronDown
        className="text-gray-400 pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-60 select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption(props) {
  return <option data-slot="native-select-option" {...props} />
}

export { NativeSelect, NativeSelectOption }
