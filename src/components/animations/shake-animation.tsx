import { motion } from "framer-motion"
import React, { ReactNode, useEffect, useState } from "react"

interface ShakeAnimationProps {
  children: ReactNode
  disabled?: boolean
}

export const ShakeAnimation = ({ children, disabled }: ShakeAnimationProps) => {
  const [shakeKey, setShakeKey] = useState(0)

  const shakeAnimation = {
    x: [-7, 7, -7, 7, -7, 7, -7, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
    loop: Infinity,
  }

  useEffect(() => {
    if (disabled) return

    const interval = setInterval(() => {
      setShakeKey((prevKey) => prevKey + 1)
    }, 10000)

    return () => clearInterval(interval)
  }, [disabled])

  if (disabled) {
    return <div>{children}</div>
  }

  return (
    <motion.div key={shakeKey} animate={shakeAnimation}>
      {children}
    </motion.div>
  )
}
