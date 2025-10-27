import { Spinner as IconSpinner } from '../Icons'

interface LoadingContentProps {
  className?: string
}

const LoadingContent = ({ className = '' }: LoadingContentProps) => (
  <div
    className={`flex justify-center items-center py-10 w-full pointer-events-none ${className}`}
  >
    <IconSpinner className="animate-spin text-primary" />
  </div>
)

export default LoadingContent
