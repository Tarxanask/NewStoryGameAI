import React, { useState, useEffect, useRef } from 'react'
import { relativeTimeFromFirstLog } from '@/lib/utilities'
import dayjs from 'dayjs'
import { useGame } from '@/context/Context'

function GamePlaybackTime() {
  const [playbackTime, setPlaybackTime] = useState('00:00')
  const intervalRef = useRef(null)
  const { gameLog, gameOver } = useGame()

  useEffect(() => {
    if (gameLog && gameLog.length > 0 && !gameOver) {
      intervalRef.current = setInterval(() => {
        setPlaybackTime(relativeTimeFromFirstLog(dayjs(), gameLog))
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameOver])
  return <span>{playbackTime}</span>
}

export default GamePlaybackTime
