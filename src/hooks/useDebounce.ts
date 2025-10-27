import { useState, useEffect } from 'react'

const useDebounce = (
  value: string,
  milliSeconds: number,
  onDebounceEnd?: () => void
) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
      onDebounceEnd?.()
    }, milliSeconds)

    return () => {
      clearTimeout(handler)
    }
  }, [value, milliSeconds])

  return debouncedValue
}

export default useDebounce
