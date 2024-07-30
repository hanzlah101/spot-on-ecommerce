import { create } from "zustand"

import { VariantSchema } from "@/utils/validations/variant"

type InitialData = VariantSchema & {
  variantId: string
}

type VariantModalStore = {
  initialData?: InitialData
  isOpen: boolean
  onOpen: (_initialData?: InitialData) => void
  onOpenChange: (_open: boolean) => void
}

export const useVariantModal = create<VariantModalStore>((set) => ({
  isOpen: false,
  onOpen: (initialData) => set({ isOpen: true, initialData }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
