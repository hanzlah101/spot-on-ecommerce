import confetti from "canvas-confetti"

export function triggerConfetti() {
  const end = Date.now() + 3 * 1000 // 3 seconds

  function frame() {
    if (Date.now() > end) return

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
    })
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
    })

    requestAnimationFrame(frame)
  }

  frame()
}
