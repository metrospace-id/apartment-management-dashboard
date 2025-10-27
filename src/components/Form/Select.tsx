import React from 'react'

export interface OptionProps {
  label: string
  value?: string | number
  disabled?: boolean
}

export interface SelectProps
  extends React.InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  fullWidth?: boolean
  helperText?: string
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  options: OptionProps[]
}

const Select = ({
  label,
  fullWidth,
  helperText,
  error,
  rightIcon,
  leftIcon,
  className,
  options,
  readOnly,
  disabled,
  ...props
}: SelectProps) => (
  <div className={`w-full text-left ${className}`}>
    {label && (
      <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
    )}
    <div
      className={`${fullWidth ? 'w-full' : 'max-w-[300px]'} outline-blue-400 ${error ? 'outline outline-red-500' : ''} h-[42px] flex items-center gap-2 border border-slate-200 rounded px-4 py-2 has-[:focus]:outline bg-white dark:bg-slate-800 dark:border-slate-800`}
    >
      {leftIcon}
      <select
        {...props}
        disabled={readOnly || disabled}
        className="flex-1 outline-none text-slate-600 bg-white dark:bg-slate-800 dark:placeholder:text-slate-200 dark:text-white"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {rightIcon}
    </div>
    {helperText && (
      <p
        className={`text-xs font-medium ${error ? 'text-red-500' : 'text-slate-500'} mt-1`}
      >
        {helperText}
      </p>
    )}
  </div>
)

export default Select
