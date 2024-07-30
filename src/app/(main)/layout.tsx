import { type ReactNode, Suspense } from "react"

import { StoreNavbar } from "./_components/store-navbar"
import { StoreFooter } from "./_components/store-footer"
import { CartModal } from "./_components/cart-modal"
import { TrackOrderModal } from "./(store)/_components/track-order-modal"

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense>
        <main className="flex min-h-screen flex-col">
          <StoreNavbar />
          <div className="flex h-full flex-1 flex-col px-4 md:px-10">
            {children}
          </div>
        </main>
      </Suspense>
      <StoreFooter />
      <TrackOrderModal />
      <CartModal />
    </>
  )
}
