import React, { useEffect, useRef, useState } from 'react'

interface PopoverProps {
  children: React.ReactNode
  content?: React.ReactNode
  trigger?: 'click' | 'hover'
}

const Popover = ({ children, content, trigger = 'hover' }: PopoverProps) => {
  const [show, setShow] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const handleMouseOver = () => {
    if (trigger === 'hover') {
      setShow(true)
    }
  }

  const handleMouseLeft = () => {
    if (trigger === 'hover') {
      setShow(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current?.contains(event.target)) {
        setShow(false)
      }
    }

    if (show) {
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show, wrapperRef])

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeft}
      className="w-fit h-fit relative flex justify-center"
    >
      <div role="presentation" onClick={() => setShow(!show)}>
        {children}
      </div>
      <div
        hidden={!show}
        className="min-w-fit h-fit absolute bottom-[100%] z-20 transition-all"
      >
        <div className="rounded bg-slate-600 text-white p-1 shadow-sm mb-1">
          {content}
        </div>
      </div>
    </div>
  )
}

export default Popover
