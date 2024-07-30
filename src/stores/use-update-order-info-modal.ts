import { create } from "zustand"

type UpdateOrderInfoModalStore = {
  isOpen: boolean
  onOpen: () => void
  onOpenChange: (_open: boolean) => void
}

export const useUpdateOrderInfoModal = create<UpdateOrderInfoModalStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onOpenChange: (open) => set({ isOpen: open }),
  }),
)
