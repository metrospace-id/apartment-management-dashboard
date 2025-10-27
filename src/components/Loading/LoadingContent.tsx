import { Spinner as IconSpinner } from '../Icons'

interface LoadingContentProps {
  className?: string
}

export default function LoadingContent({
  className = ''
}: LoadingContentProps) {
  return (
    <div
      className={`flex justify-center items-center py-10 w-full pointer-events-none ${className}`}
    >
      <IconSpinner className="animate-spin text-primary" />
    </div>
  )
}
