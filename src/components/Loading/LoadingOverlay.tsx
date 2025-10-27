import Modal from 'react-modal'

import { Spinner as IconSpinner } from '../Icons'

Modal.setAppElement('#body-app')
const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'unset',
    background: 'transparent'
  }
}

const LoadingOverlay = () => (
  <Modal isOpen style={customStyles} contentLabel="Example Modal">
    <div className="flex justify-center items-center h-full pointer-events-none">
      <IconSpinner className="animate-spin text-primary" />
    </div>
  </Modal>
)

export default LoadingOverlay
