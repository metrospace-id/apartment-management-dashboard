import React from 'react'

export interface BadgeProps extends React.InputHTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'default'
}

function Badge({
  variant = 'default', children, className, ...props
}: BadgeProps) {
  let backgroundColorClass = 'bg-sky-700 text-white disabled:hover:opacity-50'
  if (variant === 'secondary') {
    backgroundColorClass = 'bg-transparent border text-sky-700 disabled:hover:opacity-50'
  } else if (variant === 'success') {
    backgroundColorClass = 'bg-green-500 text-white disabled:hover:opacity-50'
  } else if (variant === 'info') {
    backgroundColorClass = 'bg-blue-500 text-white disabled:hover:opacity-50'
  } else if (variant === 'warning') {
    backgroundColorClass = 'bg-yellow-500 text-white disabled:hover:opacity-50'
  } else if (variant === 'danger') {
    backgroundColorClass = 'bg-red-500 text-white disabled:hover:opacity-50'
  } else if (variant === 'default') {
    backgroundColorClass = 'bg-slate-500 text-white disabled:hover:opacity-50'
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <span {...props} className={`text-[10px] font-medium py-1 px-2 rounded ${backgroundColorClass} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
