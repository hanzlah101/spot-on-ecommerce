import { PropsWithChildren } from "react"

export default function ResetPasswordLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col space-y-5 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Reset Password</h1>
        <p className="text-muted-foreground">
          Password reset will sign you out from other devices
        </p>
      </div>
      {children}
    </div>
  )
}
