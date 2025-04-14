// app/page.js
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  generateStoryStep,
  interpretUserInput,
  generateConclusion,
  generateExitConfirmation,
  generateGameOpener,
} from '@/lib/model'
import { useGame } from '@/context/Context'
import {
  Progress,
  Skeleton,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { purifyText } from '@/lib/utilities'
import LogsButton from '@/components/LogsButton'
import GamePlaybackTime from '@/components/PlayBackTime'

export default function Home() {
  const {
    gameState,
    setGameState,
    currentStepData,
    setCurrentStepData,
    userInput,
    setUserInput,
    loading,
    setLoading,
    error,
    setError,
    addGameLogEntry,
    gameOver,
    gameLog,
    setGameOver,
    gameStarted,
    setGameStarted,
    conclusion,
    setConclusion,
    resetGame,
    gameSettings,
    backLogMessages,
    addBackLogMessage,
  } = useGame()

  const router = useRouter()

  const [storyOpener, setStoryOpener] = useState('')

  useEffect(() => {
    if (storyOpener) return
    setLoading(true)
    loadStoryOpener()
  }, [])

  const loadStoryOpener = async () => {
    const storyOpenerResponse = await generateGameOpener(gameSettings)
    setStoryOpener(storyOpenerResponse)
    setLoading(false)
  }

  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [exitConfirmation, setExitConfirmation] = useState({
    loading: false,
    title: 'You are standing up...',
    body: 'Harvey is reflecting on your interview. Please wait while we finalize the outcome.',
  })

  const fetchNextStep = async () => {
    setLoading(true)
    setError(null)
    const stepData = await generateStoryStep(gameState, gameSettings)
    // randomize the order of choices
    if (stepData && stepData.choices) {
      stepData.choices = stepData.choices.sort(() => Math.random() - 0.5)
    }
    if (stepData) {
      setCurrentStepData(stepData)
      addGameLogEntry({ type: 'model', text: stepData.story })
    } else {
      setError('Failed to fetch the next story step.')
      setGameOver(true)
    }
    setLoading(false)
  }

  const handleChoice = async (choiceIndex) => {
    if (!currentStepData || !currentStepData.choices || !currentStepData.choices[choiceIndex - 1]) {
      console.error('Invalid choice index')
      return
    }

    const selectedChoice = currentStepData.choices[choiceIndex - 1]
    const effect = parseInt(selectedChoice.effect, 10)

    setGameState({
      hireability: gameState.hireability + effect,
      progress: [
        ...gameState.progress,
        {
          narrator: currentStepData.story,
          player: selectedChoice.text,
        },
      ],
    })
    addBackLogMessage({ type: 'model', text: currentStepData.story })
    addBackLogMessage({ type: 'user', text: selectedChoice.text })
    addGameLogEntry({ type: 'user', text: `Chose: ${selectedChoice.text}` })
    addGameLogEntry({ type: 'effect', text: `Hireability changed by: ${effect}` })
    setCurrentStepData(null)
    setUserInput('')
  }

  const handleCustomInput = async () => {
    if (!userInput.trim()) return

    setLoading(true)
    setError(null)
    const interpretationData = await interpretUserInput(
      userInput,
      gameState,
      currentStepData ? currentStepData.story : '',
      gameSettings
    )

    if (interpretationData) {
      const effect = parseInt(interpretationData.effect, 10)
      setGameState({
        hireability: gameState.hireability + effect,
        progress: [
          ...gameState.progress,
          {
            narrator: currentStepData.story,
            player: userInput,
          },
        ],
      })
      addBackLogMessage({ type: 'model', text: currentStepData.story })
      addBackLogMessage({ type: 'user', text: userInput })
      addGameLogEntry({ type: 'user', text: `Typed: ${userInput}` })
      addGameLogEntry({
        type: 'interpretation',
        text: `Interpretation: ${interpretationData.reasoning}`,
      })
      addGameLogEntry({ type: 'effect', text: `Hireability changed by: ${effect}` })
      setUserInput('')
      setCurrentStepData(null)
    } else {
      setError('Failed to interpret your input.')
    }
    setLoading(false)
  }

  const fetchConclusion = async () => {
    setLoading(true)
    setError(null)
    const finalConclusion = await generateConclusion(gameState, gameSettings)
    addGameLogEntry({ type: 'story', text: 'Game eneded with conclusion' })
    addGameLogEntry({ type: 'model', text: finalConclusion })
    setConclusion(finalConclusion)
    setLoading(false)
  }

  const onExitAttempt = async () => {
    onOpen()
    if (gameOver) {
      setExitConfirmation({
        loading: false,
        title: 'You are standing up...',
        body: 'You gave it your best, feel free to play replay with a different difficulty level or perhaps a different language.',
      })
      return
    } else if (!gameStarted) {
      setExitConfirmation({
        loading: false,
        title: 'You turned around...',
        body: 'Donna: are you really leaving without giving this a shot? WOW!',
      })
      return
    }
    setExitConfirmation({
      loading: true,
      title: 'You are standing up...',
      body: 'Harvey is reflecting on your interview. Please wait while we finalize the outcome.',
    })
    const confirmationResponse = await generateExitConfirmation(gameState, gameSettings)
    setExitConfirmation((prevState) => ({
      ...confirmationResponse,
      loading: false,
    }))
  }

  const handleInputChange = (event) => {
    setUserInput(event.target.value)
  }

  const initGame = async () => {
    try {
      setLoading(true)
      setError(null)
      // update progress
      setGameState({
        progress: [
          ...gameState.progress,
          {
            narrator: storyOpener,
            player: 'Open door',
          },
        ],
      })
      setGameStarted(true)
      addBackLogMessage({ type: 'model', text: storyOpener })
      addBackLogMessage({ type: 'user', text: 'Opened the door' })
      addGameLogEntry({ type: 'user', text: 'Chose: Opened the door' })
    } catch (e) {
      console.log(e)
    }
  }

  const restartGame = async () => {
    // if (!gameStarted) {
    //   return
    // }
    // resetGame()
    // initGame()

    window.location.href = '/'
  }

  // auto scroll story container
  const storyRef = useRef(null)

  useEffect(() => {
    if (storyRef.current) {
      const paragraphs = storyRef.current.querySelectorAll('.story-text')
      const lastParagraph = paragraphs[paragraphs.length - 1]

      if (lastParagraph) {
        const { top } = lastParagraph.getBoundingClientRect()
        const { top: containerTop } = storyRef.current.getBoundingClientRect()
        const offset = 20

        storyRef.current.scrollTo({
          top: storyRef.current.scrollTop + (top - containerTop) - offset,
          behavior: 'smooth',
        })
      }
    }
  }, [backLogMessages, currentStepData, conclusion])

  // Core game logic
  useEffect(() => {
    if (gameState.progress.length == 0) {
      return
    }
    if (!gameOver && !gameState.outcome) {
      if (gameState.progress.length + 1 >= gameSettings.difficulty.maxSteps) {
        setGameOver(true)
        const outcome =
          gameState.hireability > gameSettings.difficulty.hiringThreshold ? 'Hired' : 'Rejected'
        setGameState({ outcome })
      } else {
        fetchNextStep()
      }
    } else {
      fetchConclusion()
    }
  }, [gameState, gameOver])

  return (
    <div className="game-container">
      {error && <p className="">Error: {error}</p>}

      <div className="game-area">
        <div className="game-header flex flex-wrap items-center mb-4 bg-black/30 backdrop-blur-sm md:bg-transparent">
          <div className="w-1/3 md:w-1/4">
            <Tooltip content="Return Home">
              <button className="btn-read-more mr-2 md:mr-5" onClick={onExitAttempt}>
                <i className="fa-light fa-home"></i>
              </button>
            </Tooltip>

            <LogsButton />
          </div>
          <div className="hidden md:inline-block md:w-1/2 text-left md:text-center">
            <h2 className="text-md md:text-xl font-bold">Can you get hired?</h2>
            {gameLog.length ? <GamePlaybackTime /> : '00:00'}
          </div>
          <div className="w-2/3 md:w-1/4">
            {/* TODO: Different colors for progress based on level */}
            <Progress
              classNames={{
                base: 'min-w-[300px] hidden md:inline-block',
                track: 'drop-shadow-lg',
                indicator: 'bg-gradient-to-r from-fuchsia-800 to-violet-500',
                label: 'tracking-wider font-medium text-default-600 mb-1',
              }}
              label="Chance of getting hired"
              radius="md"
              showValueLabel={true}
              size="md"
              value={gameState.hireability}
            />
            <Progress
              classNames={{
                base: 'min-w-[200px] md:hidden',
                track: 'drop-shadow-lg',
                indicator: 'bg-gradient-to-r from-fuchsia-800 to-violet-500',
                label: 'tracking-wider font-medium text-default-600',
              }}
              label="Chance of getting hired"
              radius={false}
              showValueLabel={true}
              size="sm"
              value={gameState.hireability}
            />
          </div>
        </div>
        <div
          className={`game-body overflow-y-auto max-h-[calc(100dvh-300px)] md:max-h-[calc(100dvh-450px)]`}
          ref={storyRef}
        >
          {gameStarted ? (
            <div>
              {/* Animate older steps */}
              <AnimatePresence>
                {backLogMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, color: '#bcc3d7' }}
                    animate={{
                      opacity: 0.7,
                      color:
                        message.type === 'user'
                          ? '#c4b5fd'
                          : message.type === 'model'
                          ? '#a78bfa'
                          : '',
                    }}
                    exit={{ opacity: 0, y: -10 }} // Fade out when removed
                    transition={{ duration: 0.5 }}
                    className={`mb-2 story-text`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: purifyText(message.text),
                      }}
                    ></div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Animate current step */}
              <AnimatePresence>
                {currentStepData && (
                  <motion.div
                    key={currentStepData.story} // Ensure animation on new text
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className=" story-text"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: purifyText(currentStepData.story),
                      }}
                    ></div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conclusion  */}
              <AnimatePresence>
                {gameOver && gameState.outcome && (
                  <motion.div
                    key={conclusion} // Ensure animation on new text
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-2 story-text"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: purifyText(conclusion),
                      }}
                    ></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div>
              <AnimatePresence>
                <motion.div
                  key={storyOpener} // Ensure animation on new text
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="story-text"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: purifyText(storyOpener),
                    }}
                  ></div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="game-footer">
          <AnimatePresence>
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
              >
                <Skeleton className="h-3 w-4/5 rounded-lg custom-skeleton" />
                <Skeleton className="h-3 w-3/5 rounded-lg custom-skeleton mt-2" />
                <Skeleton className="h-3 w-2/5 rounded-lg custom-skeleton mt-2" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="choices md:mt-4">
            <AnimatePresence>
              {!gameOver &&
                gameState.outcome === null &&
                currentStepData &&
                currentStepData.choices.map((choice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="choice"
                  >
                    <a
                      className="btn-read-more text-ellipsis"
                      role="button"
                      onClick={() => handleChoice(index + 1)}
                    >
                      <span>{choice.text}</span>
                    </a>
                  </motion.div>
                ))}
            </AnimatePresence>

            <AnimatePresence>
              {!gameStarted && !gameOver && (
                <motion.div
                  className="start-game"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: 'easeInOut', delay: 2 },
                  }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.5, ease: 'easeInOut' } }}
                >
                  <button
                    className="btn-read-more"
                    onClick={initGame}
                    disabled={loading || gameStarted}
                  >
                    Open the door <i className="fa-light fa-door-open ml-2"></i>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {gameOver && gameState.outcome ? (
                <motion.div
                  className="start-game"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: 'easeInOut', delay: 2 }}
                >
                  <h4 className="p-1">
                    <span className="font-bold"> {gameState.outcome} </span> in <GamePlaybackTime />s
                  </h4>
                  <button className="btn-read-more" onClick={restartGame} disabled={!gameOver}>
                    Start a new game <i className="fa-light fa-rotate-left ml-2"></i>
                  </button>
                </motion.div>
              ) : (
                ''
              )}
            </AnimatePresence>
            <div className="mt-2 md:mt-5">
              <div className="response-form border-gradient">
                <Tooltip
                  content={
                    gameStarted
                      ? 'Type your response'
                      : gameOver
                      ? 'Start a new game to use this'
                      : 'After opening the door you may use this to interact'
                  }
                >
                  <input
                    placeholder="You can type a response..."
                    onChange={handleInputChange}
                    readOnly={!gameStarted || gameOver || loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomInput()
                      }
                    }}
                    value={userInput}
                  />
                </Tooltip>
                <div className="left-icons">
                  <Tooltip content="Record your response">
                    <button className="form-icon icon-mic" disabled={!gameStarted}>
                      <i className="fa-regular fa-waveform-lines"></i>
                    </button>
                  </Tooltip>
                </div>
                <div className="right-icons">
                  <Tooltip content="Send response">
                    <button
                      className="form-icon icon-send"
                      onClick={handleCustomInput}
                      type="button"
                      disabled={loading || gameOver || !gameStarted}
                    >
                      <i className="fa-sharp fa-solid fa-paper-plane-top"></i>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{exitConfirmation.title}</ModalHeader>
              <ModalBody>{exitConfirmation.body}</ModalBody>
              <ModalFooter>
                <button onClick={onClose}>Sit back</button>
                <button
                  className="btn-read-more"
                  onClick={restartGame}
                  disabled={exitConfirmation.loading}
                >
                  {exitConfirmation.loading ? 'Wait a sec...' : "I'll Leave"}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
