import React from 'react'

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

function Toggle({ label, disabled, ...props }: ToggleProps) {
  return (
    <label className={`inline-flex items-center w-fit ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div>
        <input type="checkbox" className="sr-only peer" disabled={disabled} {...props} />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 dark:peer-focus:ring-blue-800 rounded-xl peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
      </div>
      {label && (
        <span className="ms-3 text-sm font-medium text-slate-600 dark:text-white">{label}</span>
      )}
    </label>
  )
}

export default Toggle
