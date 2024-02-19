import React from 'react'

export interface ButtonProps extends React.InputHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  type?: 'button' | 'submit' | 'reset'
}

function Button({
  variant = 'primary', children, type = 'button', disabled, ...props
}: ButtonProps) {
  let backgroundColorClass = 'bg-sky-700 text-white hover:opacity-80 disabled:hover:opacity-50'
  if (variant === 'secondary') {
    backgroundColorClass = 'bg-transparent border border-sky-700 text-sky-700 hover:opacity-80 disabled:hover:opacity-50'
  } else if (variant === 'tertiary') {
    backgroundColorClass = 'bg-red-500 text-white hover:opacity-80 disabled:hover:opacity-50'
  }

  let activeClass = 'cursor-pointer'
  if (disabled) {
    activeClass = 'cursor-not-allowed opacity-50'
  }
  return (
    // eslint-disable-next-line react/button-has-type
    <button {...props} type={type} className={`text-sm font-medium p-2 rounded ${backgroundColorClass} ${activeClass}`} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
