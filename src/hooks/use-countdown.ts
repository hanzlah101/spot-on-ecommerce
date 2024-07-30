import { useState, useEffect, useRef } from "react"

export function useCountDown(key: string) {
  const initialTime = 0
  const [timeLeft, setTimeLeft] = useState<number>(initialTime)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const storageKey = `countdown:${key}`

  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey)
    if (savedTime) {
      setTimeLeft(parseInt(savedTime, 10))
    }
  }, [storageKey])

  useEffect(() => {
    if (timeLeft > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            timerRef.current = null
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timeLeft === 0 && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [timeLeft, storageKey])

  useEffect(() => {
    if (timeLeft > 0) {
      localStorage.setItem(storageKey, timeLeft.toString())
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [timeLeft, storageKey])

  const startCountDown = () => {
    if (timeLeft === 0) {
      setTimeLeft(60)
    }
  }

  const clearCountDown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTimeLeft(initialTime)
    localStorage.removeItem(storageKey)
  }

  return { timeLeft, startCountDown, clearCountDown }
}
