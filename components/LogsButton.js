import { useGame } from '@/context/Context'
import {
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react'

import { relativeTimeFromFirstLog } from '@/lib/utilities'

const LogsButton = () => {
  const { gameLog } = useGame()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const logClassNames = (entry) => {
    switch (entry.type) {
      case 'user':
        return 'bold text-white font-semibold text-violet-400'
      case 'model':
        return 'text-cyan-400'
      case 'story':
        return 'text-neutral-500'
      case 'interpretation':
        return 'bg-sky-800 rounded-md p-2 font-light'
      case 'effect':
        return 'font-bold text-amber-500'
      default:
        return 'log-default'
    }
  }

  return (
    <>
      <Tooltip content="View Game Logs">
        <button className="btn-read-more mr-5" onClick={onOpen}>
          <i className="fa-light fa-circle-exclamation"></i>
        </button>
      </Tooltip>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Game Log</ModalHeader>
              <ModalBody>
                {gameLog.length
                  ? gameLog.map((logItem, index) => (
                      <div key={index} className="flex gap-4">
                        <span className="font-bold text-violet-50">
                          {' '}
                          {relativeTimeFromFirstLog(logItem.timestamp, gameLog)}{' '}
                        </span>
                        <span className={logClassNames(logItem)}> {logItem.text}</span>
                      </div>
                    ))
                  : 'No logs yet'}
              </ModalBody>
              <ModalFooter>
                <button onClick={onClose} className="btn-read-more">
                  Close
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default LogsButton
