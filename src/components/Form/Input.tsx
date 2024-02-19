import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  fullWidth?: boolean
  helperText?: string
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Input({
  label, fullWidth, helperText, error, rightIcon, leftIcon, ...props
}: InputProps) {
  return (
    <div className="w-full text-left">
      {label && <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>}
      <div className={`${fullWidth ? 'w-full' : ''} outline-blue-400 ${error ? 'outline outline-red-500' : ''} flex items-center gap-2 border rounded px-4 py-2 has-[:focus]:outline`}>
        {leftIcon}
        <input {...props} className={`${fullWidth ? 'w-full' : ''} min-w-[300px] outline-none`} />
        {rightIcon}
      </div>
      <p className={`text-xs font-medium ${error ? 'text-red-500' : 'text-slate-500'} mt-1`}>{helperText}</p>
    </div>
  )
}

export default Input
