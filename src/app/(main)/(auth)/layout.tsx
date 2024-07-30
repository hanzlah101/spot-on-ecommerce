import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="m-auto h-full w-full max-w-lg space-y-5 px-4 py-8">
      {children}
    </main>
  )
}
