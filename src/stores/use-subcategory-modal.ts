import { create } from "zustand"

import { SubcategorySchema } from "@/utils/validations/category"

type InitialData = SubcategorySchema & {
  subcategoryId: string
}

type SubcategoryModalStore = {
  initialData?: InitialData
  isOpen: boolean
  onOpen: (_initialData?: InitialData) => void
  onOpenChange: (_open: boolean) => void
}

export const useSubcategoryModal = create<SubcategoryModalStore>((set) => ({
  isOpen: false,
  onOpen: (initialData) => set({ isOpen: true, initialData }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
