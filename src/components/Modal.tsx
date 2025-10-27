import React from 'react'
import ReactModal from 'react-modal'

ReactModal.setAppElement('#body-app')

interface ModalProps {
  title?: string
  open?: boolean
  onClose?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export default function Modal({
  open = false,
  size = 'md',
  onClose,
  children,
  title
}: ModalProps) {
  let maxWidth = 'max-w-[90%] md:max-w-[50%]'
  if (size === 'md') {
    maxWidth = 'max-w-[90%] md:max-w-[70%]'
  } else if (size === 'lg') {
    maxWidth = 'max-w-[90%] md:max-w-[90%]'
  } else if (size === 'xs') {
    maxWidth = 'max-w-[90%] md:max-w-[400px]'
  }

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 9999
    }
  }

  return (
    <ReactModal
      isOpen={open}
      style={customStyles}
      contentLabel="Modal"
      onRequestClose={onClose}
      className={`w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute ${maxWidth} max-h-[90%] overflow-scroll no-scrollbar focus-visible:outline-none`}
    >
      <div className="h-full border rounded bg-white border-slate-100 focus-visible:outline-none dark:bg-black dark:border-slate-800">
        {title && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xl font-semibold text-slate-600 dark:text-white">
              {title}
            </p>
          </div>
        )}
        {children}
      </div>
    </ReactModal>
  )
}
