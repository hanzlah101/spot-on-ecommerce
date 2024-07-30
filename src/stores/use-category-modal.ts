import { create } from "zustand"

import { CategorySchema } from "@/utils/validations/category"

type InitialData = CategorySchema & {
  categoryId: string
}

type CategoryModalStore = {
  initialData?: InitialData
  isOpen: boolean
  onOpen: (_initialData?: InitialData) => void
  onOpenChange: (_open: boolean) => void
}

export const useCategoryModal = create<CategoryModalStore>((set) => ({
  isOpen: false,
  onOpen: (initialData) => set({ isOpen: true, initialData }),
  onOpenChange: (open) => set({ isOpen: open }),
}))
