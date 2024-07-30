import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useModifiedUrl } from "./use-modified-url"

export function useStepper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = Number(searchParams.get("step") ?? "0")

  const { modifyUrl } = useModifiedUrl()

  const nextStep = useCallback(() => {
    const step = currentStep + 1
    const url = modifyUrl({ step })
    router.push(url)
  }, [currentStep, modifyUrl, router])

  const prevStep = useCallback(() => {
    const step = Math.max(currentStep - 1, 0)
    const url = modifyUrl({ step })
    router.push(url)
  }, [currentStep, modifyUrl, router])

  const setStep = useCallback(
    (newStep: number) => {
      const step = Math.max(newStep, 0)
      const url = modifyUrl({ step })
      router.push(url)
    },
    [modifyUrl, router],
  )

  return { currentStep, nextStep, prevStep, setStep }
}
