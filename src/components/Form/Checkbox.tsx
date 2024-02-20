import {
  HTMLAttributes, ReactNode, useEffect, useState,
} from 'react'
import { Check as IconChcek, Minus as IconMinus } from '../Icons'

export interface CheckboxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id?: string;
  hint?: string;
  label?: string | ReactNode;
  error?: boolean;
  className?: string;
  iconCheckClassName?: string
  checkBoxClassName?: string
  labelClassName?: string;
  hintTextClassName?: string;
  value?: string | number
  disabled?: boolean
  checked?: boolean
  indeterminate?: boolean
  onClick?: () => void
}

function Checkbox({
  id,
  label,
  hint,
  error,
  className,
  iconCheckClassName,
  checkBoxClassName,
  labelClassName,
  hintTextClassName,
  disabled,
  checked = false,
  indeterminate = false,
  onClick,
  ...props
}: CheckboxProps) {
  const [isCheckced, setIsChecked] = useState(false)

  const checkedClass = disabled ? 'bg-neutral-200 hover:bg-neutral-200' : 'bg-primary-500 border-primary-500 hover:bg-primary-500'
  const disabledClass = 'bg-neutral-100 border-neutral-200 hover:border-neutral-200 hover:bg-neutral-100 cursor-not-allowed'

  const handleClickCheck = () => {
    if (!disabled) {
      onClick?.()
      setIsChecked((prevState) => !prevState)
    }
  }

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  return (
    <div id={`${id}-text-input`} className={className || ''}>
      <div className="relative flex gap-2">
        <div className="w-auto">
          <div
            {...props}
            id={id}
            role="presentation"
            onClick={handleClickCheck}
            className={`${disabled ? disabledClass : 'hover:bg-primary-50 border-neutral-300 hover:border-primary-500 cursor-pointer'} w-5 h-5 lg:w-6 lg:h-6 ${checkBoxClassName} border-[2px] rounded-md  active:outline-primary-100 active:outline-2 ${isCheckced ? checkedClass : ''} flex flex-col items-center justify-center`}
          >
            {isCheckced && !indeterminate && <IconChcek className={`text-base-white ${iconCheckClassName}`} />}
            {isCheckced && indeterminate && <IconMinus className={`text-base-white ${iconCheckClassName}`} />}
          </div>
        </div>
        {label && (
        <label
          htmlFor={id}
          className={`text-body-m-regular ${disabled ? 'text-neutral-300' : 'text-neutral-600'} ${labelClassName || ''}`}
        >
          {label}
        </label>
        )}

      </div>
      <span
        className={`text-body-s-regular mt-1 ${
          error ? 'text-danger-400' : 'text-neutral-400'
        }  ${hintTextClassName || ''}`}
      >
        {hint}
      </span>
    </div>
  )
}

export default Checkbox
