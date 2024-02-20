import Modal from 'react-modal'
import { useEffect, useState } from 'react'

Modal.setAppElement('#body-app')
const customStyles = {
  overlay: {
    backgroundColor: 'transparent',
    zIndex: 9999,
    top: 'calc(80vh)',
  },
  content: {
    inset: 0,
    border: 'unset',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'end',
    background: 'transparent',
  },
}

interface ToastProps {
  open: boolean
  message: string
  timeout?: number
  onClose?: () => void
}

export default function Toast({
  open, onClose, message, timeout = 3000,
}: ToastProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    onClose?.()
    setIsOpen(false)
  }

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  useEffect(() => {
    if (timeout && isOpen) {
      setTimeout(() => {
        handleClose()
      }, timeout)
    }
  }, [timeout, isOpen])

  if (isOpen) {
    return (
      <Modal
        isOpen
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className="margin-auto flex gap-4 items-center w-full max-w-[90vh] py-2 px-4 text-white bg-neutral-500 rounded-lg shadow-medium">
          <div className="text-sm font-medium">{message}</div>
          <button
            onClick={handleClose}
            type="button"
            className="text-xs ml-auto mr-0 cursor-pointer font-semibold"
            data-dismiss-target="#toast-default"
            aria-label="Close"
          >
            Tutup
          </button>
        </div>
      </Modal>
    )
  }
  return null
}
