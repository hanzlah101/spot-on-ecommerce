import { create } from "zustand"

import { EditOrderSchema } from "@/utils/validations/order"

type InitialData = EditOrderSchema & {
  orderId: string
}

type EditOrderModalStore = {
  initialData?: InitialData
  isOpen: boolean
  onOpen: (_initialData: InitialData) => void
  onOpenChange: (_open: boolean) => void
}

export const useEditOrderModal = create<EditOrderModalStore>((set) => ({
  isOpen: false,
  onOpen: (initialData) => set({ isOpen: true, initialData }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
