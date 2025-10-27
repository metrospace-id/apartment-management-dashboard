export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Radio = ({ className, label, disabled, ...props }: RadioProps) => {
  let pointerClass = 'cursor-pointer'
  if (disabled) {
    pointerClass = 'cursor-not-allowed'
  }

  return (
    <div className={`flex items-center me-4 ${disabled ? 'opacity-70' : ''}`}>
      <input
        type="radio"
        disabled={disabled}
        className={`w-4 h-4 bg-gray-100 border-gray-300 outline-none dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 ${pointerClass} ${className}`}
        {...props}
      />
      <label className="ms-2 text-md font-medium text-slate-600 dark:text-white">
        {label}
      </label>
    </div>
  )
}

export default Radio
