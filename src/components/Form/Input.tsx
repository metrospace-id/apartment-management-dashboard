import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  fullWidth?: boolean
  helperText?: string
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  InputRef?: any
}

function Input({
  label, fullWidth, helperText, error, rightIcon, leftIcon, className, disabled, InputRef, ...props
}: InputProps) {
  return (
    <div className={`w-full text-left ${disabled ? 'opacity-70' : ''} ${className}`}>
      {label && <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>}
      <div className={`${fullWidth ? 'w-full' : 'max-w-[300px]'} outline-blue-400 ${error ? 'outline outline-red-500' : ''} h-[42px] flex items-center gap-2 border border-slate-200 rounded px-4 py-2 has-[:focus]:outline has-[:read-only]:!outline-none bg-white dark:bg-slate-800 dark:border-slate-800`}>
        {leftIcon}
        <input {...props} disabled={disabled} className="flex-1 outline-none text-slate-600 bg-white dark:bg-slate-800 dark:placeholder:text-slate-200 dark:text-white disabled:cursor-not-allowed" ref={InputRef} />
        {rightIcon}
      </div>
      {helperText && (
        <p className={`text-xs font-medium ${error ? 'text-red-500' : 'text-slate-500'} mt-1`}>{helperText}</p>
      )}
    </div>
  )
}

export default Input
