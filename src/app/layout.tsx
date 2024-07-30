import "@/styles/globals.css"
import "@/styles/editor.css"
import type { Metadata } from "next"
import { Quicksand } from "next/font/google"

import { QueryProvider } from "@/providers/query-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ConfirmModal } from "@/components/confirm-modal"
import { UpdateUserModal } from "./(store)/_components/store-navbar/update-user-modal"
import { getSession } from "@/utils/auth"

const font = Quicksand({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await getSession()

  return (
    <html lang="en" className="dark">
      <body className={font.className}>
        <QueryProvider>
          <ThemeProvider>
            <Toaster richColors />
            <ConfirmModal />
            {children}
            {user ? <UpdateUserModal user={user} /> : null}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
