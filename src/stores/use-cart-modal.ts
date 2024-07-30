import { create } from "zustand"

type CartModalStore = {
  isOpen: boolean
  onOpen: () => void
  onOpenChange: (_open: boolean) => void
}

export const useCartModal = create<CartModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
