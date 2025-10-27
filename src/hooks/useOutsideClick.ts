import { useEffect, RefObject } from 'react'

interface UseOutsideClick {
  ref?: RefObject<HTMLElement>
  callback: () => void
}

const useOutsideClick = (
  ref: UseOutsideClick['ref'],
  callback: UseOutsideClick['callback']
) => {
  const handleClick = (e: any) => {
    if (ref?.current && !ref.current.contains(e.target)) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}

export default useOutsideClick
