// app/gameContext.js
import { createContext, useState, useContext } from 'react'
import { DIFFICULTY_LEVELS, LANGUAGES } from '@/lib/constants' // Import your difficulty levels from constants.js
import DOMPurify from 'dompurify'

// Initialize game state
const initialGameState = {
  hireability: 50,
  progress: [],
  outcome: null,
}

const defaultGameSettings = {
  language: LANGUAGES[0].key, // Default to the first language in the list
  difficulty: DIFFICULTY_LEVELS[0],
  default: true,
}

// Create the context
const GameContext = createContext()

// Create a custom hook to use the context
export const useGame = () => {
  return useContext(GameContext)
}

// Create a provider component
export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(initialGameState)
  const [currentStepData, setCurrentStepData] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gameLog, setGameLog] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [conclusion, setConclusion] = useState('')
  const [backLogMessages, setBackLogMessages] = useState([])
  const [gameSettings, setGameSettings] = useState(defaultGameSettings)

  // Functions to update game state and other relevant data
  const updateGameState = (newState) => {
    setGameState((prevGameState) => ({ ...prevGameState, ...newState }))
  }

  const updateCurrentStepData = (data) => {
    setCurrentStepData(data)
  }

  const updateUserInput = (input) => {
    setUserInput(input)
  }

  const updateLoading = (value) => {
    setLoading(value)
  }

  const updateError = (message) => {
    setError(message)
  }

  const addGameLogEntry = (entry) => {
    const temp = document.createElement('div')
    temp.innerHTML = DOMPurify.sanitize(entry.text)
    const logEntry = { ...entry, text: temp.textContent || '', timestamp: new Date() }
    setGameLog((prevLog) => [...prevLog, logEntry])
  }

  const addBackLogMessage = (message) => {
    setBackLogMessages((prevMessages) => [...prevMessages, message])
  }

  const setGameOverState = (value) => {
    setGameOver(value)
  }

  const setConclusionText = (text) => {
    setConclusion(text)
  }

  // const setGameLanguage = (language) => {
  //   setGameSettings((prevSettings) => ({
  //     ...prevSettings,
  //     lanaguage: language,
  //   }))
  // }

  // const setGameDifficulty = (difficulty) => {
  //   const difficultySettings =
  //     DIFFICULTY_LEVELS.find((level) => level.key === difficulty) || defaultGameSettings.difficulty
  //   setGameSettings((prevSettings) => ({
  //     ...prevSettings,
  //     difficulty: difficultySettings,
  //   }))
  // }

  const resetGame = () => {
    setGameState(initialGameState)
    setCurrentStepData(null)
    setUserInput('')
    setLoading(false)
    setError(null)
    setGameLog([])
    setGameStarted(false)
    setGameOver(false)
    setConclusion('')
    setBackLogMessages([])
  }

  const value = {
    gameState,
    setGameState: updateGameState,
    currentStepData,
    setCurrentStepData: updateCurrentStepData,
    userInput,
    setUserInput: updateUserInput,
    loading,
    setLoading: updateLoading,
    error,
    setError: updateError,
    gameLog,
    addGameLogEntry,
    gameOver,
    setGameOver: setGameOverState,
    conclusion,
    setConclusion: setConclusionText,
    resetGame,
    backLogMessages,
    setBackLogMessages,
    addBackLogMessage,
    gameSettings,
    setGameSettings,
    gameStarted,
    setGameStarted,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { GameContext, initialGameState, defaultGameSettings }
