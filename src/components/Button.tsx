import React from 'react'

export interface ButtonProps extends Omit<React.InputHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'info' | 'warning' | 'danger' | 'default'
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md'
  icon?: boolean
}

function Button({
  variant = 'primary', children, type = 'button', disabled, size = 'md', className, icon, ...props
}: ButtonProps) {
  let backgroundColorClass = 'bg-sky-700 border border-sky-700 text-white hover:opacity-80 disabled:hover:opacity-50'
  if (variant === 'secondary') {
    backgroundColorClass = 'bg-transparent border border-sky-700 text-sky-700 hover:opacity-80 disabled:hover:opacity-50'
  } else if (variant === 'tertiary') {
    backgroundColorClass = 'bg-red-500 border border-red-500 text-white hover:opacity-80 disabled:hover:opacity-50'
  } else if (variant === 'success') {
    backgroundColorClass = 'bg-green-500 border border-green-500 text-white hover:opacity-80 disabled:hover:opacity-50 disabled:hover:opacity-50'
  } else if (variant === 'info') {
    backgroundColorClass = 'bg-blue-500 border border-blue-500 text-white hover:opacity-80 disabled:hover:opacity-50 disabled:hover:opacity-50'
  } else if (variant === 'warning') {
    backgroundColorClass = 'bg-yellow-500 border border-yellow-500 text-white hover:opacity-80 disabled:hover:opacity-50 disabled:hover:opacity-50'
  } else if (variant === 'danger') {
    backgroundColorClass = 'bg-red-500 border border-red-500 text-white hover:opacity-80 disabled:hover:opacity-50 disabled:hover:opacity-50'
  } else if (variant === 'default') {
    backgroundColorClass = 'bg-slate-500 border border-slate-500 text-white hover:opacity-80 disabled:hover:opacity-50 disabled:hover:opacity-50'
  }

  let activeClass = 'cursor-pointer'
  if (disabled) {
    activeClass = 'cursor-not-allowed opacity-50'
  }

  let widthClass = 'min-w-[120px]'
  if (icon) {
    widthClass = 'h-[42px]'
  }
  let sizeClass = 'p-2 h-[42px] text-sm'

  if (size === 'sm') {
    sizeClass = 'p-1 h-[38px] text-xs'
    widthClass = 'min-w-[100px]'
    if (icon) {
      widthClass = 'h-[38px]'
    }
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button {...props} type={type} className={`font-semibold p-2 rounded flex items-center justify-center gap-2 ${backgroundColorClass} ${activeClass} ${widthClass} ${sizeClass} ${className}`} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
