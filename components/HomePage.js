'use client'

import { Select, SelectItem, Avatar } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useGame, defaultGameSettings } from '@/context/Context'
import { LANGUAGES, DIFFICULTY_LEVELS } from '@/lib/constants'

import { useRouter } from 'next/navigation'

const HomePage = () => {
  const { gameSettings, setGameSettings, addGameLogEntry } = useGame()

  const [selectedLanguage, setSelectedLanguage] = useState(gameSettings.language)
  const [selectedDifficulty, setSelectedDifficulty] = useState(gameSettings.difficulty.key)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startGame = (e) => {
    setLoading(true)
    e.preventDefault()
    const difficultySettings =
      DIFFICULTY_LEVELS.find((level) => level.key === selectedDifficulty) ||
      defaultGameSettings.difficulty
    setGameSettings({
      language: selectedLanguage,
      default: false,
      difficulty: difficultySettings,
    })

    addGameLogEntry({ type: 'story', text: `Game Difficulty set to ${difficultySettings.label}` })
    addGameLogEntry({ type: 'story', text: `Language set to ${selectedLanguage}` })
  }

  useEffect(() => {
    if (gameSettings.default !== true) {
      setTimeout(() => {
        router.push('/game')
      }, 2000)
    }
  }, [gameSettings])

  useEffect(() => {
    setGameSettings((prevSettings) => ({
      ...prevSettings,
      default: true,
    }))
  }, [])

  return (
    <>
      <div className="inner text-center flex-1">
        <div>
          <h1 className="title display-one font-bold">
            AI Generated
            <br className='hidden md:block' />
            <span className="header-caption theme-gradient "> Interactive </span> Story Game
          </h1>
          <p className="description ">
            You are <span className='text-primary'>Mike Ross</span>, an aspiring lawyer on your first interview at one of the biggest law
            firms in New York, this is your shot to make a name for yourself. <br /> Can you get
            Hired?
          </p>
        </div>
      </div>
      <form className="w-full h-52 text-center py-3" onSubmit={startGame}>
        <div className=" flex gap-10 justify-center ">
          <Select
            className=" flex-1 max-w-60"
            label="Choose difficulty"
            size="md"
            selectedKeys={[selectedDifficulty]}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem
                key={level.key}
                endContent={<i className={`fa-solid fa-${level.icon} text-2xl`}></i>}
              >
                {level.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            className=" flex-1 max-w-60"
            label="Choose language"
            size="md"
            selectedKeys={[selectedLanguage]}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <SelectItem
                key={lang.key}
                endContent={<Avatar alt={lang.label} className="w-6 h-6" src={lang.flag} />}
              >
                {lang.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="mt-8">
          <button className="btn-read-more p-6" type="submit" disabled={loading}>
            <span>
              Begin Game{' '}
              <i
                className={`fa-regular ms-3 ${
                  loading ? 'fa-yin-yang fa-spin ' : 'fa-gamepad-modern'
                }`}
              ></i>
            </span>
          </button>
        </div>
      </form>
    </>
  )
}

export default HomePage
