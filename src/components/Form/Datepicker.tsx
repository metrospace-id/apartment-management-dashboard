// import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
// import format from 'date-fns/format'
// import localeId from 'date-fns/locale/id'
import TWDatepicker from 'tailwind-datepicker-react'
import dayjs from 'dayjs'
import type { IOptions } from 'tailwind-datepicker-react/types/Options'

import useOutsideClick from 'hooks/useOutsideClick'
import {
  Calendar as IconCalendar,
  ArrowLeft as IconArrowLeft,
  ArrowRight as IconArrowRight,
} from 'components/Icons'
import Input, { InputProps } from './Input'

// const Input = dynamic(import('./Input'))

const options: IOptions = {
  title: '',
  autoHide: true,
  todayBtn: true,
  clearBtn: true,
  clearBtnText: 'Clear',
  maxDate: new Date('2030-01-01'),
  minDate: new Date('1950-01-01'),
  theme: {
    background:
      'bg-white dark:bg-slate-500 border border-neutral-100 shadow-low',
    todayBtn: '!btn-primary btn-s !w-full',
    clearBtn:
      '!btn-secondary btn-s !w-full bg-base-white dark:bg-base-white dark:hover:bg-base-white',
    icons:
      'text-base-white text-neutral-500 rounded-full bg-base-white hover:bg-primary-50 hover:text-neutral-500 dark:text-base-white dark:bg-base-white dark:text-neutral-500 dark:hover:bg-primary-50 dark:hover:text-neutral-500',
    text: 'bg-base-white text-neutral-600 hover:text-primary-500 hover:bg-primary-100 dark:bg-base-white dark:!text-neutral-600 dark:hover:bg-primary-100 dark:hover:text-primary-500',
    disabledText:
      'bg-base-white text-neutral-200 hover:text-neutral-50 hover:bg-primary-50 dark:bg-base-white dark:text-neutral-200 dark:hover:bg-primary-100 dark:hover:text-primary-500',
    input: '',
    inputIcon: '',
    selected:
      'text-base-white bg-primary-500 dark:text-base-white dark:bg-primary-500',
  },
  icons: {
    // () => ReactElement | JSX.Element
    prev: () => <IconArrowLeft />,
    next: () => <IconArrowRight />,
  },
  datepickerClassNames:
    'datepicker top-[68px] [&_.bg-primary-500]:!text-base-white [&_.text-neutral-200]:!text-neutral-200',
  language: 'id',
  disabledDates: [],
  weekDays: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  inputNameProp: 'date',
  inputIdProp: 'date',
  inputPlaceholderProp: 'Select Date',
  inputDateFormatProp: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
}

const isValidDate = (date: Date) => {
  if (Number.isNaN(date.getTime())) {
    return true
  }
  return false
}

interface DatepickerProps extends Omit<InputProps, 'onChange' | 'value'> {
  onChange?: (selectedDate: Date) => void
  value?: Date
  option?: IOptions
  disableFuture?: boolean
}

export default function DatePicker({
  id,
  onChange,
  value,
  option,
  disableFuture,
  ...props
}: DatepickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState('')
  const datePickerRef = useRef<HTMLDivElement | null>(null)
  const handleChange = (selectedDate: Date) => {
    onChange?.(selectedDate)
    setLocalValue(dayjs(selectedDate).format('D MMMM YYYY'))
  }

  const dateValue = value ? new Date(value) : new Date()
  const defaultDate = isValidDate(dateValue) ? dateValue : new Date()

  useOutsideClick(datePickerRef, () => setIsOpen(false))

  const handleClose = (state: boolean) => {
    setIsOpen(state)
  }

  const currDate = new Date()

  useEffect(() => {
    if (value) {
      setLocalValue(dayjs(value).format('D MMMM YYYY'))
    }
  }, [value])

  return (
    <div
      id={id}
      ref={datePickerRef}
    >
      <TWDatepicker
        options={{
          ...options,
          ...(option || {}),
          ...(disableFuture && { maxDate: currDate }),
          defaultDate,
        }}
        onChange={handleChange}
        show={isOpen}
        setShow={handleClose}
        value={value || new Date()}
        classNames="relative"
      >
        <Input
          {...props}
          value={localValue}
          rightIcon={<IconCalendar className="w-4 h-4 lg:w-5 lg:h-5" />}
          onFocus={() => setIsOpen(true)}
          readOnly
        />
      </TWDatepicker>
    </div>
  )
}
